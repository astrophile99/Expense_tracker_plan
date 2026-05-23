# Finance Tracker - Database Schema

## Architecture Overview

PostgreSQL 15+ relational schema for a multi-tenant finance tracking application with workspace collaboration, designed for Supabase deployment.

### Entity Relationship Summary

```
users ──1:1──> profiles
users ──1:N──> workspaces (created_by)
users ──N:M── workspaces (via workspace_members)
users ──1:N──> transactions
users ──1:N──> recurring_transactions
users ──1:N──> budgets
users ──1:N──> notifications
users ──1:N──> activity_logs

workspaces ──1:N──> workspace_members
workspaces ──1:N──> workspace_invitations
workspaces ──1:N──> transactions
workspaces ──1:N──> recurring_transactions
workspaces ──1:N──> budgets
workspaces ──1:N──> categories
workspaces ──1:N──> activity_logs

categories ──1:N──> transactions
categories ──1:N──> recurring_transactions
categories ──1:N──> budgets
```

### Enum Types

| Enum | Values | Purpose |
|------|--------|---------|
| `transaction_type` | expense, income, cashback, refund, debt, transfer | Categorizes transaction financial impact |
| `transaction_visibility` | private, workspace | Controls data visibility scope |
| `workspace_role` | owner, admin, member, viewer | Defines member permissions |
| `recurrence_frequency` | daily, weekly, monthly, yearly | Schedule for recurring transactions |
| `budget_period` | weekly, monthly, yearly | Budget time window |
| `invitation_status` | pending, accepted, declined, expired, cancelled | Workspace invitation lifecycle |
| `payment_method` | credit_card, debit_card, bank_transfer, paypal, cash, apple_pay, google_pay, venmo, crypto, other | Transaction payment source |
| `currency_code` | USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL | ISO currency support |

---

## Tables

### `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | Maps to Supabase auth.users |
| email | TEXT | NOT NULL, UNIQUE | User's email address |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Purpose**: Extends Supabase Auth with app-specific user metadata.

### `profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | NOT NULL, UNIQUE, FK → users(id) ON DELETE CASCADE | References auth user |
| full_name | TEXT | NOT NULL, CHECK(1-100 chars) | Display name |
| avatar_url | TEXT | CHECK(~ '^https?://') | Profile picture URL |
| currency | currency_code | NOT NULL, DEFAULT 'USD' | Preferred currency |
| timezone | TEXT | NOT NULL, DEFAULT 'UTC' | IANA timezone |
| locale | TEXT | NOT NULL, DEFAULT 'en-US' | Locale for formatting |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Purpose**: Extended user profile with finance-specific preferences.
**Relationship**: 1:1 with `users`.

### `workspaces`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| name | TEXT | NOT NULL, CHECK(1-100 chars) | Workspace display name |
| description | TEXT | CHECK(≤500 chars) | Optional description |
| icon | TEXT | | Emoji or icon identifier |
| color | TEXT | CHECK(~ '^#[0-9a-f]{6}$') | Theme color hex |
| created_by | UUID | NOT NULL, FK → users(id) ON DELETE SET NULL | Creator reference |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Purpose**: Collaborative grouping for shared finance management.

### `workspace_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| workspace_id | UUID | NOT NULL, FK → workspaces(id) ON DELETE CASCADE | |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | |
| role | workspace_role | NOT NULL, DEFAULT 'member' | Permission level |
| invited_by | UUID | FK → users(id) ON DELETE SET NULL | Who invited this member |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| UNIQUE | | (workspace_id, user_id) | Prevents duplicates |

**Relationships**: N:1 with `workspaces`, N:1 with `users`.

### `workspace_invitations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| workspace_id | UUID | NOT NULL, FK → workspaces(id) ON DELETE CASCADE | Target workspace |
| email | TEXT | NOT NULL | Invited user's email |
| role | workspace_role | NOT NULL, DEFAULT 'member' | Proposed role |
| invited_by | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | Sender |
| status | invitation_status | NOT NULL, DEFAULT 'pending' | Current state |
| expires_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() + 7 days | Auto-expiry |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Purpose**: Manages the invitation flow for workspace onboarding.

