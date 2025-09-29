#!/usr/bin/env bun
import generateApp from "./src/lib/generator";

// Simple function to ask user for input
const askUser = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
};

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Enhanced output function with colors
const onOutput = (
  message: string,
  type: "info" | "success" | "error" = "info",
) => {
  const timestamp = new Date().toLocaleTimeString();
  let colorCode = colors.reset;

  switch (type) {
    case "success":
      colorCode = colors.green;
      break;
    case "error":
      colorCode = colors.red;
      break;
    case "info":
      colorCode = colors.cyan;
      break;
  }

  console.log(`${colorCode}[${timestamp}] ${message}${colors.reset}`);
};

const main = async () => {
  console.log(`${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                     🚀 App Generator Tool                    ║
║              Generate multiple apps from CSV data           ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Ask user if they want to install dependencies
    const installChoice = await askUser(`
${colors.yellow}📦 Do you want to install dependencies for each generated app?${colors.reset}
   This will run 'pnpm install' if fail than 'npm install' in each app directory.
   
${colors.cyan}   [y/N] (default: No): ${colors.reset}`);

    const installDep =
      installChoice.toLowerCase() === "y" ||
      installChoice.toLowerCase() === "yes";

    if (installDep) {
      onOutput("✅ Dependencies will be installed for each app", "success");
    } else {
      onOutput("⏭️  Dependencies installation will be skipped", "info");
    }

    console.log(
      `\n${colors.blue}Starting app generation process...${colors.reset}\n`,
    );

    // Run the generator
    await generateApp({
      installDep,
      onOutput,
    });

    console.log(`\n${colors.green}
╔══════════════════════════════════════════════════════════════╗
║                    🎉 Generation Complete!                   ║
║          All applications have been generated successfully   ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}
╔══════════════════════════════════════════════════════════════╗
║                        ❌ Error Occurred                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

    onOutput(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
      "error",
    );
    process.exit(1);
  }
};

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log(`\n${colors.yellow}
╔══════════════════════════════════════════════════════════════╗
║                    👋 Operation Cancelled                    ║
║                   Exiting gracefully...                     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  process.exit(0);
});

// Run the main function
void main();
