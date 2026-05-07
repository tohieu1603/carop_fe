# xengap.vn — Next.js port

Sàn giao dịch xe ngập nước minh bạch (B2C, marketplace có gatekeeper).

## Stack
- **Next.js 15** + App Router + TypeScript
- **Tailwind CSS** (giữ design tokens xanh lá từ prototype)
- **Zustand** cho state (role, auth, offer modal)
- **Mock data** trong `lib/mock-data.ts` (chưa dùng Prisma — sẵn sàng thay bằng DB sau)
- **Route handlers** giả lập REST API: `app/api/*`

## Cài đặt

```bash
cd nextjs-app
npm install
npm run dev
```

Mở http://localhost:3000

## Cấu trúc

```
nextjs-app/
├── app/
│   ├── layout.tsx              # Root layout + providers
│   ├── page.tsx                # Trang chủ
│   ├── globals.css             # Design tokens + Tailwind
│   ├── (public)/
│   │   ├── browse/page.tsx     # Danh sách xe
│   │   ├── cars/[id]/page.tsx  # Chi tiết xe
│   │   ├── sell/page.tsx       # Đăng tin
│   │   ├── checkout/[id]/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── verification/page.tsx
│   │   └── login/page.tsx
│   ├── dashboard/              # Buyer + Seller dashboard
│   │   └── page.tsx
│   ├── admin/                  # Admin (full visibility)
│   │   ├── layout.tsx          # Admin shell
│   │   ├── page.tsx            # Tổng quan
│   │   ├── listings/page.tsx
│   │   ├── listings/[id]/page.tsx
│   │   ├── users/page.tsx
│   │   ├── escrow/page.tsx
│   │   └── reports/page.tsx
│   └── api/
│       ├── cars/route.ts
│       ├── cars/[id]/route.ts
│       ├── offers/route.ts
│       └── auth/route.ts
├── components/                 # Shared UI
│   ├── icons.tsx
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── car-card.tsx
│   ├── role-switcher.tsx
│   └── offer-modal.tsx
├── lib/
│   ├── mock-data.ts            # Tất cả mock (cars, offers, buyers...)
│   ├── types.ts                # TS types
│   ├── format.ts               # formatVND, etc.
│   └── store.ts                # Zustand stores
└── public/
```

## Chuyển sang Prisma sau này

Tất cả data access đi qua `lib/mock-data.ts`. Khi sẵn sàng dùng DB:

1. `npm i prisma @prisma/client`
2. `npx prisma init`
3. Tạo schema dựa trên types trong `lib/types.ts`
4. Thay export trong `lib/mock-data.ts` bằng prisma queries
5. Pages không cần sửa

## Logic vận hành

- **Buyer** thấy: thông tin xe, không thấy seller info, gửi offer → đặt cọc 1%
- **Seller** thấy: số người quan tâm, top offer (qua xengap.vn), không thấy buyer
- **Admin** thấy: full data, spread = topOffer − minSeller, chốt deal

Role switcher ở góc trên-phải để demo (giữ nguyên từ prototype).
