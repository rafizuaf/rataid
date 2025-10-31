# rataid

Monorepo yang berisi backend NestJS GraphQL dan frontend Next.js untuk katalog e‑commerce sederhana. Termasuk jawaban tertulis untuk Pertanyaan 1–4 di `answers.md` serta implementasi untuk Pertanyaan 5–6 (GraphQL API + UI).

## Stack

- Backend: NestJS v10, Apollo GraphQL, TypeScript
- Frontend: Next.js 16 (App Router), Tailwind CSS
- Data: Redux Toolkit + RTK Query (GraphQL over fetch) dengan optimistic updates
- UI: Shadcn UI, Framer Motion
- Forms/Validation: React Hook Form + Zod
- Tooling: GraphQL Code Generator, Vitest (unit tests), Playwright (E2E tests)

## Struktur Repo

- `backend/` — Server NestJS GraphQL dengan fitur CRUD produk dan pencarian
- `frontend/` — Aplikasi Next.js dengan UI modern untuk query/mutation produk
- `answers.md` — Jawaban markdown untuk Pertanyaan 1–4

### Struktur Frontend

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Halaman utama (product catalog)
│   ├── providers.tsx       # Redux & Toast providers
│   └── layout.tsx          # Root layout
├── components/
│   ├── catalog/                   # Komponen katalog produk
│   │   ├── ProductFormModal.tsx   # Modal untuk create/update (modular)
│   │   ├── ProductList.tsx        # Daftar produk dengan card UI
│   │   ├── SearchCard.tsx         # Filter & search dengan chips
│   │   └── StatsCard.tsx          # Statistik produk
│   └── ui/                 # Shadcn UI components
├── lib/
│   ├── types/              # Type definitions terpisah
│   │   ├── graphql.ts      # GraphQL infrastructure types (reusable)
│   │   └── products.ts     # Product domain types
│   ├── productsApi.ts      # RTK Query API slice untuk GraphQL
│   └── store.ts            # Redux store configuration
└── graphql/
    ├── generated.ts        # Generated types dari Codegen
    └── operations.graphql  # GraphQL queries & mutations
```

## Backend

Run server side GraphQL:

```bash
cd backend
npm run start:dev
```

- URL: `http://localhost:3001/graphql`
- CORS: diaktifkan untuk `http://localhost:3000`

Operasi yang diimplementasikan:

```graphql
type Query {
  product(id: ID!): Product
  products(
    name: String, category: String, active: Boolean, slug: String,
    first: Int, after: String
  ): ProductConnection!
}

type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}
```

Model Product:

```graphql
type Product {
  id: ID!
  sku: String!           # Stock Keeping Unit (identifikasi unik produk)
  slug: String!         # URL-friendly identifier (otomatis di-generate dari nama)
  name: String!
  description: String
  priceCents: Int!      # Harga dalam sen (untuk presisi mata uang)
  currency: String!
  active: Boolean!
  categories: [String!]!
  deletedAt: DateTime   # Soft delete (opsional)
}
type ProductEdge { cursor: String!, node: Product! }
type PageInfo { endCursor: String, hasNextPage: Boolean! }
type ProductConnection { edges: [ProductEdge!]!, pageInfo: PageInfo! }
```

Notes:

- `backend/src/app.module.ts` — Config GraphQLModule, import `ProductsModule`
- `backend/src/main.ts` — CORS + port (3001)
- `backend/src/products/*` — resolver, service, types (input/model)
- **Mock Data**: Backend initialize 3 produk mock dengan ID static pada startup (tersedia di constructor `ProductsService`)

## Frontend

Run client side Next.js:

```bash
cd frontend
npm run dev
```

- URL: `http://localhost:3000`
- Endpoint GraphQL dapat dikonfigurasi via `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (default `http://localhost:3001/graphql`).

### Fitur UI & UX

**Komponen Utama:**
- **ProductFormModal**: Modal modular untuk create/update produk (semua field tersedia, validasi dengan Zod)
- **ProductList**: Daftar produk dengan card UI, toggle aktif/nonaktif langsung dari card
- **SearchCard**: Filter produk (name, category, active, slug) dengan debouncing + chips untuk filter aktif
- **StatsCard**: Statistik produk (total, active, inactive)

