# Migration Guide: Venue Enhancement

This guide walks you through migrating your database to support the enhanced venue schema with Google Business Page-like features.

## Prerequisites

- Backup your database before running migrations
- Ensure all apps are stopped or in maintenance mode
- Review the migration SQL files before applying

## Step 1: Generate Migration

The Drizzle ORM will automatically detect schema changes and generate migration files:

```bash
cd /Volumes/Files/softwareengineering/my-projects/inkwavedigital

# Generate migration files
pnpm --filter @inkwave/db drizzle:generate
```

This will create a new migration file in `packages/db/migrations/` with the schema changes.

## Step 2: Review Generated Migration

The generated migration will include:

### New Tables Created:
- `venue_reviews` - Customer reviews with ratings
- `review_photos` - Photos attached to reviews  
- `review_helpful_votes` - Helpful vote tracking
- `venue_photos` - Venue photo gallery
- `venue_business_hours` - Operating hours
- `venue_special_hours` - Holiday/special event hours
- `venue_attributes` - Amenities and features

### Venues Table Alterations:
Many new columns added:
- Location: `latitude`, `longitude`, `address_line1`, `address_line2`, `city`, `state`, `country`, `postal_code`, `formatted_address`, `google_place_id`, `plus_code`, `landmark`
- Contact: `phone_number`, `alternate_phone_number`, `email`, `website_url`
- Business: `description`, `short_description`, `business_type`, `cuisine_type`, `price_level`, `established_year`
- Social: `social_links` (JSONB)
- Ratings: `average_rating`, `total_reviews`, `total_rating_1` through `total_rating_5`
- Status: `is_active`, `is_verified`
- Settings: `settings_json` (JSONB)

### Removed Column:
- `address` (text) - Replaced with structured address fields

## Step 3: Data Migration (Manual)

Since we're replacing the single `address` field with structured fields, you'll need a data migration script.

### Option A: Preserve Existing Addresses

If you want to keep existing addresses temporarily:

```sql
-- Run BEFORE applying the Drizzle migration
-- This assumes the migration hasn't dropped the 'address' column yet

-- Copy old address to formatted_address
UPDATE venues 
SET formatted_address = address 
WHERE address IS NOT NULL;

-- Basic parsing for Philippines addresses (customize as needed)
-- Example: "123 Main St, Makati, Metro Manila"
UPDATE venues 
SET 
  address_line1 = SPLIT_PART(address, ',', 1),
  city = TRIM(SPLIT_PART(address, ',', 2)),
  state = TRIM(SPLIT_PART(address, ',', 3)),
  country = 'Philippines'
WHERE address IS NOT NULL AND address LIKE '%,%';
```

### Option B: Gradual Migration in Application

Alternatively, migrate addresses gradually through your application:

1. Leave `formatted_address` populated from old `address`
2. Add UI in dashboard to fill in structured address fields
3. Display notice to admins: "Update your address information"
4. Over time, structured fields will be populated

## Step 4: Apply Migration

```bash
# Apply the migration to your database
pnpm --filter @inkwave/db drizzle:migrate
```

This will execute the SQL migration against your database.

## Step 5: Verify Migration

```bash
# Check database tables
psql $DATABASE_URL -c "\d venues"
psql $DATABASE_URL -c "\d venue_reviews"
psql $DATABASE_URL -c "\d venue_photos"
psql $DATABASE_URL -c "\d venue_business_hours"
psql $DATABASE_URL -c "\d venue_attributes"

# Check data integrity
psql $DATABASE_URL -c "SELECT id, name, formatted_address, latitude, longitude FROM venues LIMIT 5;"
```

## Step 6: Add Indexes (Recommended)

For optimal performance, add these indexes:

```sql
-- Venue lookups
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_tenant_id ON venues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active) WHERE is_active = true;

-- Reviews
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_id ON venue_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_rating ON venue_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_published ON venue_reviews(venue_id, is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_venue_reviews_created_desc ON venue_reviews(venue_id, created_at DESC);

-- Review photos
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON review_photos(review_id);

-- Venue photos
CREATE INDEX IF NOT EXISTS idx_venue_photos_venue_id ON venue_photos(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_type ON venue_photos(venue_id, photo_type, is_active);

-- Business hours
CREATE INDEX IF NOT EXISTS idx_venue_business_hours_venue_day ON venue_business_hours(venue_id, day_of_week);

-- Attributes
CREATE INDEX IF NOT EXISTS idx_venue_attributes_venue_key ON venue_attributes(venue_id, attribute_key, is_active);
```

Run this SQL:
```bash
psql $DATABASE_URL -f packages/db/migrations/add_indexes.sql
```

## Step 7: Update Application Code

