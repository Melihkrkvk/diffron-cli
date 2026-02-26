import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function addDependency(projectPath: string, deps: string[]) {
  const pkgPath = path.join(projectPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  pkg.dependencies = pkg.dependencies || {};

  for (const dep of deps) {
    pkg.dependencies[dep] = "latest";
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

export function run(cmd: string, cwd?: string) {
  execSync(cmd, { stdio: "inherit", cwd: cwd ?? process.cwd() });
}

export function isDirEmpty(dir: string) {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0;
}

export function safeMkdir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function removeGitFolder(projectPath: string) {
  const gitPath = path.join(projectPath, ".git");
  if (fs.existsSync(gitPath))
    fs.rmSync(gitPath, { recursive: true, force: true });
}

export function updatePackageName(projectPath: string, name: string) {
  const pkgPath = path.join(projectPath, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

export function copyEnv(projectPath: string) {
  const example = path.join(projectPath, ".env.example");
  const env = path.join(projectPath, ".env");
  if (fs.existsSync(example) && !fs.existsSync(env)) {
    fs.copyFileSync(example, env);
  }
}
