# yamskis (2026 e-commerce)

Full-stack e-commerce website:
- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB (via Mongoose)
- Auth: JWT

Folders:
- `yamskis/` - frontend
- `server/` - backend

See `TODO.md` for build progress.

Seeded login credentials are controlled from the backend environment:
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
- `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`

If those variables are not set, the seed script falls back to the demo credentials in `server/src/seed/seed.js`.

Database setup:
- Set `MONGODB_URI` in `server/.env` to your MongoDB Atlas connection string.
- The server no longer falls back to a local MongoDB instance.

