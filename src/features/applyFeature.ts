import path from "node:path";
import fs from "node:fs";
import { copyDir } from "../utils/fs";
import { featureRegistry, FeatureKey } from "./registry";

export function applyFeature({
  templateRoot,
  projectPath,
  featureKey,
}: {
  templateRoot: string;
  projectPath: string;
  featureKey: FeatureKey;
}) {
  const def = featureRegistry[featureKey];
  const featureDir = path.join(templateRoot, "features", def.overlayDir);

  if (!fs.existsSync(featureDir)) {
    throw new Error(`Feature folder not found: ${def.overlayDir}`);
  }

  // overlay copy
  copyDir(featureDir, projectPath);

  // env append (optional)
  if (def.envAppend) {
    const envAppendPath = path.join(featureDir, ".env.append");
    const envPath = path.join(projectPath, ".env");
    if (fs.existsSync(envAppendPath) && fs.existsSync(envPath)) {
      const extra = fs.readFileSync(envAppendPath, "utf8").trim();
      if (extra.length) fs.appendFileSync(envPath, "\n" + extra + "\n");
    }
  }
}