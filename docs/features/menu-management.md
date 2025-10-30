# Menu Management System

## Overview
Comprehensive menu management system with hierarchical structure: Tenant → Venue → Menu → Categories → Items → Options → Values.

## Database Architecture

### Hierarchy
```
Tenant
  └── Venue
       └── Menu
            └── Menu Category
                 └── Menu Item
                      └── Item Option
                           └── Option Value
```

### Schema Details

#### Menu Categories
- ID, menu_id, name, description
- icon_url (optional category icon)
- display_order, is_available
- timestamps

#### Menu Items
- ID, category_id, name, description
- price, cost (for profit tracking)
- image_urls (array of image URLs - supports multiple images)
- display_order, is_available
- timestamps

#### Item Options
- ID, menu_item_id, name, type
- is_required, display_order
- Types: `single`, `multiple`
- Examples: Size (single), Toppings (multiple)

#### Option Values
- ID, item_option_id, name, price_modifier
- display_order, is_available
- Example: Large (+$2.00), Extra Cheese (+$1.50)

## Features Implemented

### Category Management
- ✅ CRUD operations (create, read, update, delete)
- ✅ Icon support for visual categorization
- ✅ Display order management
- ✅ Availability toggle
- ✅ Venue-scoped isolation

### Menu Item Management
- ✅ Full CRUD operations
- ✅ **Multiple image support** - items can have multiple product images
- ✅ Price and cost tracking
- ✅ Category assignment
- ✅ Display ordering
- ✅ Availability status

### Item Options System
- ✅ Create customization options for items
- ✅ Single-select options (e.g., Size: Small/Medium/Large)
- ✅ Multi-select options (e.g., Toppings: multiple selections)
- ✅ Required vs optional options
- ✅ Price modifiers for each option value
- ✅ Display ordering

### Image Management
- ✅ Upload images to Cloudflare R2
- ✅ Image library for reusability across items
- ✅ Automatic optimization (resize to 1200px, 85% quality)
- ✅ Thumbnail generation (300px, 80% quality)
- ✅ Tenant-isolated image storage
- ✅ Support for both menu items and category icons

## API Endpoints

### Categories
```
GET    /api/v1/menu/:venueId/categories          # List all categories
POST   /api/v1/menu/:venueId/categories          # Create category (auth)
PATCH  /api/v1/menu/categories/:categoryId       # Update category (auth)
DELETE /api/v1/menu/categories/:categoryId       # Delete category (auth)
GET    /api/v1/menu/categories/:categoryId/items # Get items in category
```

### Menu Items
```
GET    /api/v1/menu/:venueId                     # Get full menu
POST   /api/v1/menu/items                        # Create item (auth)
PATCH  /api/v1/menu/items/:itemId                # Update item (auth)
DELETE /api/v1/menu/items/:itemId                # Delete item (auth)
```

### Item Options
```
GET    /api/v1/menu/items/:itemId/options        # Get item options
POST   /api/v1/menu/items/:itemId/options        # Create option (auth)
PATCH  /api/v1/menu/options/:optionId            # Update option (auth)
DELETE /api/v1/menu/options/:optionId            # Delete option (auth)
```

### Option Values
```
POST   /api/v1/menu/options/:optionId/values     # Create value (auth)
PATCH  /api/v1/menu/option-values/:valueId       # Update value (auth)
DELETE /api/v1/menu/option-values/:valueId       # Delete value (auth)
```

## Frontend Implementation

### Menu Management Page
**Location**: `apps/dashboard/src/features/menu-management/`

**Features**:
- Category grid with create/edit/delete
- Item grid organized by category
- Item options manager (modal-based)
- Image picker integration
- Drag-and-drop ordering (planned)

### Components
- `MenuManagementPage.tsx` - Main page
- `CategoryCard.tsx` - Category display
- `CategoryForm.tsx` - Category create/edit
- `CategoryIconPicker.tsx` - Icon selection
- `MenuItemForm.tsx` - Item create/edit with image picker
- `ItemOptionsManager.tsx` - Options/values management

### Hooks
```typescript
// Categories
useCategoriesQuery(venueId)
useCreateCategory()
useUpdateCategory()
useDeleteCategory()

// Items
useMenuItemsQuery(venueId)
useCreateMenuItem()
useUpdateMenuItem()
useDeleteMenuItem()

// Options
useItemOptionsQuery(itemId)
useCreateItemOption()
useUpdateItemOption()
useDeleteItemOption()

// Option Values
useCreateOptionValue()
useUpdateOptionValue()
useDeleteOptionValue()
```

## Customer-Facing Menu

### Features
- Browse menu by category
- View item details with all images (carousel)
- Select customization options
- See real-time price updates based on selections
- Add to cart with selected options

### Venue-Specific Menus
- Each venue has its own menu
- Menu is fetched using venue ID from QR code
- Categories and items filtered by availability
- Real-time updates via WebSocket

## Menu Entity Implementation

### Current Status
The system uses a simplified approach:
- ✅ One default menu per venue
- ✅ Categories and items directly linked to venue
- ⚠️ Menu entity exists but is auto-created
- ⚠️ Not exposed to UI (for simplicity)

### Future Enhancements
- Multiple menus per venue (breakfast, lunch, dinner)
- Menu scheduling (time-based activation)
- Seasonal menus
- Menu versioning

## Image Handling

### Multiple Images Per Item
- Items support multiple product images via `imageUrls` array
- Images displayed in carousel in customer app
- First image is the primary/thumbnail
- All images stored in image library

### Upload Process
1. User selects/uploads images
2. Images sent to R2StorageService
3. Automatic optimization and thumbnail generation
4. URLs stored in image_library table
5. URLs added to menu item's imageUrls array

### Image Library
- Tenant-scoped image storage
- Reusable across multiple items
- Metadata stored: filename, size, dimensions
- Delete protection (check if used by items)

## Performance Considerations

### Caching
- Menu data cached on frontend (React Query)
- 5-minute stale time for menus
- Instant updates after mutations

### Optimization
- Images served from R2 CDN
- Thumbnails for list views
- Full images for detail views
- Lazy loading in customer app

## Best Practices

### Item Options Design
- Keep option names clear and concise
- Use consistent naming (Size, Toppings, etc.)
- Set sensible price modifiers
- Mark essential options as required

### Category Organization
- Limit to 6-8 categories for better UX
- Use descriptive icons
- Order by popularity
- Keep category names short

### Image Guidelines
- Use high-quality product photos
- Consistent image style across items
- Multiple angles for items with customization
- Compress before upload (handled automatically)

## Troubleshooting

### Categories Not Showing
- Check venue ID is correct
- Verify categories have `is_available = true`
- Check menu exists for venue

### Items Not Displaying
- Ensure item has `is_available = true`
- Check category is available
- Verify item is assigned to correct category

### Options Not Working
- Verify option type (single/multiple)
- Check option values exist
- Ensure values have correct price modifiers

