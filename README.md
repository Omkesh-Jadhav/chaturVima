# IT Due Diligence Dashboard

React + TypeScript workspace that showcases the employee experience alongside a super admin console. The UI is powered by Shadcn UI primitives, Tailwind CSS utilities, and modular feature folders.

## Getting Started

```bash
npm install
npm run dev
```

The app runs on Vite with hot module replacement enabled by default.

## Demo Access

Use the OTP-based login flow (seeded for demo purposes) to explore the employee and super admin workspaces. Authentication is currently handled in-memory and will be replaced with a backend integration in the next phase. Each successful login redirects to the appropriate role dashboard and surfaces the matching navigation set.

## Folder Highlights

- `src/components/layout` – shared layout chrome (`Sidebar`, `Navbar`, `Layout`).
- `src/config/roleRoutes.ts` – central mapping for role-based landing routes.
- `src/context` – global providers for user auth, sidebar state, and assessments.
- `src/pages/Employee` & `src/pages/superAdmin` – role-specific views.
- `src/data/mockUsers.ts` – seeded users and credentials used for the demo login flow.

## Next Steps

- Replace mock authentication with server-side validation.
- Extend authorization guards once backend roles are finalized.
- Add feature tests covering the login flow and role-specific navigation.
