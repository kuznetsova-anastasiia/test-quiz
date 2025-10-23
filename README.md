# ✅ Quiz App – Fullstack (NestJS + Prisma + PostgreSQL + Next.js)

A simple full-stack **Quiz Management Application** where users can create quizzes, view a list of quizzes, and display quiz details.
Built with:

- **Frontend:** Next.js / React
- **Backend:** NestJS + Prisma ORM
- **Database:** PostgreSQL
- **ORM:** Prisma


## ⚙️ 1. Backend Setup (NestJS + Prisma)

### ✅ Install dependencies:
```bash
cd backend
npm install
```

### ✅ Add `.env` file in `/backend`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

Example (local PostgreSQL):
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/quizapp"
```

### ✅ Prisma Initialization
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### ✅ Run the backend
```bash
npm run start:dev
```
Backend runs on: **http://localhost:3001**

## 🎨 2. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000**

If you want to configure API endpoint, create `/frontend/.env`:
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🛢 3. Database Setup

### ✅ Option A: Local PostgreSQL
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE quizapp;
```
3. Add connection string in `.env`
4. Run migrations:
```bash
npx prisma migrate dev
```

### ✅ Option B: Supabase / Neon / Railway
1. Create a new hosted PostgreSQL database
2. Copy the connection string:
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```
3. Paste into `.env` → `DATABASE_URL=...`
4. Run migrations

## 📡 5. API Endpoints

| Method | Endpoint        | Description     |
|--------|------------------|-----------------|
| POST   | `/quizzes`       | Create quiz     |
| GET    | `/quizzes`       | Get all quizzes |
| GET    | `/quizzes/:id`   | Get quiz by ID  |
| DELETE | `/quizzes/:id`   | Delete quiz     |

## ✅ 6. Useful Commands

| Command                      | Purpose                  |
|-----------------------------|---------------------------|
| `npm run start:dev`         | Start backend             |
| `npm run dev`               | Start frontend            |
| `npx prisma migrate dev`    | Run DB migrations         |
| `npx prisma studio`         | Open Prisma Studio UI     |
| `npx prisma generate`       | Regenerate Prisma client  |

## ✅ 7. Technologies Used

- **Next.js / React** – frontend UI
- **NestJS** – backend API
- **Prisma** – ORM
- **PostgreSQL** – database
- **TypeScript** – full stack
- **Class-validator + DTOs** – request validation