**Fitur Interaktif:**
- **Toggle Active Status**: Switch langsung dari product card atau via modal
- **Modal Create/Update**: UI modal modern dengan semua field (SKU, name, slug, price, currency, active, categories)
- **Filter Chips**: Menampilkan filter yang sedang aktif dengan tombol reset
- **Optimistic UI**: Update UI secara langsung untuk create/update/delete dengan rollback otomatis pada error
- **Form Validation**: Validasi dengan React Hook Form + Zod (SKU & Name wajib, harga >= 0, currency wajib)
- **Loading States**: Skeleton loaders, disabled states pada button, loading indicators
- **Error Handling**: Toast notifications (Sonner) untuk sukses/gagal, error handling GraphQL yang robust
- **Cursor Pagination**: Pagination dengan `first`/`after` + tombol "Load More"

**UX Enhancements:**
- Submit form dengan Enter key
- Focus pada field pertama yang invalid setelah submit gagal
- Animasi dengan Framer Motion
- Visual feedback: badge hijau untuk active, switch hijau untuk status aktif

### Type Safety

**Type Organization:**
- `lib/types/graphql.ts` - GraphQL infrastructure types (reusable untuk API GraphQL lain)
  - `GraphQLError`, `GraphQLResponse<T>`, `FetchBaseQueryResult<T>`
- `lib/types/products.ts` - Product domain types
  - `Product`, `ProductEdge`, `PageInfo`, `ProductConnection`
- `lib/productsApi.ts` - Re-exports product types untuk backward compatibility

**Type Safety Features:**
- **Zero `any` types**: Semua types fully typed dengan TypeScript
- **GraphQL Codegen**: Types di-generate dari schema untuk end-to-end type safety
- **RTK Query**: Types untuk queries/mutations menggunakan generated types dari Codegen
- **Error Handling**: Custom `baseQuery` untuk handle GraphQL errors (200 status dengan errors array)

Setup klien GraphQL: `app/providers.tsx` menggunakan **RTK Query** (Redux Toolkit Query) untuk data fetching dan caching dengan type safety penuh.

## Environment

Opsional buat `.env.local` di `frontend/`:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
```

## Testing & Codegen

Script penting (jalankan dari folder `frontend/`):

```bash
# Unit tests (Vitest + React Testing Library)
npm run test
npm run test:watch
npm run test:ui

# E2E tests (Playwright)
npm run e2e
npm run e2e:headed
npm run e2e:report

# Generate TypeScript types dari GraphQL schema + operasi
npm run codegen
```

Notes untuk menjalankan Codegen:
- **Pastikan backend berjalan** di `http://localhost:3001` sebelum menjalankan `npm run codegen`
- Codegen akan mengambil schema via GraphQL introspection dari endpoint live
- File yang di-generate: `frontend/graphql/generated.ts` (types untuk operasi GraphQL)

## Setup Awal

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Notes**: Backend harus berjalan sebelum menjalankan frontend atau codegen.

### Generate Types (Opsional tapi Disarankan)

```bash
cd frontend
# Pastikan backend berjalan di port 3001
npm run codegen    # Generate types dari GraphQL schema
```

## **Important Notes**

- **Data hanya tersimpan di memori** (restart server akan mereset data kecuali mock data dengan ID static)
- Pindahkan `ProductsService` ke database (PostgreSQL/MongoDB) atau API katalog eksternal (HTTP/gRPC) untuk production
- **SKU dan Slug harus unik** — validasi dilakukan di service layer dengan error yang jelas
- **Soft delete** — produk yang dihapus disimpan dengan `deletedAt`, tidak dihapus permanen
- **Mock Data**: Backend menginisialisasi 3 produk mock (MacBook Pro, iPhone 15 Pro, Sony WH-1000XM5) dengan ID static pada startup
- Jawaban untuk Pertanyaan 1–4 ada di `answers.md` pada root repo
- **Type safety**: 
  - Semua operasi GraphQL menggunakan types yang di-generate oleh Codegen
  - Types terorganisir di `lib/types/` untuk reusability dan maintainability
  - Zero `any` types — semua fully typed dengan TypeScript
  - GraphQL error handling terintegrasi di RTK Query `baseQuery`

## Tests

Menjalankan unit test untuk backend:

```bash
cd backend
npm install

# Unit test
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

Catatan:

- Konfigurasi Jest berada di `backend/package.json` (key `jest`).
- Spesifikasi unit test ada di `backend/src/**/*.spec.ts`.