### Update Domain Entities

Update `apps/api/src/domain/entities/Venue.ts`:

```typescript
export interface VenueProps {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  
  // New fields
  description?: string;
  shortDescription?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
  googlePlaceId?: string;
  plusCode?: string;
  landmark?: string;
  
  // Contact
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  email?: string;
  websiteUrl?: string;
  
  // Business
  businessType?: string;
  cuisineType?: string;
  priceLevel?: number;
  timezone: string;
  establishedYear?: number;
  
  // Social
  socialLinks?: Record<string, string>;
  
  // Ratings
  averageRating?: number;
  totalReviews: number;
  totalRating1: number;
  totalRating2: number;
  totalRating3: number;
  totalRating4: number;
  totalRating5: number;
  
  // Settings
  settingsJson?: Record<string, unknown>;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Update Repository

Update `apps/api/src/infrastructure/persistence/DrizzleVenueRepository.ts` to handle new fields.

### Update Use Cases

- `CreateVenueUseCase` - Accept new fields
- `UpdateVenueUseCase` - Accept new fields
- `GetVenueInfoUseCase` - Return new fields

### Update API Endpoints

Update DTOs/validators for venue endpoints to include new fields.

## Step 8: Create New Use Cases (Reviews)

Create new use cases for review functionality:

```
apps/api/src/application/use-cases/reviews/
├── CreateReviewUseCase.ts
├── GetVenueReviewsUseCase.ts
├── ReplyToReviewUseCase.ts
├── VoteReviewHelpfulUseCase.ts
└── UpdateVenueRatingStatsUseCase.ts
```

## Step 9: Testing

### Unit Tests

Test new entities, repositories, and use cases:

```bash
pnpm --filter @inkwave/api test
```

### Integration Tests

Test API endpoints:

```bash
# Test venue creation with new fields
curl -X POST http://localhost:3001/api/venues \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cafe",
    "slug": "test-cafe",
    "latitude": 14.5995,
    "longitude": 120.9842,
    "addressLine1": "123 Main St",
    "city": "Manila",
    "phoneNumber": "+63-xxx-xxx-xxxx",
    "businessType": "cafe",
    "cuisineType": "Filipino"
  }'

# Test review creation
curl -X POST http://localhost:3001/api/venues/:venueId/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Amazing food!",
    "comment": "Best cafe in town",
    "customerName": "John Doe",
    "orderId": "order-uuid"
  }'
```

## Step 10: Frontend Updates

### Customer App Updates

1. Update venue page to display:
   - Location map with coordinates
   - Contact information
   - Business hours
   - Reviews and ratings
   - Photo gallery

2. Add review submission form

3. Add photo gallery viewer

### Dashboard Updates

1. Update venue forms with new fields
2. Add address autocomplete (Google Places API)
3. Add map picker for coordinates
4. Add business hours editor
5. Add photo gallery manager
6. Add review management interface
7. Add review reply functionality

## Rollback Plan

If issues occur during migration:

```sql
-- Rollback to previous migration
-- Find the migration version before venue enhancement
SELECT * FROM drizzle_migrations ORDER BY created_at DESC;

-- Drizzle doesn't have built-in rollback, so you'll need to:
-- 1. Restore from backup
-- 2. Or manually drop new tables and revert column changes

-- Manual rollback (if needed):
DROP TABLE IF EXISTS review_helpful_votes;
DROP TABLE IF EXISTS review_photos;
DROP TABLE IF EXISTS venue_reviews;
DROP TABLE IF EXISTS venue_photos;
DROP TABLE IF EXISTS venue_business_hours;
DROP TABLE IF EXISTS venue_special_hours;
DROP TABLE IF EXISTS venue_attributes;

-- Revert venues table (example - adjust based on your schema):
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS address text,
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  -- ... (drop all new columns)
  ;
```

## Post-Migration Checklist

- [ ] All migrations applied successfully
- [ ] Indexes created
- [ ] Existing data migrated/preserved
- [ ] Domain entities updated
- [ ] Repositories updated
- [ ] Use cases updated
- [ ] API endpoints updated
- [ ] Frontend updated
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Team trained on new features

## Timeline Estimate

- **Database Migration**: 30 minutes
- **Backend Code Updates**: 2-3 days
- **Frontend Updates**: 3-5 days
- **Testing & QA**: 2-3 days
- **Total**: ~1-2 weeks

## Support

If you encounter issues:
1. Check Drizzle ORM docs: https://orm.drizzle.team/
2. Review PostgreSQL error logs
3. Consult the VENUE_SCHEMA_ENHANCEMENT.md document
4. Test in development environment first

---

**Good luck with your migration!** 🚀

