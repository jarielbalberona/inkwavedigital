# Table & QR Code Management

## Overview
Complete table management system with QR code generation for contactless menu access. Customers scan table QR codes to browse the menu and place orders.

## Table Management Features

### Table Properties
- **Table Number**: Auto-incrementing per venue (1, 2, 3...)
- **Label**: Display name shown to customers (e.g., "Table 1", "Table A")
- **Name**: Optional custom name (e.g., "Window Seat", "VIP Room")
- **Description**: Optional details (e.g., "Near the window with city view")
- **Capacity**: Number of people (1-100)
- **Active Status**: Enable/disable tables

### CRUD Operations
- ✅ **Create**: Add tables with auto-generated numbers
- ✅ **Read**: View all tables with details
- ✅ **Update**: Modify table properties
- ✅ **Delete**: Remove tables (with confirmation)

### Auto-Incrementing Table Numbers
- System automatically assigns next available number
- Per-venue numbering (each venue starts at 1)
- Numbers reused when tables are deleted
- Ensures consistent numbering scheme

## QR Code System

### QR Code Formats

#### Slug-Based URLs (Recommended)
```
https://customer.app/{tenantSlug}/{venueSlug}/menu?table={tableId}&label={tableLabel}
```

**Benefits**:
- SEO-friendly URLs
- Human-readable
- Easier debugging
- Shareable links

**Example**:
```
https://customer.app/tuesday-coffee/main-branch/menu?table=abc123&label=Table+1
```

#### UUID-Based URLs (Legacy)
```
https://customer.app/menu?venue={venueId}&table={tableId}&label={tableLabel}
```

**Example**:
```
https://customer.app/menu?venue=uuid-here&table=abc123&label=Table+1
```

### QR Code Generation

**Features**:
- ✅ Generate QR codes for each table
- ✅ Download as PNG, SVG, or PDF
- ✅ Customizable size and error correction
- ✅ Embedded table information
- ✅ Tenant and venue context

**Technical Details**:
- Uses `qrcode` library
- Error correction level: 'M' (Medium)
- Margin: 4 modules
- Default size: 300x300px
- SVG for print quality

### QR Code Workflow

1. **Admin Creates Table**
   - Fills in table details
   - System auto-assigns table number
   - Table saved to database

2. **Generate QR Code**
   - Click "Download QR" button
   - Choose format (PNG/SVG/PDF)
   - QR code includes table ID and label

3. **Customer Scans QR**
   - Camera app opens QR URL
   - Redirected to menu page
   - Session created with table context

4. **Place Order**
   - Customer browses menu
   - Adds items to cart
   - Checks out
   - Order linked to table

## API Endpoints

### Tables
```
GET    /api/v1/venues/:venueId/tables      # Get all tables (public)
POST   /api/v1/tables                       # Create table (auth)
PATCH  /api/v1/tables/:tableId              # Update table (auth)
DELETE /api/v1/tables/:tableId              # Delete table (auth)
```

### Public Table Info
```
GET    /api/v1/venues/:venueId/tables      # Used by QR codes
```

## Frontend Implementation

### Table Management Page
**Location**: `apps/dashboard/src/features/table-management/`

**Components**:
- `TableManagementPage.tsx` - Main page with table grid
- `TableForm.tsx` - Create/edit modal form
- `QRCodeDisplay.tsx` - QR code generation modal

**Features**:
- Grid view of all tables
- Create new table button
- Edit table (modal)
- Delete table (with confirmation)
- Download QR codes (PNG/SVG/PDF)
- Visual status indicators

### Hooks
```typescript
useTablesQuery(venueId)          // Fetch tables
useCreateTable()                 // Create table
useUpdateTable()                 // Update table
useDeleteTable()                 // Delete table
```

### QR Code Helpers
**File**: `apps/dashboard/src/features/table-management/hooks/helpers/qrHelpers.ts`

```typescript
generateQRCodeForTable(table, venue, tenant)  // Generate QR data URL
downloadQRCode(dataUrl, format, tableLabel)   // Download QR file
```

