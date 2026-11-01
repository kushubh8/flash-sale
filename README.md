# Deals / Flash-Sale Platform

Express + TypeScript backend for a deals / flash-sale platform. Sellers create
time-bound deals that carry a limited quantity of items; users claim an item
from an active deal, which books an order and decrements the item's available
quantity.

> This is a scaffold. The HTTP layer and service/domain logic are in place, but
> the persistence layer is **stubbed** (repositories return hardcoded values and
> do not write to Postgres). See the "Persistence status" note below for what is
> and isn't wired up.

## Tech stack

- **Runtime:** Node.js (18+ recommended; `@types/node` is `^20.8.4`)
- **Language:** TypeScript (`target: es2017`, `module: commonjs`, `strict`)
- **HTTP framework:** Express
- **ORM:** TypeORM (Postgres driver) with `reflect-metadata` for decorators

## What the project is about

A flash-sale / deals platform with two actors:

- **Sellers** create deals. A deal belongs to a seller, has an `endTime`
  (and a `startTime` field, though it is not currently set), and carries a list
  of items. Each item has a `name`, `price`, `qty` (total quantity) and `avlQty`
  (available quantity). When a deal is created, `avlQty` is seeded from `qty`.
- **Users** claim an item from an active deal. A successful claim books an order
  for that user/item and decrements the item's available quantity.

## Use cases

These are the concrete flows the controllers/routes implement:

1. **Seller signup** — `PUT /seller` with an email. *Stub:* returns a fixed
   `{ email, id: 123 }` and does not persist a seller.
2. **Seller creates a deal** — `PUT /deal` with `sellerId`, `endTime` and items.
   The service builds a `Deal`, sets `sellerId`/`endTime`, asks the deal
   repository to create it, maps the items via `Item.toModel` (seeding `avlQty`
   from `qty`), sets the returned deal id back on the deal, then asks the item
   repository to persist the items.
3. **Seller updates a deal** — `POST /deal/:dealId`. The service branches on the
   body:
   - `isDealClosed` truthy → mark the deal inactive and **stop** (no time/items
     changes).
   - `endTime` truthy → extend the deal's end time.
   - `items` with length > 0 → replace the deal's items.
   - These can combine (e.g. `endTime` + `items`). If `items` is `undefined`
     while `endTime` is set, the service reads `items.length` directly and
     throws a `TypeError` — a known quirk, not a guarded path.
   - There is no existence check: the repository layer forwards the given
     `dealId` regardless of whether the deal exists.
4. **User signup** — `PUT /user` with an email. *Stub:* returns a fixed
   `{ email, id: 123 }` and does not persist a user.
5. **User claims a deal item** — `POST /user/claim-deal` with `dealId`/`itemId`.
   The service checks, in order, that the user hasn't already claimed this item,
   that the deal is still active, and that the item is still available; on
   success it books an order and decrements the item's available quantity. Each
   failed check throws a specific error message.

## How to set up and run PostgreSQL

The app connects to Postgres through a TypeORM `DataSource` configured in
`src/lib/db.ts`. **All connection values are hardcoded** — the app reads **no
environment variables**:

| Setting | Value |
|---------|-------|
| `type` | `postgres` |
| `host` | `localhost` |
| `port` | `55000` |
| `username` | `postgres` |
| `password` | `sunil123` |
| `database` | `allen` |
| `synchronize` | `true` |
| `logging` | `false` |
| `entities` | `[]` (empty) |
| `migrations` | `[]` |
| `subscribers` | `[]` |

The connection is initialized lazily: `DBConnection.initConnection()` only
calls `DataSource.initialize()` the first time (it caches the result on the
static `DBConnection.appDataSource`), so the server boots without Postgres
being up. In the current scaffold, only the **create-deal** flow triggers
`initConnection`: `DealItemRepository.createItem` constructs a `Deal` (which
`extends DBConnection`) and calls the inherited `initConnection()`. The claim
and update flows use stubbed repository methods (`isDealActive`,
`isProductAvailable`, `updateQty`, `markDealInActive`, `extendDealTime`,
`updateItems`) that return constants and never open a connection, so they do
not need Postgres in this scaffold. (Once those stubs are replaced with real
queries, those flows would also need a reachable Postgres.)

### Option A — Docker (simplest way to match the config)

```bash
docker run --name allen-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=sunil123 \
  -e POSTGRES_DB=allen \
  -p 55000:5432 \
  -d postgres:15
```

This maps host port `55000` to the container's `5432` and creates the `postgres`
user / `sunil123` password / `allen` database exactly as the app expects. To
restart it later: `docker start allen-postgres`.

