import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPatch, readCatalog, placeholders } from "./copy-workbook.mjs";

const source = `// Preserve formatting and comments.
export const ru = { common: { title: "Привет, {{name}}!", close: "Закрыть" } } as const;
export const en = { common: { title: "Hello, {{name}}!", close: "Close" } } satisfies DictionaryShape<typeof ru>;
type DictionaryShape<T> = { [K in keyof T]: unknown };
`;
const row = (values = {}) => ({ locale: "ru", key: "common.title", original: "Привет, {{name}}!",
  replacement: "Здравствуйте, {{name}}!", status: "Согласовано", ...values });

test("imports both languages by key, preserves other source text and supports repeated imports", () => {
  const rows = [row({ locale: "en", original: "Hello, {{name}}!", replacement: "Welcome, {{name}}!" }), row()];
  const result = buildPatch(source, rows);
  assert.equal(result.changes.length, 2);
  assert.equal(result.source, source.replace('"Привет, {{name}}!"', '"Здравствуйте, {{name}}!"').replace('"Hello, {{name}}!"', '"Welcome, {{name}}!"'));
  assert.equal(buildPatch(result.source, rows).changes.length, 0);
});

test("blank drafts and unsanctioned text never change the catalog", () => {
  for (const status of ["Не начато", "В работе", "На согласовании"]) {
    assert.equal(buildPatch(source, [row({ status, replacement: "" })]).source, source);
    assert.equal(buildPatch(source, [row({ status })]).pending, 1);
  }
  assert.equal(buildPatch(source, [row({ status: "Без изменений", replacement: "" })]).source, source);
});

test("rejects stale originals, duplicates, unknown keys/locales, conflicting statuses and blank approvals", () => {
  const invalid = [
    [row({ original: "old" })], [row(), row()], [row({ key: "common.missing" })],
    [row({ locale: "xx" })], [row({ status: "Done" })], [row({ status: "Без изменений" })],
    [row({ replacement: " \n" })], [row({ replacement: 42 })],
  ];
  for (const rows of invalid) assert.throws(() => buildPatch(source, rows));
});

test("rejects missing, added, renamed, duplicated and malformed placeholders", () => {
  for (const replacement of ["Здравствуйте!", "{{person}}", "{{name}} {{extra}}", "{{name}} {{name}}", "{{ name }}", "{{name}} {x}"]) {
    assert.throws(() => buildPatch(source, [row({ replacement })]));
  }
  assert.deepEqual(placeholders("{{b}}: {{a}}"), ["a", "b"]);
});

test("writes quotes, newlines, backslashes and code-like text as literal text", () => {
  const replacement = '"{{name}}"\nC:\\new\\file process.exit() `text`';
  const result = buildPatch(source, [row({ replacement })]);
  assert.equal(readCatalog(result.source).ru.get("common.title").text, replacement);
});

test("rejects asymmetric and non-literal catalogs", () => {
  assert.throws(() => readCatalog(source.replace('close: "Close"', 'other: "Close"')));
  assert.throws(() => readCatalog(source.replace('"Закрыть"', 'getValue()')));
});

test("protects localized worksheet names used by the app export", () => {
  const withExport = source.replaceAll('common: {', 'planExport: { forecastSheet: "Forecast", goalsSheet: "Goals" }, common: {');
  for (const replacement of ["Goals", "GOALS", "Bad/name", "X".repeat(32), "'Forecast"]) {
    assert.throws(() => buildPatch(withExport, [row({ key: "planExport.forecastSheet", original: "Forecast", replacement })]));
  }
  assert.equal(buildPatch(withExport, [row({ key: "planExport.forecastSheet", original: "Forecast", replacement: "Прогноз" })]).changes.length, 1);
});