### `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| name | TEXT | NOT NULL, CHECK(1-50 chars) | Category name |
| icon | TEXT | NOT NULL | Lucide icon identifier |
| color | TEXT | NOT NULL, CHECK(~ '^#[0-9a-f]{6}$') | Display color |
| group | TEXT | NOT NULL | Grouping (essential, lifestyle, income, etc.) |
| is_default | BOOLEAN | NOT NULL, DEFAULT FALSE | System-provided category |
| workspace_id | UUID | FK → workspaces(id) ON DELETE CASCADE | Null for personal categories |
| user_id | UUID | FK → users(id) ON DELETE CASCADE | Owner for personal categories |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display ordering |
| is_archived | BOOLEAN | NOT NULL, DEFAULT FALSE | Soft-hide without deleting |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| CHECK | | workspace_id XOR user_id | Must belong to either workspace or user |

**Purpose**: Transaction classification system with hierarchical grouping.

### `transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| amount | DECIMAL(15,2) | NOT NULL, CHECK(> 0) | Absolute value |
| currency | currency_code | NOT NULL, DEFAULT 'USD' | Transaction currency |
| type | transaction_type | NOT NULL | Financial classification |
| category_id | UUID | NOT NULL, FK → categories(id) ON DELETE RESTRICT | Classification |
| subcategory | TEXT | CHECK(≤50 chars) | Optional finer classification |
| description | TEXT | NOT NULL, CHECK(1-200 chars) | Human-readable summary |
| notes | TEXT | CHECK(≤2000 chars) | Extended details |
| tags | TEXT[] | NOT NULL, DEFAULT '{}', max 20 | Flexible labels |
| payment_method | payment_method | | How payment was made |
| transaction_date | TIMESTAMPTZ | NOT NULL | When the transaction occurred |
| created_by | UUID | NOT NULL, FK → users(id) ON DELETE SET NULL | Creator |
| workspace_id | UUID | FK → workspaces(id) ON DELETE SET NULL | Optional workspace association |
| visibility | transaction_visibility | NOT NULL, DEFAULT 'private' | Data access scope |
| is_reconciled | BOOLEAN | NOT NULL, DEFAULT FALSE | Bank reconciliation flag |
| receipt_url | TEXT | CHECK(~ '^https?://') | Receipt image URL |
| receipt_file_name | TEXT | | Original file name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Purpose**: Core financial record. Supports 6 transaction types with flexible categorization.
**Key indexes**: created_by, workspace_id, transaction_date DESC, type, category_id, GIN on tags, GIN on full-text search.

### `recurring_transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| last_transaction_id | UUID | FK → transactions(id) ON DELETE SET NULL | Most recent generated tx |
| amount | DECIMAL(15,2) | NOT NULL, CHECK(> 0) | |
| currency | currency_code | NOT NULL, DEFAULT 'USD' | |
| type | transaction_type | NOT NULL | |
| category_id | UUID | NOT NULL, FK → categories(id) ON DELETE RESTRICT | |
| subcategory | TEXT | CHECK(≤50 chars) | |
| description | TEXT | NOT NULL, CHECK(1-200 chars) | |
| notes | TEXT | CHECK(≤2000 chars) | |
| tags | TEXT[] | NOT NULL, DEFAULT '{}' | |
| payment_method | payment_method | | |
| created_by | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | |
| workspace_id | UUID | FK → workspaces(id) ON DELETE CASCADE | |
| visibility | transaction_visibility | NOT NULL, DEFAULT 'private' | |
| frequency | recurrence_frequency | NOT NULL | Schedule unit |
| interval | INTEGER | NOT NULL, DEFAULT 1, CHECK(1-365) | Multiplier on frequency |
| start_date | DATE | NOT NULL | When to begin |
| end_date | DATE | CHECK(≥ start_date) | Optional end |
| last_executed_at | TIMESTAMPTZ | | Last generation timestamp |
| next_execution | DATE | NOT NULL | Next scheduled date |
| max_executions | INTEGER | CHECK(1-365) | Optional cap |
| executions_count | INTEGER | NOT NULL, DEFAULT 0 | Running total |
| is_paused | BOOLEAN | NOT NULL, DEFAULT FALSE | Temporarily disabled |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Fully active flag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |

