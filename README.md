# Blood Donor Connect (MERN)

React + Vite + Tailwind client, Express + Mongoose API, MongoDB database.

## Setup

1. Install MongoDB locally or create a MongoDB Atlas cluster.
2. `cp server/.env.example server/.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
3. `npm run install:all`
4. `npm run seed` creates the admin account and three sample donors.
5. `npm run dev` starts the API on :5000 and the client on :5173 (Vite proxies `/api`).

Seeded logins:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@blooddonor.local | Admin@12345 |
| Donor | aarav@example.com | Donor@12345 |

Change the admin password in `.env` before seeding anywhere public.

## Structure

```
server/   config/ models/ middleware/ routes/ utils/ server.js seed.js
client/   src/{api.js, context/, components/, pages/}
```

## API

See section 7 of the SRS. Public: donor search and profile, send request, auth.
Donor routes need a donor token; `/api/admin/*` needs an admin token.
"# blood_donor_mern" 
