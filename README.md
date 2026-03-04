# Bridal Jewelry eCommerce – Full-Stack Project

A production-ready, portfolio-level eCommerce website for selling bridal jewelry, with a **Next.js** frontend and **Django** backend, including a full **Admin Panel**.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14 (App Router), TypeScript  |
| Styling  | Tailwind CSS, Framer Motion         |
| Backend  | Django (Python), Django REST Framework |
| Database | SQLite (development), PostgreSQL-compatible |
| Email    | SMTP (configurable)                  |

---

## Project Structure

```
de/
├── backend/          # Django API
│   ├── config/       # Django settings, urls
│   ├── store/        # Main app: models, views, serializers, APIs
│   ├── manage.py
│   └── requirements.txt
├── frontend/         # Next.js app
│   ├── app/          # App Router pages (auth, products, cart, checkout, admin)
│   ├── components/
│   ├── lib/          # API client, types
│   └── package.json
└── README.md
```

---

## How to Run Locally

### 1. Backend (Django)

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin at /admin/)
# python manage.py createsuperuser

# Seed sample data (categories, products, admin user)
python manage.py seed_data

# Start the server
python manage.py runserver
```

Backend runs at **http://localhost:8000**.  
API base: **http://localhost:8000/api/**.

**Default admin panel login (store admin, not Django superuser):**  
- Username: `admin`  
- Password: `admin123`  
(Created by `seed_data`.)

---

### 2. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Create env file (optional; defaults point to local backend)
# echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**.

---

## Main Features

### Store (Frontend)

- **Auth:** Login, Signup (token-based).
- **Home:** Hero, featured products, testimonials, newsletter block.
- **Shop:** Product grid, filters (category, price range), sort, search, pagination.
- **Product detail:** Gallery, description, reviews, add to cart.
- **Cart:** Quantity update/remove, live total.
- **Checkout:** Multi-step (shipping → summary → place order). Order confirmation and email (if SMTP configured).

### Backend API

- **Auth:** `POST /api/auth/signup/`, `POST /api/auth/login/`, `GET /api/auth/me/` (token).
- **Products:** `GET /api/products/` (paginated, filters), `GET /api/products/<id>/`, `GET /api/products/featured/`.
- **Categories:** `GET /api/categories/`.
- **Cart:** `GET/POST /api/cart/`, add/update/remove (auth required).
- **Orders:** `GET /api/orders/`, `POST /api/orders/create/` (auth required).
- **Admin:**  
  - `POST /api/admin/login/` (returns token).  
  - Dashboard, orders, products CRUD, categories CRUD, users list (all under `/api/admin/...`, admin token required).

### Admin Panel (Frontend)

- **URL:** `/admin` (e.g. http://localhost:3000/admin).
- **Login:** Separate admin login (username/password); token stored in `localStorage` as `adminToken`.
- **Dashboard:** Total orders, revenue, pending orders, recent orders.
- **Orders:** List and order detail.
- **Products:** List, add, edit, delete.
- **Categories:** List, add, edit, delete.
- **Users:** List customers.

---

## Email (Order Confirmation & Admin Notification)

- **Development:** Default is console backend (no real email). You’ll see log output when an order is placed.
- **Production:** Set in environment (or Django settings):
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
  - `DEFAULT_FROM_EMAIL`, `ADMIN_EMAIL` (for order notification to admin)

Then set `EMAIL_BACKEND` to your SMTP backend (e.g. `django.core.mail.backends.smtp.EmailBackend`).

---

## Database

- **Development:** SQLite (`backend/db.sqlite3`).
- **Production:** Use PostgreSQL and set `DATABASE_URL`; the project is compatible with `dj-database-url` (add `dj-database-url` and use it in `config/settings.py` if you switch).

---

## Environment Variables

### Backend (optional)

- `DEBUG` – default `True` in dev.
- `DJANGO_SECRET_KEY` – override in production.
- `DATABASE_URL` – for PostgreSQL.
- `EMAIL_*`, `ADMIN_EMAIL` – for SMTP and admin notifications.

### Frontend (optional)

- `NEXT_PUBLIC_API_URL` – default `http://localhost:8000/api`.

---

## Seed Data

- **Admin user:** username `admin`, password `admin123`.
- **Categories:** e.g. Necklaces, Earrings, Bracelets, Rings, Hair Accessories.
- **Products:** Several sample bridal jewelry products (no image files; you can add images via admin or media later).

---

## Build for Production

**Backend:**

```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL, SECRET_KEY, etc.
python manage.py migrate
python manage.py collectstatic  # if using static files
# Run with gunicorn/uWSGI as needed
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

---

## Summary

- Full-store flow: browse, filter, product detail, cart, checkout, order confirmation and emails.
- Admin panel: dashboard, orders, products, categories, users, with separate login.
- Modern UI: Tailwind, Framer Motion, responsive layout.
- Ready to extend with real images, payment gateway, and deployment config.
