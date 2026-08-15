## KPlanner

Standalone schedule planner for King Abdulaziz University students. Powered by the KAUIndex API.

### Getting Started

```bash
pnpm install
pnpm dev
```

Set `VITE_BASE_URL` in `.env` to point at the KAUIndex api (defaults to `https://api.kauindex.com`).

### Building for production

```bash
pnpm build
pnpm preview
```

### Stack

- TanStack Router + Start
- React 19
- Zustand (persisted schedule state)
- shadcn/radix + Tailwind CSS v4
- Vite
