# 🚀 Multi-App Generator

A powerful tool that generates multiple React applications from CSV data. This tool reads domain information from a CSV file and creates individual React apps for each domain with customized content.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Using the Terminal Script](#using-the-terminal-script)
  - [Using the Web Interface](#using-the-web-interface)
- [Project Structure](#project-structure)
- [CSV Data Format](#csv-data-format)
- [Generated Apps Structure](#generated-apps-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

## 📖 Overview

This application consists of two main components:

1. **Generator Script** (`makeApp.ts`) - A command-line tool that generates multiple React apps from CSV data
2. **Web Interface** - A Next.js application for managing and viewing the generated apps

## ✨ Features

- 🔄 **Bulk App Generation**: Generate multiple React apps from a single CSV file
- 📊 **CSV Data Processing**: Automatically parse and process domain information
- 🎨 **Template-Based**: Uses a base template app to ensure consistency
- 📦 **Dependency Management**: Optional automatic installation of dependencies
- 🌐 **Next.js Web Interface**: Manage and view generated apps through a web interface
- 🎯 **TypeScript Support**: Full TypeScript support across all generated apps
- 📱 **Responsive Design**: Modern, responsive UI components

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (recommended) or **npm/pnpm**
- **Git** (optional, for version control)

## 🚀 Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd task2
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   
   # Or using bun
   bun install
   ```

## 📖 Usage

### Using the Terminal Script

The main generator script (`makeApp.ts`) is the core tool for generating multiple apps.

#### 1. Prepare Your CSV Data

Create or edit the `input.csv` file with your domain information:

```csv
domain,title,description,phone,address
foodexpress.com,Food Express,Delicious meals delivered fast,01712345678,"House 12, Road 5, Banani, Dhaka"
techhubbd.com,Tech Hub BD,Your trusted tech partner,01898765432,"Level 4, Block B, Dhanmondi, Dhaka"
bookbazaar.com,Book Bazaar,Buy and sell books online,01911223344,"Shop 22, New Market, Chittagong"
```

#### 2. Run the Generator

```bash
# Using the npm script (recommended)
pnpm generate

# Or run directly with bun
bun makeApp.ts
```

#### 3. Follow the Interactive Prompts

The script will ask you:
- Whether to install dependencies for each generated app
- The script will show colorful progress output
- Upon completion, it will automatically exit

#### 4. Generated Output

After successful generation, you'll find:
- Individual app folders in the `individual/` directory
- Each app named after its domain (e.g., `individual/foodexpress.com/`)
- Each app is a complete React application ready to run

### Using the Web Interface

1. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

3. **Use the web interface to**:
   - View generated apps
   - Edit CSV data
   - Manage app generation process

## 📁 Project Structure

```
task2/
├── makeApp.ts              # Main generator script
├── input.csv              # CSV data source
├── package.json           # Main project dependencies
├── baseApp/               # Template application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Contact.tsx
│   │   │   └── Heading.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── individual/            # Generated apps (created by script)
│   ├── foodexpress.com/
│   ├── techhubbd.com/
│   └── bookbazaar.com/
├── src/                   # Next.js web interface
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── server/
└── public/
```

## 📊 CSV Data Format

The `input.csv` file should follow this format:

| Column      | Description                    | Required | Example                              |
|-------------|--------------------------------|----------|--------------------------------------|
| `domain`    | Domain name for the app        | Yes      | `foodexpress.com`                   |
| `title`     | App title/name                 | Yes      | `Food Express`                      |
| `description` | App description              | Yes      | `Delicious meals delivered fast`    |
| `phone`     | Contact phone number           | Yes      | `01712345678`                       |
| `address`   | Contact address                | Yes      | `House 12, Road 5, Banani, Dhaka`  |

**Important Notes:**
- First row must contain headers
- Domain names should be valid (will be used as folder names)
- Use quotes around addresses if they contain commas
- All fields are required for proper app generation

## 🏗️ Generated Apps Structure

Each generated app in the `individual/` folder has this structure:

```
domain.com/
├── src/
│   ├── components/
│   │   ├── Contact.tsx    # Contact info component
│   │   └── Heading.tsx    # Header component
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/
├── package.json          # App-specific dependencies
├── vite.config.ts        # Vite configuration
└── data.json            # Generated app data
```

### Running Individual Apps

To run a generated app:

```bash
cd individual/foodexpress.com
pnpm install  # if not installed during generation
pnpm dev
```

## 📜 Scripts

Available npm scripts:

| Script      | Description                           | Command                |
|-------------|---------------------------------------|------------------------|
| `generate`  | Run the app generator                | `pnpm generate`        |
| `dev`       | Start Next.js development server     | `pnpm dev`            |
| `build`     | Build Next.js for production         | `pnpm build`          |
| `start`     | Start Next.js production server      | `pnpm start`          |

## 🔧 Troubleshooting

### Common Issues

1. **"Command not found" error**
   ```bash
   # Ensure bun is installed
   curl -fsSL https://bun.sh/install | bash
   
   # Or use Node.js directly
   node makeApp.ts
   ```

2. **Permission denied on Unix systems**
   ```bash
   chmod +x makeApp.ts
   ```

3. **CSV parsing errors**
   - Check that your CSV has proper headers
   - Ensure no missing required fields
   - Use quotes around fields containing commas

4. **Generation fails**
   - Ensure the `baseApp` folder exists and is complete
   - Check that you have write permissions in the project directory
   - Verify all dependencies are installed

### Debug Mode

For more detailed output, you can modify the `onOutput` function in `makeApp.ts` or check the console during generation.

### Getting Help

If you encounter issues:
1. Check the error messages in the terminal
2. Ensure all prerequisites are installed
3. Verify your CSV data format
4. Check file permissions

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Edit your CSV data
# Edit input.csv with your domain information

# 3. Generate apps
pnpm generate

# 4. Run a generated app
cd individual/yourdomain.com
pnpm install
pnpm dev
```

That's it! Your apps should now be generated and ready to use. 🎉