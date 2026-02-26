import prompts from "prompts";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/* ---------------------------------------------
   ESM __dirname
---------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The template folder must be shipped with the package:
 * - template/base
 * - template/features/<feature-name>
 *
 * In runtime (dist/index.js), we resolve "../template".
 */
const templateRoot = path.resolve(__dirname, "../src");

/* ---------------------------------------------
   Helpers
---------------------------------------------- */

function run(cmd: string, cwd: string) {
  execSync(cmd, { stdio: "inherit", cwd });
}

function safeMkdir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isDirEmpty(dir: string) {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0;
}

function copyDir(srcDir: string, destDir: string) {
  if (!fs.existsSync(srcDir)) return;
  safeMkdir(destDir);

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

/**
 * Copies .env.example to .env if .env does not exist.
 */
function copyEnv(projectPath: string) {
  const example = path.join(projectPath, ".env.example");
  const env = path.join(projectPath, ".env");

  if (fs.existsSync(example) && !fs.existsSync(env)) {
    fs.copyFileSync(example, env);
  }
}

/**
 * Updates package.json "name" field to match project folder name.
 */
function updatePackageName(projectPath: string, name: string) {
  const pkgPath = path.join(projectPath, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = name;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

/**
 * Applies a feature overlay by copying all files into project root.
 * If ".env.append" exists in the feature folder, it appends it to .env.
 */
function applyFeature(projectPath: string, featureName: string) {
  const featureDir = path.join(templateRoot, "features", featureName);
  if (!fs.existsSync(featureDir)) {
    throw new Error(`Feature not found: ${featureName}`);
  }

  // Overlay copy (override existing files when needed)
  copyDir(featureDir, projectPath);

  // Optional env append
  const envAppendPath = path.join(featureDir, ".env.append");
  if (fs.existsSync(envAppendPath)) {
    const envPath = path.join(projectPath, ".env");
    if (!fs.existsSync(envPath)) fs.writeFileSync(envPath, "", "utf8");

    const extra = fs.readFileSync(envAppendPath, "utf8").trim();
    if (extra.length) fs.appendFileSync(envPath, "\n" + extra + "\n", "utf8");
  }
}

type PM = "npm" | "pnpm" | "yarn";

function installBaseDeps(pm: PM, projectPath: string) {
  if (pm === "npm") run("npm install", projectPath);
  if (pm === "pnpm") run("pnpm install", projectPath);
  if (pm === "yarn") run("yarn", projectPath);
}

/**
 * Adds deps as "latest" by default (pnpm add / npm i / yarn add).
 */
function addDeps(pm: PM, projectPath: string, deps: string[]) {
  const unique = Array.from(new Set(deps)).filter(Boolean);
  if (!unique.length) return;

  if (pm === "npm") run(`npm i ${unique.join(" ")}`, projectPath);
  if (pm === "pnpm") run(`pnpm add ${unique.join(" ")}`, projectPath);
  if (pm === "yarn") run(`yarn add ${unique.join(" ")}`, projectPath);
}

/* ---------------------------------------------
   Feature -> deps registry
   (We keep Prisma out for now, as requested.)
---------------------------------------------- */

const featureDeps: Record<string, string[]> = {
  // state
  "state-zustand": ["zustand"],
  "state-redux": ["@reduxjs/toolkit", "react-redux"],
  "state-jotai": ["jotai"],

  // animation
  "anim-framer": ["framer-motion"],
  "anim-gsap": ["gsap"],

  // auth (Auth.js / next-auth)
  "auth-js-credentials": ["next-auth", "bcryptjs", "zod"],
  "auth-js-google": ["next-auth", "bcryptjs", "zod"],

  // optional helpers
  // "auth-ui": ["next-auth/react"] // (not a real package; next-auth includes it)
};

/* ---------------------------------------------
   Main
---------------------------------------------- */

async function main() {
  const argName = process.argv[2];

  const response = await prompts(
    [
      {
        type: argName ? null : "text",
        name: "projectName",
        message: "Project name:",
        initial: "my-next-app",
        validate: (v) => (v?.trim()?.length ? true : "Project name cannot be empty!"),
      },
      {
        type: "select",
        name: "pm",
        message: "Which package manager?",
        choices: [
          { title: "npm (recommended)", value: "npm" },
          { title: "pnpm", value: "pnpm" },
          { title: "yarn", value: "yarn" },
        ],
        initial: 0,
      },
      {
        type: "select",
        name: "state",
        message: "Global state management library?",
        choices: [
          { title: "Zustand (lightweight, recommended)", value: "zustand" },
          { title: "Redux Toolkit", value: "redux" },
          { title: "Jotai", value: "jotai" },
          { title: "None", value: "none" },
        ],
        initial: 0,
      },
      {
        type: "select",
        name: "anim",
        message: "Animation library:",
        choices: [
          { title: "None", value: "none" },
          { title: "GSAP", value: "gsap" },
          { title: "Framer Motion", value: "framer" },
          { title: "Both", value: "both" },
        ],
        initial: 1,
      },
      {
        type: "select",
        name: "auth",
        message: "Auth solution:",
        choices: [
          { title: "None", value: "none" },
          { title: "Auth.js (Credentials)", value: "credentials" },
          { title: "Auth.js (Credentials + Google)", value: "google" },
        ],
        initial: 0,
      },
      {
        type: "toggle",
        name: "skipInstall",
        message: "Skip installing dependencies?",
        initial: false,
        active: "yes",
        inactive: "no",
      },
    ],
    {
      onCancel: () => {
        console.log("\nCanceled.");
        process.exit(1);
      },
    }
  );

  const projectName: string = (argName ?? response.projectName).trim();
  const pm: PM = response.pm;
  const state: "zustand" | "redux" | "jotai" | "none" = response.state;
  const anim: "none" | "gsap" | "framer" | "both" = response.anim;
  const auth: "none" | "credentials" | "google" = response.auth;
  const skipInstall: boolean = !!response.skipInstall;

  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath) && !isDirEmpty(projectPath)) {
    console.error(`\nError: '${projectName}' folder is not empty.\n`);
    process.exit(1);
  }

  safeMkdir(projectPath);

  const baseDir = path.join(templateRoot, "base");
  if (!fs.existsSync(baseDir)) {
    console.error(`\nError: base template not found at: ${baseDir}\n`);
    process.exit(1);
  }

  console.log("\nCopying base template...");
  copyDir(baseDir, projectPath);

  // Ensure env exists before appending feature env vars
  copyEnv(projectPath);

  console.log("Applying selected features...");
  const selectedFeatures: string[] = [];

  // State selection
  if (state === "zustand") selectedFeatures.push("state-zustand");
  if (state === "redux") selectedFeatures.push("state-redux");
  if (state === "jotai") selectedFeatures.push("state-jotai");

  // Animation selection
  if (anim === "framer") selectedFeatures.push("anim-framer");
  if (anim === "gsap") selectedFeatures.push("anim-gsap");
  if (anim === "both") selectedFeatures.push("anim-framer", "anim-gsap");

  // Auth selection (inject only if chosen)
  if (auth === "credentials") selectedFeatures.push("auth-js-credentials");
  if (auth === "google") selectedFeatures.push("auth-js-google");

  // Apply overlays
  for (const f of selectedFeatures) applyFeature(projectPath, f);

  // Update package name last
  updatePackageName(projectPath, projectName);

  // Install base deps, then feature deps (latest)
  if (!skipInstall) {
    console.log("Installing base dependencies...");
    installBaseDeps(pm, projectPath);

    const depsToAdd = selectedFeatures.flatMap((f) => featureDeps[f] ?? []);
    if (depsToAdd.length) {
      console.log("Adding feature dependencies...");
      addDeps(pm, projectPath, depsToAdd);
    }
  }

  console.log("\n✅ Ready!");
  console.log(
    `\nNext steps:\n  cd ${projectName}\n  ${
      pm === "npm" ? "npm run dev" : pm + " dev"
    }\n`
  );
}

main().catch((err) => {
  console.error("\nUnexpected Error:", err);
  process.exit(1);
});