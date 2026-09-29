/** The display name is shared by UI copy, HTML metadata, the manifest and exports. */
export const brand = {
  name: "Finiq",
} as const;

export function planExportFilename() {
  const safeName = [...brand.name].map((char) => char.charCodeAt(0) < 32 || /[<>:"/\\|?*]/.test(char) ? "-" : char).join("");
  return `${safeName}-plan.xlsx`;
}