**Purpose**: Template for automatically generated transactions. Separated from `transactions` to avoid overloading the main table with scheduling fields. Supports soft-delete for safe pausing/cancellation.

### `budgets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| category_id | UUID | NOT NULL, FK → categories(id) ON DELETE CASCADE | Budget target category |
| workspace_id | UUID | FK → workspaces(id) ON DELETE CASCADE | Optional workspace scope |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | Budget owner |
| amount | DECIMAL(15,2) | NOT NULL, CHECK(> 0) | Spending limit |
| currency | currency_code | NOT NULL, DEFAULT 'USD' | |
| period | budget_period | NOT NULL | Time window |
| start_date | DATE | NOT NULL | Period start |
| end_date | DATE | CHECK(≥ start_date) | Optional period end |
| is_alert_enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | Budget alerts on/off |
| alert_threshold | INTEGER | NOT NULL, DEFAULT 80, CHECK(0-100) | Alert trigger % |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### `activity_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| workspace_id | UUID | FK → workspaces(id) ON DELETE CASCADE | |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE SET NULL | Actor |
| type | TEXT | NOT NULL | Action identifier |
| metadata | JSONB | NOT NULL, DEFAULT '{}' | Flexible context data |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Purpose**: Immutable audit trail for all significant actions. Append-only (no update/delete).

### `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | Recipient |
| type | TEXT | NOT NULL | Notification category |
| title | TEXT | NOT NULL | Short headline |
| message | TEXT | NOT NULL | Full content |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| action_url | TEXT | | Deep link target |
| action_label | TEXT | | Button text |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

## Key Design Decisions

1. **Recurring transactions as a separate table**: Avoids polluting the transactions table with scheduling fields. Allows independent lifecycle management (pause, resume, edit template without affecting history).

2. **DECIMAL(15,2) for all monetary values**: Precise arithmetic, avoids floating-point errors. Supports amounts up to ~$9.9 trillion.

3. **Composite indexes on (user_id, date DESC)**: Optimizes the most common query pattern — fetching a user's recent transactions.

4. **Category ownership constraint**: Categories must belong to either a user (personal) or workspace (shared), not both.

5. **ON DELETE RESTRICT on category_id in transactions**: Prevents accidental deletion of categories that have transaction history. Use archive instead.

6. **Activity logs are append-only**: Immutable audit trail. No update or delete operations permitted.

7. **Invitation expiry**: Default 7-day expiry with a filtered index on `(expires_at) WHERE status = 'pending'` for efficient cleanup queries.

---

## Performance Indexes

See `src/database/indexes.ts` for the complete set of indexes including:
- GIN indexes for tag arrays and full-text search on transactions
- Partial indexes for unread notifications and active recurring transactions
- Composite indexes for common filter/sort combinations
- Conditional indexes for budget alerts and workspace visibility queries

---

## Row-Level Security

See `src/database/rls-policies.ts` for complete RLS implementation:

| Table | Select Policy | Insert Policy | Update Policy | Delete Policy |
|-------|:---:|:---:|:---:|:---:|
| users | Own record only | — | Own record only | — |
| profiles | Self + workspace members | Self only | Self only | — |
| workspaces | Members only | Any user | Admin+ | Owner only |
| workspace_members | Members only | Admin+ | Admin+ | Admin+ or self |
| workspace_invitations | Admin+ | Admin+ | Admin+ | — |
| categories | Self + workspace + defaults | Self or admin | Self or admin | Self or admin |
| transactions | Self + workspace-visible | Self only | Self only | Self only |
| recurring_transactions | Self + workspace-visible | Self only | Self only | Self only |
| budgets | Self + workspace members | Self or admin | Self or admin | Self or admin |
| activity_logs | Self + workspace members | System only | — | — |
| notifications | Self only | System only | Self only | Self only |
