import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import ExcelJS from "exceljs";
import { copyContext } from "./copy-context.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const messagesPath = path.join(root, "src/i18n/messages.ts");
export const HEADERS = {
  key: "Ключ (не менять)",
  original: "Текущий текст",
  replacement: "Новый текст",
  status: "Статус",
};
export const STATUSES = ["Не начато", "В работе", "На согласовании", "Согласовано", "Без изменений"];
export const SHEETS = { RU: "ru", EN: "en" };

// Parse literal positions without executing the catalog or reprinting the file.
export function readCatalog(source) {
  const ast = ts.createSourceFile("messages.ts", source, ts.ScriptTarget.Latest, true);
  if (ast.parseDiagnostics.length) throw new Error("messages.ts содержит синтаксические ошибки");
  const catalogs = {};
  const unwrap = (node) => {
    while (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) node = node.expression;
    return node;
  };
  function walk(node, prefix, output) {
    node = unwrap(node);
    if (!ts.isObjectLiteralExpression(node)) throw new Error(`Ожидался объект: ${prefix}`);
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property) || !property.name || !(
        ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) || ts.isNumericLiteral(property.name)
      )) throw new Error(`Неподдерживаемое свойство: ${prefix}`);
      const key = prefix ? `${prefix}.${property.name.text}` : property.name.text;
      const value = unwrap(property.initializer);
      if (ts.isObjectLiteralExpression(value)) walk(value, key, output);
      else {
        if (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value)) throw new Error(`Ожидалась строка: ${key}`);
        if (output.has(key)) throw new Error(`Повтор ключа: ${key}`);
        output.set(key, { text: value.text, start: value.getStart(ast), end: value.end,
          line: ast.getLineAndCharacterOfPosition(value.getStart(ast)).line + 1 });
      }
    }
  }
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && ["ru", "en"].includes(declaration.name.text)) {
        const entries = new Map();
        walk(declaration.initializer, "", entries);
        catalogs[declaration.name.text] = entries;
      }
    }
  }
  if (!catalogs.ru || !catalogs.en) throw new Error("Не найдены словари ru/en");
  for (const locale of ["ru", "en"]) {
    const other = locale === "ru" ? "en" : "ru";
    for (const key of catalogs[locale].keys()) {
      if (!catalogs[other].has(key)) throw new Error(`Ключ ${key} отсутствует в ${other}`);
    }
  }
  return catalogs;
}

export function placeholders(text) {
  const tokens = [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
  if (/[{}]/.test(text.replace(/\{\{\w+\}\}/g, ""))) throw new Error("Некорректные фигурные скобки. Используйте {{name}} без пробелов");
  return tokens;
}

export function buildPatch(source, rows) {
  const catalogs = readCatalog(source);
  const seen = new Set();
  const changes = [];
  const errors = [];
  let pending = 0;
  for (const row of rows) {
    const label = `${row.locale}:${row.key} (${row.location ?? "строка"})`;
    const entry = catalogs[row.locale]?.get(row.key);
    if (!entry) { errors.push(`${label}: неизвестный ключ или язык`); continue; }
    if (seen.has(`${row.locale}:${row.key}`)) { errors.push(`${label}: повтор ключа`); continue; }
    seen.add(`${row.locale}:${row.key}`);
    if (!STATUSES.includes(row.status)) { errors.push(`${label}: неизвестный статус`); continue; }
    if (typeof row.original !== "string" || typeof row.replacement !== "string") {
      errors.push(`${label}: требуется обычный текст`); continue;
    }
    if (row.status === "Без изменений" && row.replacement && row.replacement !== row.original) {
      errors.push(`${label}: новый текст противоречит статусу «Без изменений»`); continue;
    }
    if (row.status !== "Согласовано") {
      if (row.replacement && row.replacement !== row.original) pending++;
      continue;
    }
    if (!row.replacement.trim()) { errors.push(`${label}: согласованный текст пуст`); continue; }
    if (entry.text === row.replacement) continue; // Re-import is a no-op.
    if (entry.text !== row.original) { errors.push(`${label}: исходный текст изменился в коде или таблице`); continue; }
    try {
      if (JSON.stringify(placeholders(entry.text)) !== JSON.stringify(placeholders(row.replacement))) {
        throw new Error("Изменён набор или количество переменных {{name}}");
      }
    } catch (error) { errors.push(`${label}: ${error.message}`); continue; }
    changes.push({ ...entry, locale: row.locale, key: row.key, replacement: row.replacement });
  }
  if (errors.length) throw new Error(errors.join("\n"));
  let result = source;
  for (const change of [...changes].sort((a, b) => b.start - a.start)) {
    result = result.slice(0, change.start) + JSON.stringify(change.replacement) + result.slice(change.end);
  }
  const updated = readCatalog(result);
  for (const locale of ["ru", "en"]) {
    if (!changes.some((change) => change.locale === locale && /^planExport\.(forecastSheet|goalsSheet)$/.test(change.key))) continue;
    const names = ["planExport.forecastSheet", "planExport.goalsSheet"].map((key) => updated[locale].get(key).text);
    if (names.some((name) => name.length > 31 || [...name].some((char) => ":\\/?*[]".includes(char)) || /^'|'$/.test(name)) || names[0].toLowerCase() === names[1].toLowerCase()) {
      throw new Error(`${locale}: имена листов экспорта должны различаться, быть не длиннее 31 символа и не содержать : \\ / ? * [ ] или апостроф по краям`);
    }
  }
  return { source: result, changes, pending };
}

function cellText(cell) {
  const value = cell.value;
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && Array.isArray(value.richText)) return value.richText.map((part) => part.text).join("");
  throw new Error(`${cell.address}: требуется текст, формулы и числа не импортируются`);
}

