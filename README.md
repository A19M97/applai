# Next.js 15 Full-Stack Boilerplate

A production-ready starter template built with Next.js 15, Clerk authentication, Prisma + PostgreSQL, and internationalization support.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk (email OTP + magic links)
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Internationalization**: next-intl (English & Italian)

## Prerequisites

- **Node.js** 18+
- **Docker** and **Docker Compose** (for PostgreSQL)

## Getting Started

Follow these steps in order to set up the project:

### 1. Create environment file

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- **Database**: PostgreSQL connection string
- **Clerk**: Get your keys from [Clerk Dashboard](https://dashboard.clerk.com)

### 2. Install dependencies

```bash
npm ci
```

### 3. Start PostgreSQL

Launch the database with Docker Compose:

```bash
docker compose up -d
```

The database will be available at `localhost:5436`.

### 4. Push database schema

```bash
npm run db:push
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
npm run db:reset     # Reset database
npm run db:generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Type check with TypeScript
```

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/           # Authentication routes
│   ├── (protected)/      # Protected routes
│   ├── [locale]/         # Internationalization
│   └── api/webhooks/     # API routes
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── i18n/               # Internationalization config
├── lib/                # Utilities and configs
├── messages/           # Translation files
└── prisma/             # Database schema
```

## 🔄 Come mantenere aggiornato il tuo fork con il repository originale

Se hai forkato un repository (`repo1`) e stai sviluppando nel tuo fork (`repo2`), puoi mantenere il tuo fork sincronizzato con il repository originale seguendo questi passaggi.

---

### 🧭 1. Vai nella directory del tuo fork

```bash
cd percorso/del/tuo/repo2
```

---

### 🧩 2. Aggiungi il repository originale come *upstream*

```bash
git remote add upstream https://github.com/utente-originale/repo1.git
```

Verifica che sia stato aggiunto correttamente:

```bash
git remote -v
```

Dovresti vedere qualcosa come:

```
origin    https://github.com/tu-utente/repo2.git (fetch)
origin    https://github.com/tu-utente/repo2.git (push)
upstream  https://github.com/utente-originale/repo1.git (fetch)
upstream  https://github.com/utente-originale/repo1.git (push)
```

---

### 🔄 3. Recupera gli ultimi cambiamenti dal repository originale

```bash
git fetch upstream
```

---

### ⚙️ 4. Unisci gli aggiornamenti nel tuo branch principale

Spostati sul branch principale:

```bash
git checkout master
```

Poi scegli una delle due opzioni:

#### 🔹 Opzione A: Merge (consigliata e più sicura)

```bash
git merge upstream/master
```

#### 🔹 Opzione B: Rebase (più pulita, ma riscrive la cronologia)

```bash
git rebase upstream/master
```

---

### 💾 5. Aggiorna il tuo fork su GitHub

```bash
git push origin master
```

---

### ✅ Riepilogo rapido

Per aggiornare periodicamente il tuo fork:

```bash
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```

---

💡 **Suggerimento:**
Puoi creare uno script Bash per automatizzare tutto questo:

```bash
#!/bin/bash
# sync-fork.sh - Aggiorna il fork con il repository originale

git fetch upstream
git checkout master
git merge upstream/master
git push origin master

echo "✅ Fork aggiornato con successo!"
```

Rendi lo script eseguibile e lancialo ogni volta che vuoi aggiornare il tuo fork:

```bash
chmod +x sync-fork.sh
./sync-fork.sh
```
