<div align="center">

# 🌹 Rosa Admin

**A modern, bilingual (EN/FA) admin dashboard for a beauty e-commerce shop.**

Built with React 19, TypeScript, Tailwind CSS, Zustand, and Three.js.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

### 🚀 [Live Demo](https://rosa-admin.vercel.app/)

**Demo credentials:**
`admin@rosa.com` / `rosa123`

</div>

---

## 📸 Screenshots

### Dashboard — Light Mode
![Dashboard Light](./screenshots/dashboard-light.png)

### Dashboard — Dark Mode
![Dashboard Dark](./screenshots/dashboard-dark.png)

### Bilingual (Persian RTL)
![Dashboard Persian](./screenshots/dashboard-fa.png)

### Login with 3D Scene
![Login](./screenshots/login.png)

### Orders Management
![Orders](./screenshots/orders.png)

### Products Catalog
![Products](./screenshots/products.png)

### Mobile View
<img src="./screenshots/mobile.png" alt="Mobile" width="300" />

---

## ✨ Features

### 🌐 Bilingual Support
Full **English & Persian** interface with automatic **RTL** layout switching and dedicated **Vazirmatn** font for Persian.

### 🌙 Dark Mode
Persistent **dark/light theme** with system-aware defaults and smooth transitions.

### 🔐 Authentication
**Mock authentication** with **protected routes**, return-URL support, and persistent sessions via localStorage.

### 🎮 3D Visuals
**Three.js** powered scenes:
- **Login page** — animated atom (electrons orbiting the nucleus)
- **Dashboard hero** — wireframe icosahedron with starfield

### 📊 Interactive Analytics
**Recharts** powered visualizations:
- Donut chart — Orders by status
- Area chart — Revenue trend
- Bar chart — Monthly orders

### 🛒 Orders Management
Full **CRUD** operations:
- ➕ Create, ✏️ Edit, 🗑️ Delete
- 🔍 Search by customer, product, or ID
- 🎯 Filter by status
- 💾 **Zustand** state management with persistence

### 📦 Products Catalog
- Card grid with **category filters**
- **Stock status badges** (In stock / Low / Out of stock)
- Emoji-based product visuals

### 👥 Customers Analytics
**Derived data** from orders:
- Unique customer aggregation
- **VIP / Regular / New** segmentation
- Total spent & last order tracking

### ⚙️ Settings
- Profile management
- Theme preference
- Danger zone (sign out)

### 📱 Fully Responsive
- **Mobile drawer sidebar** with hamburger menu
- Adaptive tables with horizontal scroll
- Grid layouts that scale from mobile to 4K

### ⚡ Performance
- **Lazy-loaded routes** (React.lazy + Suspense)
- **Manual chunks** for React, Three.js, Recharts, Zustand
- 3D assets load **in the background** for instant initial render

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Core
- **React 19** — UI library
- **TypeScript 5** — Type safety
- **Vite 8** — Build tool
- **React Router 7** — Routing

### Styling
- **Tailwind CSS 3** — Utility-first CSS
- **Vazirmatn** — Persian font

</td>
<td valign="top" width="50%">

### State & Data
- **Zustand** — State management
- **Recharts** — Charts
- **i18next** + **react-i18next** — i18n

### 3D & Visuals
- **Three.js**
- **@react-three/fiber**
- **@react-three/drei**
- **lucide-react** — Icons

</td>
</tr>
</table>

---

## 🏗️ Project Structure

```
src/
├── components/              # Reusable UI
│   ├── layout/              # Layout shell
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx      # Mobile drawer support
│   ├── StatCard.tsx
│   ├── StatusBadge.tsx
│   ├── ProtectedRoute.tsx
│   ├── ThemeApplier.tsx
│   └── LanguageApplier.tsx
│
├── features/                # Feature modules
│   ├── auth/                # Authentication store
│   ├── theme/               # Dark mode store
│   ├── language/            # i18n store
│   ├── orders/              # Orders CRUD + table + modal
│   ├── customers/           # Customers table
│   ├── charts/              # Donut / Area / Bar charts
│   └── three/               # 3D scenes (Login + Hero)
│
├── pages/                   # Route pages
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Orders.tsx
│   ├── Products.tsx
│   ├── Customers.tsx
│   └── Settings.tsx
│
├── lib/                     # Pure utilities
│   ├── stats.ts             # Dashboard statistics
│   └── customers.ts         # Customer aggregation
│
├── data/                    # Mock data
│   ├── orders.ts
│   └── products.ts
│
├── types/                   # TypeScript types
│   ├── order.ts
│   └── product.ts
│
└── i18n/                    # Translations
    ├── index.ts
    └── locales/
        ├── en.json
        └── fa.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**

### Installation

```bash
# Clone
git clone https://github.com/mohsen-goli/rosa-admin.git
cd rosa-admin

# Install
npm install

# Dev server
npm run dev
```

Open **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎯 Key Technical Decisions

### 1. Feature-Based Architecture
Each domain (`orders`, `charts`, `three`, ...) is **self-contained** with its own components, stores, and logic. This scales cleanly as the app grows.

### 2. Type-Safe State with Zustand
All stores are fully typed. Order CRUD uses advanced TypeScript utilities:
```ts
addOrder: (order: Omit<Order, 'id'>) => void;
updateOrder: (id: string, updates: Partial<Order>) => void;
```

### 3. Code Splitting
Routes and heavy libraries are **lazy-loaded**:
```tsx
const Dashboard = lazy(() => 
  import('./pages/Dashboard').then(m => ({ default: m.Dashboard }))
);
```
**Result:** Login loads in ~4KB JS, with 3D assets streaming in the background.

### 4. Bilingual with Auto-RTL
Using `i18next` with runtime `dir="rtl"` switching. Tailwind utilities like `ps-*`, `pe-*`, `text-start`, `text-end` handle RTL automatically.

### 5. Derived Data
The **Customers** page doesn't store data — it derives it from orders:
```ts
orders.reduce(...)  // Aggregate totals
new Set(...)        // Count unique customers
```
This follows the **single source of truth** principle.

### 6. RTL-Aware 3D & Drawer
The mobile sidebar drawer computes its transform based on the active language direction:
```tsx
const closedTransform = isRTL ? 'translateX(100%)' : 'translateX(-100%)';
```

---

## 📈 Performance

| Metric | Value |
|---|---|
| Initial bundle (Login) | **~4 KB** JS |
| Dashboard route | **~411 KB** (includes Recharts + Hero) |
| 3D library (lazy) | **~926 KB** (loads in background) |
| Vendor chunks | React, Three.js, Recharts, Zustand — all separated |

---

## 🔮 Future Improvements

- [ ] Real backend API integration (Node + Express)
- [ ] JWT authentication
- [ ] Unit & E2E tests (Vitest + Playwright)
- [ ] Product image uploads (Cloudinary)
- [ ] Advanced analytics dashboard
- [ ] Role-based access control (RBAC)
- [ ] PDF invoice export
- [ ] Email notifications

---

## 👨‍💻 Author

**Mohsen Golzad** — Junior Frontend Developer

[![GitHub](https://img.shields.io/badge/GitHub-mohsen--goli-181717?logo=github&logoColor=white)](https://github.com/mohsen-goli)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mohsen_Golzad-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mohsen-golzad-a5495319b/)

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**⭐ If you like this project, consider giving it a star!**

Made with ❤️ by Mohsen Golzad

</div>
