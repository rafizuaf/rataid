## Pertanyaan 1: TypeScript

**Apa itu TypeScript?**

TypeScript adalah superset dari JavaScript yang menambahkan static types (pengetikan statis) dan fitur-fitur modern lain (mis. interface, enum, generics, type aliases). TypeScript dikompilasi ke JavaScript agar bisa dijalankan di runtime (browser/Node).
TypeScript memberikan label ke data. Teks harus teks, angka harus angka. Kalau salah, langsung 'ditegur'.

**Keunggulan utama dibanding JavaScript**

- **Static typing**: Menangkap error saat compile, API lebih terdokumentasi.
- **Tooling lebih baik**: Autocomplete, safe-refactor.
- **Fitur modern**: Interface, enum, generics, decorators, namespaces.
- **Adopsi bertahap**: Tipe data bersifat opsional, kompatibel dengan JS via `any` dan JSDoc.
- **Ekosistem**: Dukungan editor kuat dan integrasi dengan tool build.

**Contoh sederhana tipe data**

```ts
// Basic types
let productName: string = "Laptop";
let price: number = 1499.99;
let inStock: boolean = true;

// Array dan tuple
let tags: string[] = ["electronics", "laptop"];
let coord: [number, number] = [40.7, -74.0];

// Interface dan object
interface Product {
  id: string;
  name: string;
  price: number;
  tags?: string[];
}

const p: Product = { id: "p1", name: productName, price, tags };

// Function dengan params dan return yang type-safe
function applyDiscount(product: Product, percent: number): Product {
  const discounted = { ...product, price: product.price * (1 - percent / 100) };
  return discounted;
}
```

---

**Entitas dan relasi**

- **users** (1) —< **orders** (N)
- **orders** (1) —< **order_items** (N)
- **products** (1) —< **order_items** (N)
- **orders** (1) — 1 **payments** (optionally 1:1 or 1:N if partials/refunds)

Tabel pendukung opsional: **categories**, **product_categories** (M:N), **addresses** (users 1:N), **inventory** per SKU/lokasi.

**Relational schema**

- users(id PK, email UNIQUE, password_hash, name, created_at, updated_at)
- products(id PK, sku UNIQUE, name, description, price_cents, currency, active, created_at, updated_at)
- orders(id PK, user_id FK→users.id, status, subtotal_cents, tax_cents, shipping_cents, total_cents, currency, created_at, updated_at)
- order_items(id PK, order_id FK→orders.id, product_id FK→products.id, quantity, unit_price_cents, total_cents)
- payments(id PK, order_id UNIQUE FK→orders.id, provider, provider_ref, amount_cents, currency, status, created_at)
- categories(id PK, slug UNIQUE, name)
- product_categories(product_id FK→products.id, category_id FK→categories.id, PK(product_id, category_id))

Anggap ini buku catatan toko mainan:

- Users: orang yang belanja.
- Products: mainan di rak.
- Orders: struk belanja (bisa berisi banyak item).
- Order items: tiap mainan di struk + jumlah + harga saat dibeli.
- Payments: cara bayar struk itu.
- Categories: rak-rak (mis. “Mobil”, “Boneka”). Satu mainan bisa ada di banyak rak.

Kita kasih pembatas buku (indeks) supaya cepat cari: “order si Budi”, “mainan nama Mobil”, “produk aktif”.

**Indeks**

Skema inti:

- users(id, email unique, nama, waktu)
- products(id, sku unique, nama, deskripsi, price_cents, currency, active, waktu)
- orders(id, user_id→users, status, subtotal/tax/shipping/total dalam cent, waktu)
- order_items(id, order_id→orders, product_id→products, qty, unit_price_cents, total_cents)
- payments(id, order_id unique→orders, provider, provider_ref, amount_cents, currency, status, waktu)
- categories(id, slug unique, nama)
- product_categories(product_id→products, category_id→categories)

Kenapa begini?

- Harga saat beli disimpan di item, jadi struk lama tetap benar meski harga produk berubah.
- Uang disimpan dalam cent (angka bulat) supaya akurat.
- Indeks bikin pencarian cepat untuk hal-hal umum (riwayat order user, cari produk, laporan status/tanggal).

**Alasan desain**

