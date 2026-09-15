# 📚 BookWorm — Online Bookstore

A full-stack online bookstore built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **PostgreSQL**.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your PostgreSQL connection string, NextAuth secret, and Stripe keys
```

### 3. Set up the database
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to PostgreSQL
npm run db:seed       # Seed with sample books and categories
```

### 4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure

```
bookstore/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data seeder
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles
│   └── components/
│       ├── Navbar.tsx      # Navigation header
│       ├── Footer.tsx      # Site footer
│       └── BookCard.tsx    # Reusable book card
├── .env.example            # Environment variable template
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🛍️ Customer Journey (Architecture)

| Step | Module | Features |
|------|--------|----------|
| 1–3 | **E-store Home** | Login, Order History, Buy Again, Recommendations |
| 5–8 | **Catalogue** | Browse by Category/Brand, Product Detail, Add to Cart |
| 9–12 | **Payment** | Delivery Address, Payment Gateway, Gift Points, Confirmation |

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Long random string for session signing |
| `NEXTAUTH_URL` | Base URL of your app |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## 🔒 Security Notes

- Secrets are stored in environment variables — never hardcoded
- `.env` files are in `.gitignore`
- Payments go through Stripe's PCI-compliant gateway
- Passwords are hashed with bcryptjs
- All DB queries use Prisma's parameterised queries (SQL injection safe)
