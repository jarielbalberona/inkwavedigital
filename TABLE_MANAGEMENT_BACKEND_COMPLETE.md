# Table Management - Backend Implementation Complete! ✅

## Summary
Complete backend implementation for table CRUD operations with table numbers, names, descriptions, and capacity tracking.

## ✅ What's Been Completed

### 1. Database Schema ✅
- Added `tableNumber` (integer, required) - Auto-incrementing number
- Added `name` (text, optional) - Custom name like "Window Seat"
- Added `description` (text, optional) - Additional details
- Added `capacity` (integer, optional) - Number of people (1-100)
- Migration generated and applied
- Existing tables updated with table numbers (1, 2, 3)

### 2. Domain Entity ✅
**File**: `apps/api/src/domain/entities/Table.ts`
- Updated `TableProps` interface with new fields
- Added validation for table number (must be positive integer)
- Added validation for capacity (1-100 people)
- Added getters for all new fields
- Added update methods:
  - `updateTableNumber()`
  - `updateName()`
  - `updateDescription()`
  - `updateCapacity()`
- Updated `toJSON()` to include new fields

### 3. Repository Interface & Implementation ✅
**Files**: 
- `apps/api/src/domain/repositories/IVenueRepository.ts`
- `apps/api/src/infrastructure/persistence/DrizzleVenueRepository.ts`

**New Methods**:
- `findTableById(id: string): Promise<Table | null>` - Find table by ID
- `saveTable(table: Table): Promise<void>` - Create or update table
- `deleteTable(id: string): Promise<void>` - Delete table
- `getNextTableNumber(venueId: string): Promise<number>` - Auto-increment logic

**Updated Methods**:
- `findTablesByVenueId()` - Now returns all new fields
- `mapTableToEntity()` - Maps new database columns to entity

### 4. Use Cases ✅
**Created Files**:
- `apps/api/src/application/use-cases/CreateTableUseCase.ts`
  - Validates venue exists
  - Auto-generates table number if not provided
  - Creates table entity with validation
  - Saves to database

- `apps/api/src/application/use-cases/UpdateTableUseCase.ts`
  - Finds existing table
  - Updates only provided fields
  - Validates all changes
  - Saves updated table

- `apps/api/src/application/use-cases/DeleteTableUseCase.ts`
  - Verifies table exists
  - Deletes table from database

**Updated Files**:
- `apps/api/src/application/use-cases/GetVenueTablesUseCase.ts`
  - Now returns all new fields in response

### 5. Controller & Routes ✅
**File**: `apps/api/src/interfaces/controllers/venue.controller.ts`

**New Methods**:
- `createTable()` - POST handler
- `updateTable()` - PUT handler
- `deleteTable()` - DELETE handler

**File**: `apps/api/src/infrastructure/http/routes/venues.routes.ts`

**New Routes**:
```
POST   /api/v1/venues/:venueId/tables      - Create table (protected)
PUT    /api/v1/venues/tables/:tableId      - Update table (protected)
DELETE /api/v1/venues/tables/:tableId      - Delete table (protected)
GET    /api/v1/venues/:venueId/tables      - List tables (public)
```

### 6. Dependency Injection ✅
**File**: `apps/api/src/container/index.ts`
- Registered `CreateTableUseCase`
- Registered `UpdateTableUseCase`
- Registered `DeleteTableUseCase`

## 📡 API Endpoints

### Create Table
```http
POST /api/v1/venues/:venueId/tables
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Table 5",
  "tableNumber": 5,        // Optional, auto-generated if not provided
  "name": "Window Seat",   // Optional
  "description": "Near the window with city view",  // Optional
  "capacity": 4            // Optional
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "venueId": "venue-uuid",
    "tableNumber": 5,
    "name": "Window Seat",
    "label": "Table 5",
    "description": "Near the window with city view",
    "capacity": 4,
    "qrCode": null,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### Update Table
```http
PUT /api/v1/venues/tables/:tableId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "VIP Window Seat",
  "capacity": 6,
  "isActive": true
}

