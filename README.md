<div align="center">

# 🏨 Hotel Order Management System

### A role-based order management platform for a restaurant floor — waitstaff, kitchen, and reception, all in sync.

[![Django](https://img.shields.io/badge/Django-6.1-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![DRF](https://img.shields.io/badge/DRF-REST%20API-A30000?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-FFD43B?style=for-the-badge&logo=jsonwebtokens&logoColor=black)](https://jwt.io/)

[![Deploy Status](https://img.shields.io/badge/Backend-Live%20on%20Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://hotel-management-system-1-u6g7.onrender.com)
[![Netlify Status](https://img.shields.io/badge/Frontend-Live%20on%20Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)

**[🔗 Live Demo](#)** &nbsp;·&nbsp; **[📖 API Docs](#-api-reference)** &nbsp;·&nbsp; **[🐛 Report a Bug](../../issues)**

</div>

<br>

## 📋 Overview

An internal operations tool that digitises how a restaurant/hotel floor actually runs — not a customer-facing app, but the system staff use behind the scenes.

```
  Customer at table
        │
        ▼
  🧾  EMPLOYEE   takes the order on a tablet/PC
        │
        ▼
  🍳  KITCHEN    sees the ticket live, cooks, marks it Ready
        │
        ▼
  🧑‍💼  RECEPTION  marks it Served, takes payment (Cash / Card / QR)
        │
        ▼
  ✅  Table automatically freed for the next customer
```

<br>

## ✨ Features

| | |
|---|---|
| 🔐 **Role-based access** | Admin, Employee, Kitchen, and Reception each get their own dashboard — enforced on the API, not just hidden buttons |
| 🍽️ **Live menu builder** | Waitstaff pick a table, browse categorised dishes, and build an order in a running cart |
| 🍳 **Kitchen ticket board** | Kanban-style queue: New → Preparing → Ready, updating near-instantly via polling |
| 💳 **Flexible payments** | Reception settles bills with Cash, Card, or QR/UPI |
| 🪑 **Smart table tracking** | Tables auto-free once every order against them is paid |
| 📊 **Admin overview** | Live stats — orders today, revenue, active tickets — plus full menu & table management |
| 🔑 **JWT auth with silent refresh** | Access tokens refresh automatically in the background, no surprise logouts |

<br>

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Backend**
- Python + Django + Django REST Framework
- SimpleJWT (access + refresh tokens)
- SQLite (dev) / PostgreSQL-ready (prod)
- django-cors-headers

</td>
<td valign="top" width="50%">

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Axios (with auto token refresh)

</td>
</tr>
</table>

<br>

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo        # demo users, tables, and menu
python manage.py runserver
```

API runs at `http://127.0.0.1:8000/api/` · Django admin at `/admin/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` · talks to the API via `VITE_API_URL` in `.env`

<br>

## 🔑 Demo Accounts

| Role | Username | Password |
|:---|:---|:---|
| 🛠️ Admin | `admin` | `admin123` |
| 🧾 Waitstaff | `employee1` | `employee123` |
| 🍳 Kitchen | `kitchen1` | `kitchen123` |
| 🧑‍💼 Reception | `reception1` | `reception123` |

<br>

## 📡 API Reference

| Method | Endpoint | Role | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/token/` | anyone | Login, returns JWT with role embedded |
| `POST` | `/api/auth/token/refresh/` | anyone | Refresh an expired access token |
| `GET` | `/api/menu/items/` | staff | List menu items |
| `POST` `PATCH` | `/api/menu/items/` | admin | Create / update a dish |
| `GET` | `/api/tables/` | staff | List dining tables |
| `POST` | `/api/orders/` | employee | Create an order |
| `GET` | `/api/orders/` | staff | List orders, auto-filtered by role |
| `PATCH` | `/api/orders/{id}/set_status/` | kitchen/reception | Advance order status |
| `PATCH` | `/api/orders/{id}/set_payment/` | reception | Record payment & mark paid |

<br>

## 📂 Project Structure

```
hotel-management-system/
├── backend/               Django REST API
│   ├── accounts/          custom User model with roles
│   ├── menu/               categories & menu items
│   ├── tables/             dining tables
│   └── orders/             orders, items, status & payment workflow
└── frontend/               React (Vite) app
    └── src/
        ├── pages/          one dashboard per role
        ├── components/     Sidebar, StatusBadge, route guard
        ├── context/        JWT auth state
        └── hooks/          usePolling — near-real-time updates
```

<br>

## 🗺️ Roadmap

- [ ] Live payment gateway integration (Razorpay)
- [ ] WebSocket-based updates for the kitchen screen
- [ ] Daily sales reports & export
- [ ] Printer integration for kitchen tickets

<br>

<div align="center">

Built by **[Anuranjkrishna K](https://github.com/anuranjkrishna)**
&nbsp;·&nbsp;
[LinkedIn](https://linkedin.com/in/anuranjkrishna-k-82619740a)

</div>