export async function readWorkbookRows(filename) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filename);
  const rows = [];
  let found = false;
  for (const [name, locale] of Object.entries(SHEETS)) {
    const sheet = workbook.getWorksheet(name);
    if (!sheet) continue;
    found = true;
    let headerRow;
    let columns;
    for (let index = 1; index <= Math.min(20, sheet.rowCount); index++) {
      const row = sheet.getRow(index);
      const candidate = {};
      row.eachCell((cell, column) => {
        const field = Object.keys(HEADERS).find((key) => HEADERS[key] === cell.value);
        if (field) {
          if (candidate[field]) throw new Error(`${name}: повтор столбца ${HEADERS[field]}`);
          candidate[field] = column;
        }
      });
      if (Object.keys(candidate).length === Object.keys(HEADERS).length) {
        headerRow = index;
        columns = candidate;
        break;
      }
    }
    if (!headerRow) throw new Error(`${name}: не найдены заголовки импорта`);
    for (let index = headerRow + 1; index <= sheet.rowCount; index++) {
      const values = Object.fromEntries(Object.entries(columns).map(([field, column]) => [field, cellText(sheet.getCell(index, column))]));
      if (Object.values(values).every((value) => value === "")) continue;
      rows.push({ locale, location: `${name}!${index}`, ...values });
    }
  }
  if (!found || !rows.length) throw new Error("Нет строк на листах RU/EN");
  return rows;
}

async function main(args) {
  const source = await fs.readFile(messagesPath, "utf8");
  if (args.length === 1 && args[0] === "catalog") {
    const catalogs = readCatalog(source);
    console.log(JSON.stringify([...catalogs.ru].map(([key, value]) => ({
      key, ru: value.text, en: catalogs.en.get(key).text, line: value.line, enLine: catalogs.en.get(key).line,
      placeholders: placeholders(value.text),
      ...copyContext(key),
    })), null, 2));
    return;
  }
  if (args[0] !== "import" || !args[1] || args.length > 3 || (args[2] && args[2] !== "--write")) {
    throw new Error("Использование: node scripts/copy-workbook.mjs catalog | import <file.xlsx> [--write]");
  }
  const result = buildPatch(source, await readWorkbookRows(args[1]));
  for (const change of result.changes) {
    console.log(`${change.locale}:${change.key}\n- ${JSON.stringify(change.text)}\n+ ${JSON.stringify(change.replacement)}\n`);
  }
  console.log(`Согласованных изменений: ${result.changes.length}. Несогласованных правок пропущено: ${result.pending}.`);
  if (args[2] === "--write" && result.changes.length) {
    if (await fs.readFile(messagesPath, "utf8") !== source) throw new Error("messages.ts изменился во время импорта. Повторите проверку");
    await fs.writeFile(messagesPath, result.source);
    console.log("Обновлён src/i18n/messages.ts. Проверьте git diff и выполните bun run typecheck.");
  } else console.log("Файлы не изменены. Для применения добавьте --write.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
