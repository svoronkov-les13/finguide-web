import { brand } from "./brand";
import { translate } from "../i18n/translate";

export function appManifest() {
  return {
    name: brand.name,
    short_name: brand.name,
    description: translate("ru", "app.description"),
    lang: "ru",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#1b0e26",
    icons: [
      { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
      { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

export function localizeHtml(html: string) {
  const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
  return html.replace("__APP_TITLE__", escape(translate("ru", "app.documentTitle")))
    .replace("__APP_DESCRIPTION__", escape(translate("ru", "app.description")));
}
