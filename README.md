# Boxy - Gmail CRM Pipeline Extension

Boxy is a Chrome extension that enhances Gmail with CRM pipeline functionality, helping you manage your email communications more efficiently.

## Features

- Seamless integration with Gmail interface
- Drag-and-drop pipeline management
- React-based user interface
- Built with TypeScript for type safety
- Tailwind CSS for modern styling

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (latest LTS version recommended)
- npm (comes with Node.js)
- Google Chrome browser

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd boxy
```

2. Install dependencies:
```bash
npm install
```

## Development

To start development with hot-reload:
```bash
npm run dev
```

This will:
- Watch for file changes
- Automatically rebuild the extension
- Use webpack development configuration

## Building for Production

To create a production build:
```bash
npm run build
```

The built extension will be created in the `dist` directory.

## Loading the Extension

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `dist` directory from your project folder

## Project Structure

- `src/` - Source code files
- `dist/` - Built extension files
- `webpack.dev.js` - Development webpack configuration
- `webpack.prod.js` - Production webpack configuration

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Webpack 5
- Chrome Extensions API
