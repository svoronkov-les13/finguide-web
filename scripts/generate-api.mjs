import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url);
const result = spawnSync("bunx", ["orval", "--config", "./orval.config.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const target = new URL("../src/shared/api/generated/finguide.ts", import.meta.url);
const source = readFileSync(target, "utf8");
const withQueryParams = source.replaceAll(
  "Object.entries(params || {}).forEach(([key, value]) => {\n\n\n  });",
  "Object.entries(params || {}).forEach(([key, value]) => {\n    if (value !== undefined && value !== null) {\n      normalizedParams.append(key, String(value));\n    }\n  });",
);

writeFileSync(target, withQueryParams);