### Option B — Local install (macOS via Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

The app expects port `55000` (not the default `5432`) and a `postgres` role with
password `sunil123`. One way to match that:

```bash
# Start a Postgres instance listening on 55000
postgres -D $(brew --prefix)/var/postgresql@15 -p 55000 &

# Create the postgres superuser role if it does not exist, then the database
createuser -p 55000 -s postgres
psql -p 55000 -U postgres -c "ALTER USER postgres PASSWORD 'sunil123';"
createdb -p 55000 -U postgres allen
```

(On Homebrew, the default superuser is your OS user, not `postgres`, hence the
`createuser` step.)

### Persistence status (read this before expecting data to be saved)

- **There are no SQL migration files or init scripts in this repo.** Schema is
  intended to be managed by TypeORM's `synchronize`, not migrations.
- **The DataSource `entities: []` is empty.** The `Deal`, `Item` and
  `OrderModel` classes are decorated as TypeORM entities, but they are **not**
  registered in the DataSource `entities` array, so `synchronize: true`
  currently creates **no tables**.
- **The repository layer is stubbed.** `DealRepository.createDetail` returns
  the hardcoded string `'1'`; `isDealActive`/`isProductAvailable`/`updateQty`/
  `updateItems` return `true`; and `markDealInActive`/`extendDealTime` are empty
  (return `undefined`). Nothing is actually persisted.

To make persistence real you would need to: register the entities in the
`DataSource` `entities` array (e.g. `entities: [Deal, Item, OrderModel]`) and
replace the stub repository bodies with real TypeORM queries (or add migrations
and turn `synchronize` off for production). Those are not part of this scaffold.

## Steps to run the project

Requires Node.js 18+ (20+ matches the `@types/node ^20.8.4` typings).

```bash
npm install            # install dependencies
npm start              # dev: nodemon src/server.ts (serves on port 3000)
npm run build          # compile with tsc -p tsconfig.json into dist/
npm run start:build    # run the compiled build: node dist/server.js
npm run build:watch    # compile in watch mode (npx tsc -w)
```

`npm start` (nodemon) runs `src/server.ts` via `ts-node`. The server logs
`Example app listening on port 3000` and serves routes even when Postgres is not
running, because no DB connection is initialized at boot.

## Unit tests

Tests run with **Jest + ts-jest** (added as devDependencies). They live in
`tests/` and are configured via `jest.config.ts` + `tsconfig.spec.json`.

```bash
npm test               # run all unit tests with Jest
```

The tests require **no running Postgres and no network**: repositories are
mocked, and the one repository method that touches the connection
(`DealItemRepository.createItem`) is tested using `DBConnection.appDataSource`
cache guard so the connection is never actually opened.

What is covered:

- **Pure domain logic** (`tests/deals/domain.test.ts`) — `Item.toModel`
  (including `avlQty` seeded from `qty`, ordering, empty input) and `Deal`
  setters / default `items`.
- **`DealService`** (`tests/deals/deal.service.test.ts`) — `createDeal` (deal
  built from the request, items mapped, persisted with the returned id) and
  every `updateDeal` branch (close / extend / replace items / both / the
  `items: undefined` `TypeError` / the no-existence-check behaviour), with
  repositories mocked via `jest.mock`.
- **`UserService.claimDeal`** (`tests/user/user.service.test.ts`) — all four
  branches (already-claimed, expired deal, sold-out item, success) with the
  three repositories mocked.
- **`DealItemRepository.createItem`** (`tests/repositories/deal-item.repository.test.ts`)
  — resolves to `'1'` with no DB, using the `appDataSource` cache guard.

Intentionally **not** covered (documented as gaps):

- **Controllers** (`DealController`, `UserController`, `SellerController`) — thin
  pass-throughs to the services; testing them would require a live HTTP server
  (supertest) or mocking the service modules for little additional value.
- **Trivial stub repository methods** (`isDealActive`, `isProductAvailable`,
  `updateQty`, `bookOrder`, `isUserClaimDeal`, `updateItems`, etc.) — they just
  return a constant; they are exercised indirectly via the service mocks rather
  than given dedicated tests that would only restate `return true`.

## Notes & limitations

- Postgres credentials are hardcoded in `src/lib/db.ts`; move them to
  environment variables before any real deployment.
- The repository layer is stubbed and does not persist data; see "Persistence
  status" above.
- Signup endpoints (`/seller`, `/user`) are stubs that echo the email and a
  fixed id and do not create accounts.
