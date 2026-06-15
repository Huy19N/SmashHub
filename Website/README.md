<p align="center">
  <img src="./public/smashhub_banner.png" alt="SmashHub Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

# ⚛️ SmashHub — Frontend Web Application

Welcome to the frontend application directory of **SmashHub**! This responsive web interface is engineered using the latest frontend standard to support our pivoted mission: **redefining social sports connection and player matching**.

This client app serves as the digital gateway for athletes to explore active playgroups, book courts, build custom profiles, and discover local communities.

---

## ⚡ Core Tech Stack

*   **Runtime & Framework:** [React 19.x](https://react.dev/) (leveraging state management improvements and optimized layouts).
*   **Build Pipeline:** [Vite 8.x](https://vite.dev/) for ultra-fast Hot Module Replacement (HMR) and bundle optimizations.
*   **Styling Engine:** [Tailwind CSS v4.0](https://tailwindcss.com/) with native CSS variables and modular configurations.
*   **Routing System:** [React Router v7](https://reactrouter.com/) implementing centralized route layouts and robust paths mappings.
*   **Design Typography:** [Google Montserrat Font Family](https://fonts.google.com/specimen/Montserrat) integrated directly into the core theme.
*   **Icons & Assets:** [Lucide React](https://lucide.dev/) for crisp, scalable vector icons.

---

## 📂 Project Structure & Feature-First Architecture

The frontend is structured using a clean, scalable **Feature-First Architecture**. This groups all pages, assets, and components belonging to a particular business vertical (e.g., authentication, home feed) together, preventing spaghetti imports and ensuring rapid feature development.

```
Website/
├── public/                 # Static assets (favicons, logos, banner graphics)
├── src/
│   ├── assets/             # Global media files, styling utilities
│   ├── components/         # Global shared layout and UI blocks
│   │   ├── layout/         # Navigation components, global layouts
│   │   ├── seo/            # Dynamic SEO Metadata Managers
│   │   └── ui/             # Reusable design tokens (ThemeSwitcher, Inputs, Buttons)
│   ├── contexts/           # Global Context Providers (Theme, Auth, etc.)
│   ├── features/           # Modularized feature folders
│   │   ├── Auth/           # Login, Registration pages & auth flow
│   │   ├── about/          # Platform vision and about page
│   │   ├── collections/    # Multi-sport media and gear collections
│   │   ├── contact/        # Helpdesks and contact pipelines
│   │   ├── home/           # Landing page with active call-to-actions
│   │   └── premium/        # Exclusive player matchmaking subscriptions
│   ├── routes/             # Centralized route paths & main router hub
│   ├── App.jsx             # Main Application Entrypoint
│   ├── index.css           # Global core styles and design configurations
│   └── main.jsx            # React root DOM rendering
├── package.json            # Frontend dependency manifest
└── README.md               # Current frontend documentation
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version `18.x` or higher is recommended).

### Commands to Run Locally

1.  **Navigate into this directory**:
    ```bash
    cd Website
    ```

2.  **Install project dependencies**:
    ```bash
    npm install
    ```

3.  **Start the local Vite dev server**:
    ```bash
    npm run dev
    ```

Vite will start the server and run on your machine (typically at `http://localhost:5173`). Open the link in your browser to begin developing or testing!

### Primary Development Scripts

*   `npm run dev` — Starts the local hot-reloading development server.
*   `npm run build` — Compiles the application into static production-ready bundles inside `dist/`.
*   `npm run lint` — Runs ESLint to verify code quality and style conformance.
*   `npm run preview` — Spins up a local server to preview the compiled production build.

---

## 🎨 Visual Assets & Design Principles

*   **Dynamic Theme Switcher:** Integrated seamlessly across layouts. Switches background gradients, cards, and input styling dynamically between dark mode and light mode with a smooth cross-fade animation.
*   **Glassmorphism Forms:** Login and registration modules make use of premium modern styling—featuring frosted blur borders, input glows with active focus indicators, and custom SVG animations.
*   **Harmonious Color Palette:** Designed with beautiful dark slate backgrounds, energetic cyan/teal glows, and rich secondary greens to emphasize athletic vibrancy.
*   **Centralized Routes:** All link mappings are mapped through `src/routes/paths.js`, securing easy configuration should endpoints change in the future.

---

<p align="center">
  <sub>Part of the ⚡ <b>SmashHub Monorepo</b>. Redefining active sports connection.</sub>
</p>