Response 200:
{
  "success": true,
  "data": { /* updated table */ }
}
```

### Delete Table
```http
DELETE /api/v1/venues/tables/:tableId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Table deleted successfully"
}
```

### List Tables (Updated)
```http
GET /api/v1/venues/:venueId/tables

Response 200:
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "uuid",
        "venueId": "venue-uuid",
        "tableNumber": 1,
        "name": "Window Seat",
        "label": "Table 1",
        "description": "Near the window",
        "capacity": 4,
        "qrCode": "...",
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 1
  }
}
```

## 🔧 Technical Details

### Auto-Increment Logic
```typescript
async getNextTableNumber(venueId: string): Promise<number> {
  const result = await this.db
    .select({ maxTableNumber: tables.tableNumber })
    .from(tables)
    .where(eq(tables.venueId, venueId))
    .orderBy(desc(tables.tableNumber))
    .limit(1);

  if (result.length === 0 || !result[0].maxTableNumber) {
    return 1;
  }

  return result[0].maxTableNumber + 1;
}
```

### Validation Rules
- **Table Number**: Must be positive integer (≥ 1)
- **Label**: Required, cannot be empty
- **Name**: Optional, trimmed if provided
- **Description**: Optional, trimmed if provided
- **Capacity**: Optional, must be between 1-100 if provided
- **Venue**: Must exist in database

### Database Operations
- **Create**: Inserts new table with all fields
- **Update**: Updates only provided fields, preserves others
- **Delete**: Hard delete (removes from database)
- **Read**: Returns all fields including new ones

## 🎯 Next Steps - Frontend

### Remaining Tasks:
1. ✅ Backend Complete
2. ⏳ Update Dashboard Types
3. ⏳ Create Table Form Component
4. ⏳ Update Table Management Page UI
5. ⏳ Test Complete Flow

### Frontend Files to Update/Create:
1. `apps/dashboard/src/features/table-management/types/table.types.ts`
2. `apps/dashboard/src/features/table-management/api/tablesApi.ts`
3. `apps/dashboard/src/features/table-management/hooks/useCreateTable.ts`
4. `apps/dashboard/src/features/table-management/hooks/useUpdateTable.ts`
5. `apps/dashboard/src/features/table-management/hooks/useDeleteTable.ts`
6. `apps/dashboard/src/features/table-management/components/TableForm.tsx`
7. `apps/dashboard/src/features/table-management/components/TableManagementPage.tsx`

## 🚀 API Status
- ✅ API restarted successfully
- ✅ All endpoints registered
- ✅ All use cases registered in DI container
- ✅ Ready for frontend integration

## 📊 Current Database State
```sql
SELECT id, venue_id, table_number, name, label, capacity 
FROM tables 
ORDER BY table_number;

-- Result:
-- id | venue_id | table_number | name | label | capacity
-- ---+----------+--------------+------+-------+---------
-- .. | venue-1  | 1            | NULL | Table 1 | NULL
-- .. | venue-1  | 2            | NULL | Table 2 | NULL
-- .. | venue-1  | 3            | NULL | Table 3 | NULL
```

## ✨ Features Implemented
- ✅ Auto-incrementing table numbers per venue
- ✅ Optional custom names for tables
- ✅ Optional descriptions
- ✅ Capacity tracking (1-100 people)
- ✅ Full CRUD operations
- ✅ Validation at entity level
- ✅ Protected endpoints (requires authentication)
- ✅ Clean architecture (Domain → Use Case → Controller)

## 🔐 Security
- All write operations (CREATE, UPDATE, DELETE) require authentication
- Read operations (GET tables) are public for QR code scanning
- Validation prevents invalid data
- Venue ownership enforced through authentication

## 📝 Notes
- Table numbers are per-venue, not global
- Deleting a table is a hard delete (consider soft delete for production)
- QR codes are preserved during updates
- Table numbers can be manually set during creation
- Auto-increment finds the max table number and adds 1

Backend implementation is complete and ready for frontend integration! 🎉

