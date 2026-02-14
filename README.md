# Code Mastery Suite

## Overview

A comprehensive coding learning platform for students to practice problems, participate in contests, and track their progress.

## Features

- 🎯 **Problem Library** - Browse and solve coding problems with difficulty levels
- 💻 **Code Editor** - Multi-language support with Monaco editor
- 🏆 **Contests** - Participate in timed coding contests
- 📊 **Progress Tracking** - Monitor your learning journey
- 🔖 **Bookmarks** - Save problems for later
- 📝 **Submissions** - View detailed submission history

## Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Backend API running at `http://localhost:5000` (or configure `VITE_API_BASE_URL`)

## Getting Started

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd code-mastery-suite

# Step 3: Install dependencies
npm i

# Step 4: Configure environment (optional)
cp .env.example .env
# Edit .env to set VITE_API_BASE_URL if needed

# Step 5: Start the development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library with hooks
- **React Router** - Client-side routing
- **@tanstack/react-query** - Data fetching and caching
- **shadcn/ui** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code's code editor
- **Lucide React** - Icon library

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

For production, create `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API layer
│   ├── api.ts      # Complete API service layer
│   └── utils.ts    # Helper functions
├── pages/           # Page components (routes)
└── test/            # Test files
```

## API Integration

All backend APIs are integrated through `src/lib/api.ts`. See [Report.md](Report.md) for complete API documentation and integration status.

## Deployment

### Build for Production

```sh
npm run build
```

The build output will be in the `dist/` directory. Deploy this to any static hosting service (Vercel, Netlify, AWS S3, etc.).

### Preview Production Build

```sh
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the TeachBuddy suite of educational applications.