## Customer App Integration

### QR Scanning Flow

1. **Scan QR Code**
   - Customer opens camera app
   - Points at table QR code
   - URL opens in browser

2. **Session Creation**
   - App extracts venue and table IDs from URL
   - Creates session in localStorage
   - Stores: venueId, tableId, tableLabel, deviceId

3. **Pax Prompt** (Optional)
   - Ask number of guests
   - Used for analytics
   - Can be skipped

4. **Menu Display**
   - Fetch menu for venue
   - Show table label in header
   - Ready to order

### Session Management
**File**: `apps/customer/src/features/menu/hooks/stores/useSessionStore.ts`

```typescript
interface SessionStore {
  venueId: string | null;
  tableId: string | null;
  tableLabel: string | null;
  deviceId: string;  // Unique device ID
  pax: number | null;
  setSession(venueId, tableId, deviceId?, pax?, tableLabel?): void;
  clearSession(): void;
}
```

### URL Parameter Handling
**Support for both formats**:

**Slug-based**:
```typescript
/:tenantSlug/:venueSlug/menu?table=xxx&label=xxx
```

**UUID-based** (legacy):
```typescript
/menu?venue=xxx&table=xxx&label=xxx
```

## QR Code URL Encoding

### Important: Label Encoding
Table labels must be URL-encoded:
```
"Table 1" → "Table+1" or "Table%201"
```

**Why**: Spaces and special characters must be encoded for valid URLs.

### Implementation
```typescript
const qrUrl = `${baseUrl}?table=${tableId}&label=${encodeURIComponent(tableLabel)}`;
```

## Deployment Considerations

### Environment Variables
```bash
# Dashboard (for QR generation)
VITE_CUSTOMER_APP_URL=https://your-customer-app.com

# Customer App
VITE_API_BASE_URL=https://your-api.com
```

### QR Code Hosting
- **Option 1**: Generate on-demand (current)
- **Option 2**: Pre-generate and store in R2
- **Option 3**: Use QR code service (QR Code Monkey, etc.)

### Print Recommendations
- **Format**: PDF or SVG for print quality
- **Size**: Minimum 2" x 2" (5cm x 5cm)
- **Placement**: Visible on table
- **Material**: Laminated or acrylic stand
- **Error Correction**: Medium (M) allows 15% damage

## Analytics & Tracking

### Order Attribution
Every order stores:
- `table_id` - Which table placed the order
- `device_id` - Unique device identifier
- `venue_id` - Which venue

### Analytics Possibilities
- Orders per table
- Popular tables (by revenue)
- Average order value by table
- Peak times per table
- Table turnover rates

## Best Practices

### Table Naming
- **Use consistent labels**: Table 1, Table 2, etc.
- **Add context**: Window Seat, Bar Counter, Patio 1
- **Keep it short**: Will display on mobile

### QR Code Placement
- Eye level on table
- Protected from spills (laminated)
- Good lighting for scanning
- Include backup URL (short link)

### Capacity Settings
- Set realistic capacity
- Consider comfort and spacing
- Used for reservations (future)
- Analytics on table utilization

## Troubleshooting

### QR Code Not Scanning
- Check QR code quality (not blurred)
- Ensure good lighting
- Verify URL is valid
- Test on multiple devices

### Wrong Menu Displayed
- Verify venue ID in QR URL
- Check tenant slug matches
- Clear browser cache
- Test in incognito mode

### Table Number Conflicts
- Auto-increment should prevent this
- If occurs, check venue ID isolation
- Manually adjust if needed

### Session Not Persisting
- Check localStorage is enabled
- Verify deviceId generation
- Check session store implementation
- Test on actual devices (not just dev)

## Future Enhancements

### Planned Features
- **Table Reservations**: Book tables in advance
- **Wait List**: Virtual queue management
- **Table Status**: Occupied/Available indicators
- **Service Calls**: Call waiter button
- **Split Bills**: Divide check by seat
- **Table Layouts**: Visual floor plan
- **Dynamic QR**: Change menu based on time

