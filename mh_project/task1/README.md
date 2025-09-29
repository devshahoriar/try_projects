# PlumbingPros Website

A modern, responsive website for PlumbingPros built with React, TypeScript, and Tanstack Router.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **pnpm** (recommended package manager)

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd task1
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

### Running the Application

#### Development Mode

To start the development server with hot reload:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

#### Build for Production

To create a production build:

```bash
pnpm build
```

#### Preview Production Build

To preview the production build locally:

```bash
pnpm preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── ui/           # Reusable UI components
├── routes/           # Page components and routing
│   ├── index.tsx     # Homepage
│   ├── faq.tsx       # FAQ page
│   ├── footer.tsx    # Footer page
│   └── getInTouch.tsx # Contact page
├── lib/              # Utility functions
└── assets/           # Static assets
```

## 🛠️ Tech Stack

- **React 18** - Frontend library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tanstack Router** - File-based routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Shadcn/ui** - UI component library

## 📄 Available Pages

- **Home** (`/`) - Landing page with navigation cards
- **FAQ** (`/faq`) - Frequently asked questions
- **Footer** (`/footer`) - Company information and contact details
- **Get In Touch** (`/getInTouch`) - Contact form and information

## 🎨 Features

- **Responsive Design** - Works on all device sizes
- **Modern UI** - Clean and professional interface
- **Fast Navigation** - File-based routing with Tanstack Router
- **TypeScript** - Full type safety throughout the application
- **Component Library** - Reusable UI components with Shadcn/ui

## 📱 Responsive Breakpoints

The application uses Tailwind CSS responsive design:

- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

## 🔧 Development

### Adding New Pages

1. Create a new file in `src/routes/` (e.g., `services.tsx`)
2. Export a route using `createFileRoute`
3. The route will be automatically available at the corresponding URL

### Styling

The project uses Tailwind CSS for styling. Custom styles can be added in:
- `src/index.css` - Global styles
- Component-level classes using Tailwind utilities

### Icons

Icons are provided by Lucide React. Import and use them like:

```tsx
import { Home, User, Mail } from 'lucide-react'
```

## 📞 Contact Information

**PlumbingPros**
- **Address**: 1 Sail Street, London, SE11 6NQ
- **Email**: enquiries@PlumbingPros.com
- **Phone**: 020 4527 6474

## 📝 License

© Plumbing Pros. All Rights Reserved  
Website by IH Adventure And Creative

---

For any questions or issues, please contact the development team.
