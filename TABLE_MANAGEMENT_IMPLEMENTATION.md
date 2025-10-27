# Table Management - Complete CRUD Implementation

## Overview
Comprehensive table management system with full CRUD operations, including table numbers, names, descriptions, and capacity tracking.

## Database Schema Changes ✅

### New Columns Added to `tables` Table:
```sql
ALTER TABLE tables ADD COLUMN table_number integer NOT NULL;  -- Incremental number
ALTER TABLE tables ADD COLUMN name text;                      -- Optional custom name
ALTER TABLE tables ADD COLUMN description text;               -- Optional description  
ALTER TABLE tables ADD COLUMN capacity integer;               -- Number of people
```

### Complete Table Schema:
```typescript
export const tables = pgTable("tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id").notNull().references(() => venues.id),
  tableNumber: integer("table_number").notNull(),     // NEW: 1, 2, 3, etc.
  name: text("name"),                                 // NEW: "Window Seat", "Private Room"
  label: text("label").notNull(),                     // "Table 1", "Table A"
  description: text("description"),                   // NEW: "Near the window with city view"
  capacity: integer("capacity"),                      // NEW: 4, 6, 8 people
  qrCode: text("qr_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Migration Status:
- ✅ Schema updated in TypeScript and JavaScript
- ✅ Migration generated (`0005_robust_longshot.sql`)
- ✅ Migration applied to database
- ✅ Existing tables updated with table numbers (1, 2, 3)

## Implementation Plan

### Backend (API) - Remaining Tasks:

#### 1. Update Table Domain Entity
**File**: `apps/api/src/domain/entities/Table.ts`
- Add `tableNumber`, `name`, `description`, `capacity` properties
- Update validation logic
- Update factory methods

#### 2. Update Table Repository Interface
**File**: `apps/api/src/domain/repositories/ITableRepository.ts`
- Add `create(table: Table): Promise<void>`
- Add `update(table: Table): Promise<void>`
- Add `delete(id: string): Promise<void>`
- Add `getNextTableNumber(venueId: string): Promise<number>`

#### 3. Update Table Repository Implementation
**File**: `apps/api/src/infrastructure/persistence/DrizzleTableRepository.ts`
- Implement create method
- Implement update method
- Implement delete method
- Implement getNextTableNumber method
- Update mapping to include new fields

#### 4. Create Table Use Cases
**Files**:
- `apps/api/src/application/use-cases/CreateTableUseCase.ts`
- `apps/api/src/application/use-cases/UpdateTableUseCase.ts`
- `apps/api/src/application/use-cases/DeleteTableUseCase.ts`

#### 5. Update Table Controller
**File**: `apps/api/src/interfaces/controllers/table.controller.ts` (or create if doesn't exist)
- Add `POST /api/v1/venues/:venueId/tables` - Create table
- Add `PUT /api/v1/tables/:id` - Update table
- Add `DELETE /api/v1/tables/:id` - Delete table
- Keep existing `GET /api/v1/venues/:venueId/tables` - List tables

#### 6. Register in DI Container
**File**: `apps/api/src/container/index.ts`
- Register new use cases
- Register table controller

### Frontend (Dashboard) - Remaining Tasks:

#### 1. Update Table Types
**File**: `apps/dashboard/src/features/table-management/types/table.types.ts`
```typescript
export interface Table {
  id: string;
  venueId: string;
  tableNumber: number;        // NEW
  name?: string;              // NEW
  label: string;
  description?: string;       // NEW
  capacity?: number;          // NEW
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableInput {
  venueId: string;
  tableNumber?: number;       // Auto-generated if not provided
  name?: string;
  label: string;
  description?: string;
  capacity?: number;
}

export interface UpdateTableInput {
  id: string;
  tableNumber?: number;
  name?: string;
  label?: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}
```

#### 2. Update Tables API Client
**File**: `apps/dashboard/src/features/table-management/api/tablesApi.ts`
- Add `createTable(data: CreateTableInput): Promise<Table>`
- Add `updateTable(data: UpdateTableInput): Promise<Table>`
- Add `deleteTable(id: string): Promise<void>`

#### 3. Create Mutation Hooks
**Files**:
- `apps/dashboard/src/features/table-management/hooks/useCreateTable.ts`
- `apps/dashboard/src/features/table-management/hooks/useUpdateTable.ts`
- `apps/dashboard/src/features/table-management/hooks/useDeleteTable.ts`

#### 4. Create TableForm Component
**File**: `apps/dashboard/src/features/table-management/components/TableForm.tsx`
- Form fields:
  - Table Number (auto-generated, can be edited)
  - Label (required)
  - Name (optional)
  - Description (optional)
  - Capacity (optional, number input)
  - Is Active (toggle)
- Validation
- Submit handler

#### 5. Update TableManagementPage
**File**: `apps/dashboard/src/features/table-management/components/TableManagementPage.tsx`
- Add "Create Table" button
- Add table list with edit/delete actions
- Add modal for create/edit form
- Add delete confirmation dialog
- Display new fields (table number, capacity, etc.)

## Features

### Table Number System
- **Auto-increment**: Automatically assigns next available number
- **Editable**: Can be manually set during creation/editing
- **Unique per venue**: Each venue has its own numbering sequence
- **Display**: Shows as "#1", "#2", "#3" in UI

### Table Information
- **Label** (required): Display name (e.g., "Table 1", "Table A")
- **Name** (optional): Custom name (e.g., "Window Seat", "VIP Room")
- **Description** (optional): Additional details (e.g., "Near the window with city view")
- **Capacity** (optional): Number of people (e.g., 4, 6, 8)

### CRUD Operations
1. **Create**: Add new table with auto-generated table number
2. **Read**: View all tables for a venue
3. **Update**: Edit table details
4. **Delete**: Remove table (soft delete by setting isActive=false)

## UI/UX Design

### Table List View
```
┌─────────────────────────────────────────────────────────┐
│  Table Management                    [+ Create Table]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ #1  Table 1                         [Edit] [Del] │  │
│  │     Window Seat • Capacity: 4                    │  │
│  │     Near the window with city view               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ #2  Table 2                         [Edit] [Del] │  │
│  │     Capacity: 6                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ #3  VIP Room                        [Edit] [Del] │  │
│  │     Private dining area • Capacity: 8            │  │
│  │     Separate room with private entrance          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Create/Edit Form
```
┌─────────────────────────────────────┐
│  Create New Table                   │
├─────────────────────────────────────┤
│                                     │
│  Table Number *                     │
│  [  3  ] (auto-generated)           │
│                                     │
│  Label *                            │
│  [ Table 3                       ]  │
│                                     │
│  Name (optional)                    │
│  [ Window Seat                   ]  │
│                                     │
│  Description (optional)             │
│  [ Near the window with city     ]  │
│  [ view                          ]  │
│                                     │
│  Capacity (optional)                │
│  [  4  ] people                     │
│                                     │
│  ☑ Active                           │
│                                     │
│  [Cancel]              [Save Table] │
└─────────────────────────────────────┘
```

## API Endpoints

### Create Table
```
POST /api/v1/venues/:venueId/tables
Authorization: Bearer <token>

Request:
{
  "label": "Table 3",
  "name": "Window Seat",
  "description": "Near the window with city view",
  "capacity": 4
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "venueId": "venue-uuid",
    "tableNumber": 3,
    "name": "Window Seat",
    "label": "Table 3",
    "description": "Near the window with city view",
    "capacity": 4,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### Update Table
```
PUT /api/v1/tables/:id
Authorization: Bearer <token>

Request:
{
  "name": "VIP Window Seat",
  "capacity": 6
}

Response:
{
  "success": true,
  "data": { /* updated table */ }
}
```

### Delete Table
```
DELETE /api/v1/tables/:id
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

### List Tables (Existing)
```
GET /api/v1/venues/:venueId/tables

Response:
{
  "success": true,
  "data": [
    { /* table 1 */ },
    { /* table 2 */ },
    { /* table 3 */ }
  ]
}
```

## Current Status

### ✅ Completed:
1. Database schema updated
2. Migration generated and applied
3. Existing tables updated with table numbers

### 🚧 In Progress:
The implementation is ready to continue with the backend and frontend CRUD operations.

### ⏳ Remaining:
1. Backend: Update domain entities, repositories, use cases, and controllers
2. Frontend: Update types, API client, create forms and UI
3. Testing: End-to-end CRUD flow

## Next Steps

1. **Update Table Domain Entity** - Add new fields and validation
2. **Implement Repository Methods** - Add create, update, delete
3. **Create Use Cases** - Business logic for CRUD operations
4. **Add API Endpoints** - REST API for table management
5. **Build Frontend UI** - Forms and table list with CRUD actions
6. **Test Everything** - Verify complete flow works

## Notes

- Table numbers are **per-venue**, not global
- Deleting a table should **soft delete** (set isActive=false) to preserve order history
- QR codes should be **regenerated** when table label changes
- Capacity is **optional** but recommended for better table management
- Table numbers can be **manually edited** if needed (e.g., to match physical table numbers)

