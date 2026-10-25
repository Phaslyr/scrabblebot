import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const portableCli = join(root, ".tools", "spacetime", "spacetimedb-cli.exe");
const executable = existsSync(portableCli) ? portableCli : "spacetime";
const result = spawnSync(executable, [
  "--root-dir", join(root, ".tools", "cli-state"),
  "generate", "--lang", "typescript",
  "--out-dir", join(root, "bot-starter", "src", "module_bindings"),
  "--module-path", join(root, "spacetimedb"), "--no-config", "--yes",
], { cwd: root, stdio: "inherit" });
if (result.error) {
  console.error(`Could not run SpacetimeDB: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
