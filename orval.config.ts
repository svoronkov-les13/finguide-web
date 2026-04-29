import { defineConfig } from "orval";

export default defineConfig({
  finguide: {
    input: "./openapi/finguide.openapi.json",
    output: {
      target: "./src/shared/api/generated/finguide.ts",
      schemas: "./src/shared/api/generated/model",
      client: "fetch",
      mode: "split",
      clean: true,
      prettier: true,
      baseUrl: {
        runtime: "apiBaseUrl",
        imports: [{ name: "apiBaseUrl", importPath: "../baseUrl" }],
      },
      override: {
        header: false,
      },
    },
  },
});
