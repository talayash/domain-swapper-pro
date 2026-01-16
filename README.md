# Domain Swapper Pro

A powerful Chrome extension for developers who work across multiple environments. Instantly switch between dev, staging, QA, and production URLs while preserving your current path.

---

## Features

- **One-Click Environment Switching** — Swap domains instantly while keeping your URL path intact
- **Keyboard Shortcuts** — `Alt+D` to open, `Alt+Shift+D` for quick swap to last used domain
- **Organize with Folders** — Group related domains for cleaner navigation
- **Drag & Drop** — Reorder domains and folders with ease
- **Fuzzy Search** — Find domains quickly with smart search
- **Dark Mode** — Automatic theme detection with manual override
- **Import/Export** — Backup and share your domain configurations
- **Context Menu Integration** — Right-click to swap domains directly

---

## Installation

### From Source (Developer Mode)

**Prerequisites**
- [Node.js](https://nodejs.org/) v18 or higher
- npm or yarn

**Steps**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/domain-swapper-pro.git
   cd domain-swapper-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `dist` folder from the project directory

---

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The extension will automatically reload when you make changes.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

---

## Usage

1. **Add Domains** — Click the `+` button to add environment domains
2. **Create Folders** — Organize domains by project or category
3. **Switch Environments** — Click any domain to swap your current tab's URL
4. **Quick Swap** — Press `Alt+Shift+D` to instantly switch to your last used domain

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+D` | Open Domain Swapper popup |
| `Alt+Shift+D` | Quick swap to last used domain |

> Customize shortcuts at `chrome://extensions/shortcuts`

---

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool with CRXJS plugin
- **Tailwind CSS** — Styling
- **Zustand** — State management
- **Radix UI** — Accessible components
- **dnd-kit** — Drag and drop

---

## License

MIT