- Normalisasi: pisahkan orders dari line items, ini untuk mencegah pergeseran harga dengan menyimpan `unit_price_cents` pada `order_items`.
- Nominal uang disimpan sebagai integer (cents) untuk nilai yang lebih presisi.
- Composite index support query umum: history order per user, pencarian produk berdasarkan nama/kategori, report berdasarkan status/tanggal.
- `payments.order_id` UNIQUE bikin 1:1 pembayaran per order; ubah ke 1:N jika mendukung multi-capture/refund.
- `product_categories` support relasi many-to-many dan filter kategori yang efisien.

**Konsistensi**

- Gunakan constraint database (FK, NOT NULL, CHECK untuk nilai tidak negatif).
- Transaksi: buat order → insert item → hitung total → insert payment intent secara atomik.
- Penyesuaian inventori terjadi dalam transaksi saat konfirmasi order.

---

## Pertanyaan 3: Sistem Perbankan OOP

```ts
type TransactionType = "deposit" | "withdrawal" | "transfer";
type TransactionStatus = "success" | "failed";

type DepositAudit = {
  toAccount: string;
  toBalanceBefore: number;
  toBalanceAfter: number;
};

type WithdrawalAudit = {
  fromAccount: string;
  fromBalanceBefore: number;
  fromBalanceAfter: number;
};

type TransferAudit = {
  fromAccount: string;
  toAccount: string;
  fromBalanceBefore: number;
  fromBalanceAfter: number;
  toBalanceBefore: number;
  toBalanceAfter: number;
};

type AnyAudit = DepositAudit | WithdrawalAudit | TransferAudit;

class Transaction {
  readonly id = crypto.randomUUID();
  readonly createdAt = new Date();
  constructor(
    readonly type: TransactionType,
    readonly amountCents: number,
    readonly status: TransactionStatus,
    readonly correlationId?: string,
    readonly audit?: AnyAudit,
    readonly errorMessage?: string
  ) {}
}

class Account {
  private balanceCents = 0;
  private history: Transaction[] = [];
  constructor(
    readonly accountNumber: string,
    readonly ownerName: string,
    initialCents = 0
  ) {
    if (initialCents < 0) throw new Error("Initial balance cannot be negative");
    this.balanceCents = initialCents;
  }
  getBalanceCents() {
    return this.balanceCents;
  }
  getHistory() {
    return [...this.history];
  }

  deposit(amountCents: number): Transaction {
    const before = this.balanceCents;
    if (amountCents <= 0) {
      const failed = new Transaction(
        "deposit",
        amountCents,
        "failed",
        undefined,
        {
          toAccount: this.accountNumber,
          toBalanceBefore: before,
          toBalanceAfter: before,
        } as DepositAudit,
        "Amount must be positive"
      );
      this.history.push(failed);
      throw new Error("Amount must be positive");
    }
    this.balanceCents += amountCents;
    const trx = new Transaction("deposit", amountCents, "success", undefined, {
      toAccount: this.accountNumber,
      toBalanceBefore: before,
      toBalanceAfter: this.balanceCents,
    } as DepositAudit);
    this.history.push(trx);
    return trx;
  }

  withdraw(amountCents: number): Transaction {
    const before = this.balanceCents;
    if (amountCents <= 0 || amountCents > this.balanceCents) {
      const failed = new Transaction(
        "withdrawal",
        amountCents,
        "failed",
        undefined,
        {
          fromAccount: this.accountNumber,
          fromBalanceBefore: before,
          fromBalanceAfter: before,
        } as WithdrawalAudit,
        amountCents <= 0 ? "Amount must be positive" : "Insufficient funds"
      );
      this.history.push(failed);
      throw new Error(failed.errorMessage!);
    }
    this.balanceCents -= amountCents;
    const trx = new Transaction(
      "withdrawal",
      amountCents,
      "success",
      undefined,
      {
        fromAccount: this.accountNumber,
        fromBalanceBefore: before,
        fromBalanceAfter: this.balanceCents,
      } as WithdrawalAudit
    );
    this.history.push(trx);
    return trx;
  }

  transfer(
    amountCents: number,
    target: Account
  ): {
    senderTrx: Transaction;
    receiverTrx: Transaction;
    transferTrx: Transaction;
  } {
    const correlationId = crypto.randomUUID();
    const fromBefore = this.balanceCents;
    const toBefore = target.balanceCents;

    if (amountCents <= 0) {
      const failed = new Transaction(
        "transfer",
        amountCents,
        "failed",
        correlationId,
        {
          fromAccount: this.accountNumber,
          toAccount: target.accountNumber,
          fromBalanceBefore: fromBefore,
          fromBalanceAfter: fromBefore,
          toBalanceBefore: toBefore,
          toBalanceAfter: toBefore,
        } as TransferAudit,
        "Amount must be positive"
      );
      this.history.push(failed);
      throw new Error(failed.errorMessage!);
    }
    if (amountCents > this.balanceCents) {
      const failed = new Transaction(
        "transfer",
        amountCents,
        "failed",
        correlationId,
        {
          fromAccount: this.accountNumber,
          toAccount: target.accountNumber,
          fromBalanceBefore: fromBefore,
          fromBalanceAfter: fromBefore,
          toBalanceBefore: toBefore,
          toBalanceAfter: toBefore,
        } as TransferAudit,
        "Insufficient funds"
      );
      this.history.push(failed);
      throw new Error(failed.errorMessage!);
    }

    this.balanceCents -= amountCents;
    target.balanceCents += amountCents;

    const senderTrx = new Transaction(
      "withdrawal",
      amountCents,
      "success",
      correlationId,
      {
        fromAccount: this.accountNumber,
        fromBalanceBefore: fromBefore,
        fromBalanceAfter: this.balanceCents,
      } as WithdrawalAudit
    );
    const receiverTrx = new Transaction(
      "deposit",
      amountCents,
      "success",
      correlationId,
      {
        toAccount: target.accountNumber,
        toBalanceBefore: toBefore,
        toBalanceAfter: target.balanceCents,
      } as DepositAudit
    );
    const transferTrx = new Transaction(
      "transfer",
      amountCents,
      "success",
      correlationId,
      {
        fromAccount: this.accountNumber,
        toAccount: target.accountNumber,
        fromBalanceBefore: fromBefore,
        fromBalanceAfter: this.balanceCents,
        toBalanceBefore: toBefore,
        toBalanceAfter: target.balanceCents,
      } as TransferAudit
    );

    this.history.push(senderTrx, transferTrx);
    target.history.push(receiverTrx);
    return { senderTrx, receiverTrx, transferTrx };
  }
}
```

