import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_FILE_KEY = "idxJ16KR5Mo9X1qLLw2z5I";
const API_BASE = "https://api.figma.com";

async function main() {
  const env = await readDotEnv();
  const token = process.env.FIGMA_TOKEN || env.FIGMA_TOKEN;
  const fileKey = process.argv[2] || process.env.FIGMA_FILE_KEY || env.FIGMA_FILE_KEY || DEFAULT_FILE_KEY;

  if (!token) {
    throw new Error("FIGMA_TOKEN is missing. Put it into .env or export it in the shell.");
  }

  const outputRoot = path.resolve("local", "figma", fileKey);
  const metadataDir = path.join(outputRoot, "metadata");
  const previewsDir = path.join(outputRoot, "previews");
  const logoDir = path.join(outputRoot, "logos");
  await fs.mkdir(metadataDir, { recursive: true });
  await fs.mkdir(previewsDir, { recursive: true });
  await fs.mkdir(logoDir, { recursive: true });

  const api = createFigmaClient(token);
  const fetchedAt = new Date().toISOString();

  const file = await api.json(`/v1/files/${fileKey}?geometry=paths`);
  await writeJson(path.join(metadataDir, "file.geometry-paths.json"), file);

  const [imageFills, styles, components, componentSets] = await Promise.all([
    api.optionalJson(`/v1/files/${fileKey}/images`),
    api.optionalJson(`/v1/files/${fileKey}/styles`),
    api.optionalJson(`/v1/files/${fileKey}/components`),
    api.optionalJson(`/v1/files/${fileKey}/component_sets`),
  ]);

  await writeJson(path.join(metadataDir, "image-fills.json"), imageFills);
  await writeJson(path.join(metadataDir, "styles.json"), styles);
  await writeJson(path.join(metadataDir, "components.json"), components);
  await writeJson(path.join(metadataDir, "component-sets.json"), componentSets);

  const nodeIndex = indexNodes(file.document);
  await writeJson(path.join(metadataDir, "node-index.json"), nodeIndex);

  const topLevelFrames = collectTopLevelFrames(file.document);
  await exportNodes(api, fileKey, topLevelFrames, previewsDir, "png", { scale: "1" });

  const logoNodes = nodeIndex.nodes.filter(
    (node) =>
      /логотип|logo/i.test(node.name || "") ||
      /\/ логотипы( \/|$)/i.test(node.path || "") ||
      (node.type === "TEXT" && /finplan/i.test(node.characters || "")),
  );
  await writeJson(path.join(metadataDir, "logo-node-candidates.json"), logoNodes);
  await exportNodes(api, fileKey, logoNodes.filter((node) => node.type !== "TEXT").slice(0, 40), logoDir, "svg", {
    svg_include_id: "false",
  });

  const manifest = {
    fileKey,
    name: file.name,
    lastModified: file.lastModified,
    schemaVersion: file.schemaVersion,
    editorType: file.editorType,
    thumbnailUrl: file.thumbnailUrl,
    role: file.role,
    fetchedAt,
    source: `${API_BASE}/v1/files/${fileKey}`,
    counts: {
      nodes: nodeIndex.nodes.length,
      topLevelFrames: topLevelFrames.length,
      logoNodeCandidates: logoNodes.length,
    },
    directories: {
      metadata: path.relative(outputRoot, metadataDir),
      previews: path.relative(outputRoot, previewsDir),
      logos: path.relative(outputRoot, logoDir),
    },
  };
  await writeJson(path.join(outputRoot, "manifest.json"), manifest);
  await writeReadme(outputRoot, manifest);

  console.log(`Cached Figma file "${file.name}" to ${path.relative(process.cwd(), outputRoot)}`);
  console.log(`Nodes: ${manifest.counts.nodes}; top-level previews: ${manifest.counts.topLevelFrames}; logo candidates: ${manifest.counts.logoNodeCandidates}`);
}

async function readDotEnv() {
  try {
    const raw = await fs.readFile(".env", "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
        }),
    );
  } catch {
    return {};
  }
}

function createFigmaClient(token) {
  async function request(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "X-Figma-Token": token },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = data?.err || data?.message || response.statusText;
      throw new Error(`Figma ${endpoint} failed with HTTP ${response.status}: ${message}`);
    }

    return data;
  }

  return {
    json: request,
    async optionalJson(endpoint) {
      try {
        return await request(endpoint);
      } catch (error) {
        return {
          unavailable: true,
          endpoint,
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

function indexNodes(root) {
  const nodes = [];

  function walk(node, pathParts = []) {
    const nextPath = [...pathParts, node.name || node.id];
    nodes.push({
      id: node.id,
      name: node.name,
      type: node.type,
      path: nextPath.join(" / "),
      visible: node.visible !== false,
      absoluteBoundingBox: node.absoluteBoundingBox,
      characters: node.type === "TEXT" ? node.characters : undefined,
    });

    for (const child of node.children || []) {
      walk(child, nextPath);
    }
  }

  walk(root);
  return { nodes };
}

function collectTopLevelFrames(document) {
  const exportable = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "SECTION"]);
  const frames = [];

  for (const page of document.children || []) {
    for (const child of page.children || []) {
      if (exportable.has(child.type) && child.visible !== false) {
        frames.push({
          id: child.id,
          name: child.name,
          type: child.type,
          path: `${page.name} / ${child.name}`,
          absoluteBoundingBox: child.absoluteBoundingBox,
        });
      }
    }
  }

  return frames;
}

async function exportNodes(api, fileKey, nodes, outDir, format, params = {}) {
  if (nodes.length === 0) return;

  const batches = chunk(nodes, 35);
  for (const batch of batches) {
    const search = new URLSearchParams({
      ids: batch.map((node) => node.id).join(","),
      format,
      ...params,
    });
    const result = await api.optionalJson(`/v1/images/${fileKey}?${search.toString()}`);
    if (!result.images) {
      await writeJson(path.join(outDir, `export-error-${Date.now()}.json`), result);
      continue;
    }

    await Promise.all(
      batch.map(async (node) => {
        const url = result.images[node.id];
        if (!url) return;
        const response = await fetch(url);
        if (!response.ok) return;
        const bytes = new Uint8Array(await response.arrayBuffer());
        const filename = `${safeFilename(node.name)}--${node.id.replace(":", "_")}.${format}`;
        await fs.writeFile(path.join(outDir, filename), bytes);
      }),
    );
  }
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function safeFilename(value) {
  return String(value || "node")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function writeJson(filename, data) {
  await fs.writeFile(filename, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeReadme(outputRoot, manifest) {
  const body = `# Figma Cache: ${manifest.name}

Generated at: ${manifest.fetchedAt}

File key: \`${manifest.fileKey}\`
Last modified: \`${manifest.lastModified}\`

Contents:

- \`manifest.json\` - cache summary.
- \`metadata/file.geometry-paths.json\` - full Figma file payload with vector geometry paths.
- \`metadata/node-index.json\` - flattened node lookup with ids, paths, bounds and text content.
- \`metadata/image-fills.json\` - image fill references from Figma.
- \`metadata/styles.json\`, \`metadata/components.json\`, \`metadata/component-sets.json\` - additional Figma metadata when available.
- \`previews/\` - exported PNG previews for top-level frames.
- \`logos/\` - exported SVG candidates for logo/FinPlan nodes.

This cache intentionally does not contain \`FIGMA_TOKEN\`.
Refresh with:

\`\`\`bash
bun run cache:figma
\`\`\`
`;
  await fs.writeFile(path.join(outputRoot, "README.md"), body, "utf8");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
