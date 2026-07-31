import js from "@eslint/js";
import globals from "globals";
import i18next from "eslint-plugin-i18next";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      i18next,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // i18n hard rule: hardcoded literals are forbidden in JSX text and in
      // text-bearing props of custom components; always use t('<key>') instead,
      // with all copy centralized in src/i18n/locales/*.json.
      // Native DOM attributes are only checked for placeholder/alt/aria-label/value/title
      // by default; other technical attributes (role/href/type, etc.) are auto-allowed.
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          message:
            'UI copy must use i18n keys: t("namespace.key"); translations live in src/i18n/locales/*.json',
          // Note: the plugin shallow-merges options, so jsx-attributes.exclude must
          // also list the defaults alongside our additions
          "jsx-attributes": {
            exclude: [
              // Plugin defaults
              "className",
              "styleName",
              "style",
              "type",
              "key",
              "id",
              "width",
              "height",
              // Enum / structural props of this project's components (not user-facing copy)
              "variant",
              "size",
              "maskLength",
              "to",
              "as",
            ],
          },
        },
      ],
    },
  },
);
