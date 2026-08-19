/**
 * Created by: devops-agent
 * Role:       DevOps Engineer
 * Purpose:    ESLint flat config — bridges eslint-config-next (legacy
 *             .eslintrc format) into flat config via FlatCompat.
 */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
];
