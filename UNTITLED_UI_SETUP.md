# Untitled UI React Setup Documentation

## Overview
This project uses Untitled UI React components, installed via the official CLI tool (similar to shadcn/ui approach).

## Installation Method
- **CLI Tool**: `untitledui` package (v0.1.51)
- **Icons**: `@untitled-ui/icons-react` (v0.1.4)
- **Component Library**: Components are installed individually via CLI and committed to repository

## Configuration Files

### PostCSS Configuration
- **File**: `postcss.config.cjs` (CommonJS format due to ES module conflicts)
- **Plugins**: tailwindcss, autoprefixer
- **Note**: Renamed from .js to .cjs to resolve module type conflicts

### Tailwind CSS Configuration
- **File**: `tailwind.config.js`
- **Version**: v3.4.0 (downgraded from v4 for compatibility)
- **Custom Properties**: Full CSS custom properties setup for Untitled UI design tokens
- **Colors**: primary, secondary, destructive, muted, accent, etc.
- **Border Radius**: Custom radius variable support

### Global Styles
- **File**: `src/styles/globals.css`
- **Content**: Tailwind directives + CSS custom properties for design tokens
- **Theme Support**: Light and dark mode CSS variables

## Path Aliases
- **Vite Config**: `@/*` mapped to `./src/*`
- **TypeScript Config**: Path mapping in `tsconfig.app.json`
- **Usage**: `@/components/ui/button` imports work correctly

## Component Structure
```
src/
├── components/
│   ├── index.ts          # Component exports
│   └── ui/
│       └── button.tsx     # Individual components
├── lib/
│   ├── index.ts
│   └── utils.ts          # Utility functions (cn helper)
└── styles/
    ├── index.ts
    └── globals.css        # Global styles
```

## Usage Example
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Click me
</Button>
```

## Available Components
- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Sizes**: default, sm, lg, icon
- **Icons**: Available via `@untitled-ui/icons-react`

## Adding New Components
Use the CLI to add components:
```bash
npx untitledui add [component-name] -p src/components/ui
```

## Build Mode Support
Environment variable `VITE_BUILD_MODE` supports:
- `APP`: Build as standalone application
- `PACKAGE`: Build as reusable package

## Development Status
✅ All configurations working
✅ Hot Module Replacement active
✅ No TypeScript errors
✅ Tailwind CSS processing correctly
✅ Component imports resolving properly
