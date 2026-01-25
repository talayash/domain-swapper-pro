<p align="center">
  <img src="icons/icon-128.png" alt="Domain Swapper Pro" width="128" height="128">
</p>

<h1 align="center">Domain Swapper Pro</h1>

<p align="center">
  <strong>Switch between development environments in one click</strong>
</p>

<p align="center">
  A powerful Chrome extension for developers who work across multiple environments.<br>
  Instantly switch between dev, staging, QA, and production URLs while preserving your current path.
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **One-Click Switching** | Swap domains instantly while keeping your URL path intact |
| **Port Support** | Full support for localhost and custom ports (e.g., `localhost:3000`) |
| **Keyboard Shortcuts** | `Alt+D` to open, `Alt+Shift+D` for quick swap to last used domain |
| **Folder Organization** | Group related domains with nested subfolders |
| **Drag & Drop** | Reorder domains and folders with ease |
| **Fuzzy Search** | Find domains quickly with smart search |
| **Dark Mode** | Automatic theme detection with manual override |
| **Import/Export** | Backup and share your domain configurations |
| **Context Menu** | Right-click to swap domains directly from any page |
| **Protocol Control** | Per-domain protocol settings (HTTP/HTTPS/Preserve) |

---

## Installation

### From Chrome Web Store
**[Install Domain Swapper Pro](https://chromewebstore.google.com/detail/domain-swapper-pro/lkjaaifkmcomiaakacfgfggnpckamklp)**

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

## Usage

### Adding Domains

1. Click the extension icon to open the popup
2. Click **Add Domain** to add a new environment URL
3. Enter the domain (e.g., `localhost:3000`, `staging.example.com`, `app.example.com`)
4. Optionally add a label and select a folder

### Switching Domains

- **Click** any domain in the list to swap your current tab's URL
- **Right-click** on any page and use the context menu
- Press **Alt+Shift+D** to instantly swap to your last used domain

### Organizing with Folders

- Create folders to group domains by project or environment type
- Drag and drop to reorder domains and folders
- Collapse folders to keep your list tidy

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+D` | Open Domain Swapper popup |
| `Alt+Shift+D` | Quick swap to last used domain |

> Customize shortcuts at `chrome://extensions/shortcuts`

---

## Examples

### Development Workflow

Switch between environments while keeping your current path:

| Current URL | Target Domain | Result |
|-------------|---------------|--------|
| `localhost:3000/dashboard/users` | `staging.app.com` | `https://staging.app.com/dashboard/users` |
| `staging.app.com/api/v1/users` | `localhost:8080` | `http://localhost:8080/api/v1/users` |
| `app.example.com/settings` | `dev.example.com` | `https://dev.example.com/settings` |

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

### Project Structure

```
domain-swapper-pro/
├── src/
│   ├── background/     # Service worker & handlers
│   ├── lib/            # Utilities (URL parsing, validators)
│   ├── popup/          # Popup UI components
│   ├── options/        # Options page
│   ├── store/          # Zustand state management
│   ├── styles/         # Global styles
│   └── types/          # TypeScript types
├── icons/              # Extension icons
├── manifest.json       # Extension manifest
└── vite.config.ts      # Vite configuration
```

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

## Privacy

Domain Swapper Pro:
- Stores all data locally in your browser
- Does not collect or transmit any personal information
- Only requires minimal permissions necessary for functionality

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT
