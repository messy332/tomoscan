# TomoScan — Setup Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- A Supabase project (free tier works)

---

## 1. Supabase Database

1. Go to https://supabase.com → New Project
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Copy your **Connection String** from Settings → Database → Connection string (URI mode)

---

## 2. Backend (FastAPI)

```bash
cd tomoscan-web/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Also install python-magic-bin on Windows:
pip install python-magic-bin

# Configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY and DATABASE_URL from Supabase
```

Generate a secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

API docs (dev mode): http://localhost:8000/api/docs

---

## 3. Seed the first Admin user

After the backend is running, register via the API then manually promote:

```sql
-- Run in Supabase SQL Editor
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 4. Frontend (Next.js)

```bash
cd tomoscan-web/frontend

# Install dependencies
npm install
# also install jwt-decode (needed by lib/auth.ts)
npm install jwt-decode

# Configure environment
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if your backend runs elsewhere

# Start development server
npm run dev
```

Open http://localhost:3000

---

## 5. ML Models

The `backend/app/ml/models/` folder must contain:
- `decision_tree.joblib`
- `random_forest.joblib`
- `tomato_features.csv`  ← for the evaluation report

These were already copied from your workspace root during setup.

---

## Folder Structure

```
tomoscan-web/
├── frontend/               Next.js 14 app
│   ├── app/
│   │   ├── page.tsx        Landing page
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/      Member area
│   │   └── admin/          Admin area
│   └── components/
├── backend/                FastAPI
│   ├── app/
│   │   ├── api/routes/     auth, scan, admin
│   │   ├── core/           config, security, deps, database
│   │   ├── ml/             feature_extractor, classifier
│   │   ├── models/         SQLAlchemy ORM
│   │   └── schemas/        Pydantic validators
│   └── requirements.txt
└── supabase/
    └── schema.sql
```

---

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing secret (32+ random bytes) |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Frontend URLs (JSON array string) |
| `DEBUG` | `true` for local dev |

### Frontend `.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL |
