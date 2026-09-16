# Hotel Order Management System

A full-stack order management system for a restaurant/hotel floor: waitstaff take
orders on a tablet/PC, kitchen sees tickets live, and reception settles the bill
with cash, card, or QR/UPI.

**Stack:** Django + Django REST Framework (backend) · React + Vite + Tailwind CSS (frontend) · JWT auth · SQLite (swap for PostgreSQL/MySQL in production)

## How the flow works

1. **Waitstaff** logs in, picks a table, builds the order from the menu, sends it.
2. **Kitchen** sees it appear instantly (polling every ~3.5s) in the "New tickets"
   column, marks it "Start cooking" then "Mark ready".
3. **Reception** sees it move to "Ready", marks it served, opens the bill, and
   records payment (Cash / Card / QR). The table automatically frees up once paid.
4. **Admin** manages the menu, categories, tables, and sees a live overview
   (orders today, revenue, active tickets).

## Project structure

```
hotel-management-system/
├── backend/          Django REST API
│   ├── accounts/     custom User model with roles (admin/employee/kitchen/reception)
│   ├── menu/         categories & menu items
│   ├── tables/       dining tables
│   ├── orders/       orders, order items, status & payment workflow
│   └── hotelapp/     project settings
└── frontend/         React (Vite) app
    └── src/
        ├── pages/           one dashboard per role
        ├── components/      Sidebar, StatusBadge, layout, route guard
        ├── context/         auth state (JWT)
        ├── hooks/usePolling  near-real-time updates without a websocket server
        └── api/client.js    axios instance with JWT refresh
```

## Running it locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo      # creates demo users, tables, and a menu
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/api/`. Django admin is at `/admin/`
(login with `admin` / `admin123` after seeding).

**Demo accounts created by `seed_demo`:**

| Role      | Username    | Password      |
|-----------|-------------|---------------|
| Admin     | admin       | admin123      |
| Waitstaff | employee1   | employee123   |
| Kitchen   | kitchen1    | kitchen123    |
| Reception | reception1  | reception123  |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. It talks to the API URL in `.env`
(`VITE_API_URL`, defaults to `http://127.0.0.1:8000/api`).

## Notes on scope / what to extend next

- **Real-time updates** currently use polling (every 3.5–4s) instead of
  WebSockets — reliable and zero extra infra to deploy. For true push updates,
  swap in Django Channels + a Redis-backed channel layer and replace
  `usePolling` with a WebSocket hook.
- **Payments** are recorded, not processed — QR/Card just log the method.
  Wire in Razorpay/Stripe on `orders/set_payment` if you need a live gateway.
- Good next additions: daily sales reports/export, inventory tracking,
  SMS/email receipts, printer integration for kitchen tickets.