---

## Pertanyaan 4: GraphQL untuk Microservices

**Desain schema efisien dan scalable (products, users, orders)**

```graphql
type Product {
  id: ID!
  sku: String!
  name: String!
  description: String
  priceCents: Int!
  currency: String!
  active: Boolean!
  categories: [Category!]!
}
type Category {
  id: ID!
  slug: String!
  name: String!
}
type User {
  id: ID!
  email: String!
  name: String
}
type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  totalCents: Int!
  currency: String!
}
type OrderItem {
  id: ID!
  product: Product!
  quantity: Int!
  unitPriceCents: Int!
}

type Query {
  product(id: ID!): Product
  products(
    filter: ProductFilter
    first: Int
    after: String
    sort: ProductSort
  ): ProductConnection!
  user(id: ID!): User
  order(id: ID!): Order
}

input ProductFilter {
  name: String
  categoryId: ID
  active: Boolean
}
enum ProductSort {
  NAME_ASC
  NAME_DESC
  PRICE_ASC
  PRICE_DESC
}

type ProductEdge {
  cursor: String!
  node: Product!
}
type PageInfo {
  endCursor: String
  hasNextPage: Boolean!
}
type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
}

type Mutation {
  createProduct(input: ProductInput!): Product!
  updateProduct(id: ID!, input: ProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}

input ProductInput {
  sku: String!
  name: String!
  description: String
  priceCents: Int!
  currency: String!
  active: Boolean!
  categoryIds: [ID!]
}
```

**Peran resolver di GraphQL**

- Resolver adalah fungsi yang mengambil data untuk sebuah field. Dia menerjemahkan query GraphQL ke pemanggilan backend (DB, HTTP/gRPC ke microservices), menghandle auth/validasi, dan mengembalikan data sesuai skema.

**Mengimplementasikan resolver**

- Di server (mis. NestJS + Apollo), definisikan kelas resolver dengan method untuk query/mutation dan field resolver. Gunakan DataLoader untuk batching dan caching. Mapping input ke service/repository dan kembalikan DTO/entity sesuai skema.

---