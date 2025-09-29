import fs from "fs/promises";
import path from "path";
import { parseCSV } from './csvOpration';

const mainPath = process.cwd();
const dirPath = "individual";
const individualPath = path.join(mainPath, dirPath);
const basePath = path.join(mainPath, "baseApp");

// check individual folder exists or create it
const ensureDirExists = async () => {
  try {
    await fs.access(individualPath);
  } catch {
    await fs.mkdir(individualPath);
  }
};

const data = await parseCSV();

// remeve all in individual folder
const removeAllFolder = async () => {
  const files = await fs.readdir(individualPath);
  for (const file of files) {
    const filePath = path.join(individualPath, file);
    await fs.rm(filePath, { recursive: true, force: true });
  }
};

// check baseApp folder exists
const ensureBaseAppExists = async () => {
  try {
    await fs.access(basePath);
  } catch {
    throw new Error("baseApp folder does not exist");
  }
};

// generate app in individual folder
const generateApp = async ({
  installDep,
  onOutput,
}: {
  installDep: boolean;
  onOutput?: (message: string, type?: "info" | "success" | "error") => void;
}) => {
  const log = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    onOutput?.(message, type);
  };

  log("🚀 Starting app generation process...", "info");

  await ensureDirExists();
  log("📁 Individual directory ready", "success");

  await removeAllFolder();
  log("🧹 Cleaned individual directory", "success");

  await ensureBaseAppExists();
  log("✅ Base app directory verified", "success");

  // create folder in individual with domain name
  log(`📦 Generating ${data.length} applications...`, "info");

  for (const [index, row] of data.entries()) {
    const domainFolder = path.join(individualPath, row.domain);
    log(
      `\n🔨 [${index + 1}/${data.length}] Processing ${row.domain}...`,
      "info",
    );

    try {
      await fs.access(domainFolder);
    } catch {
      await fs.mkdir(domainFolder);
    }
    log(`  📁 Created directory: ${row.domain}`, "success");

    // copy all thing from basePath in every domain folder accept node_modules
    const baseFiles = await fs.readdir(basePath);
    log(`  📋 Copying ${baseFiles.length} base files...`, "info");

    for (const file of baseFiles) {
      if (file === "node_modules") continue; // skip node_modules
      const srcPath = path.join(basePath, file);
      const destPath = path.join(domainFolder, file);
      await fs.cp(srcPath, destPath, { recursive: true });
    }
    log(`  ✅ Base files copied successfully`, "success");

    // create data.json in domain folder
    const jsonPath = path.join(domainFolder, "data.json");
    await fs.writeFile(jsonPath, JSON.stringify(row, null, 2), "utf8");
    log(`  💾 Created data.json with domain info`, "success");

    // update port number in vite.config.ts file
    const viteConfigPath = path.join(domainFolder, "vite.config.ts");
    let viteConfigContent = await fs.readFile(viteConfigPath, "utf8");
    const newPort = Math.floor(4000 + Math.random() * 1000);
    viteConfigContent = viteConfigContent.replace(
      /port:\s*\d+/,
      `port: ${newPort}`,
    );
    await fs.writeFile(viteConfigPath, viteConfigContent, "utf8");
    log(`  🔧 Updated port to ${newPort}`, "success");

    // install dependencies
    // first try with pnpm if fails then try with npm
    if (installDep) {
      log(`  📦 Installing dependencies for ${row.domain}...`, "info");
      const exec = await import("child_process").then((mod) => mod.exec);

      // First try with pnpm
      try {
        await new Promise((resolve, reject) => {
          exec(
            `cd ${domainFolder} && pnpm install`,
            (error, stdout, stderr) => {
              if (error) {
                reject(error);
                return;
              }
              // Log the installation output
              if (stdout) {
                log(`  📦 pnpm output: ${stdout.trim()}`, "info");
              }
              if (stderr) {
                log(`  ⚠️  pnpm stderr: ${stderr.trim()}`, "info");
              }
              log(
                `  ✅ Dependencies installed with pnpm for ${row.domain}`,
                "success",
              );
              resolve(stdout);
            },
          );
        });
      } catch {
        log(`  ⚠️  pnpm failed for ${row.domain}, trying npm...`, "info");

        // Fallback to npm if pnpm fails
        await new Promise((resolve, reject) => {
          exec(
            `cd ${domainFolder} && npm install`,
            (error, stdout, stderr) => {
              if (error) {
                log(
                  `  ❌ Error installing dependencies with npm: ${error.message}`,
                  "error",
                );
                reject(error);
                return;
              }
              // Log the installation output
              if (stdout) {
                log(`  📦 npm output: ${stdout.trim()}`, "info");
              }
              if (stderr) {
                log(`  ⚠️  npm stderr: ${stderr.trim()}`, "info");
              }
              log(
                `  ✅ Dependencies installed with npm for ${row.domain}`,
                "success",
              );
              resolve(stdout);
            },
          );
        });
      }
    } else {
      log(`  ⏭️  Skipped dependency installation for ${row.domain}`, "info");
    }

    log(`  🎉 Completed ${row.domain}`, "success");
  }

  log(`\n🚀 All applications generated successfully!`, "success");
  log(`📍 Generated ${data.length} apps in ./individual/ directory`, "info");
};

// await generateApp({ installDep: false, onOutput: (me)=> console.log(me) });

export default generateApp;
