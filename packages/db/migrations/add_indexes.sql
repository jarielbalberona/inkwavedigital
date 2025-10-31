-- Performance indexes for enhanced venue schema
-- Run this AFTER the main migration has been applied

-- ============================================================================
-- VENUES TABLE INDEXES
-- ============================================================================

-- Lookup by slug (unique, but explicit index helps)
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

-- Lookup by tenant
CREATE INDEX IF NOT EXISTS idx_venues_tenant_id ON venues(tenant_id);

-- Geospatial queries (find nearby venues)
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Active venues only (partial index for performance)
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active, tenant_id)
  WHERE is_active = true;

-- Business type filtering
CREATE INDEX IF NOT EXISTS idx_venues_business_type ON venues(business_type)
  WHERE business_type IS NOT NULL;

-- Rating queries
CREATE INDEX IF NOT EXISTS idx_venues_rating ON venues(average_rating DESC)
  WHERE average_rating IS NOT NULL;

-- ============================================================================
-- VENUE REVIEWS INDEXES
-- ============================================================================

-- Get all reviews for a venue
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_id ON venue_reviews(venue_id);

-- Filter by rating
CREATE INDEX IF NOT EXISTS idx_venue_reviews_rating ON venue_reviews(venue_id, rating);

-- Published reviews only (most common query)
CREATE INDEX IF NOT EXISTS idx_venue_reviews_published 
  ON venue_reviews(venue_id, is_published, created_at DESC)
  WHERE is_published = true;

-- Flagged reviews (moderation)
CREATE INDEX IF NOT EXISTS idx_venue_reviews_flagged
  ON venue_reviews(is_flagged, created_at DESC)
  WHERE is_flagged = true;

-- Verified reviews
CREATE INDEX IF NOT EXISTS idx_venue_reviews_verified
  ON venue_reviews(venue_id, is_verified)
  WHERE is_verified = true;

-- Reviews by customer (for profile/history)
CREATE INDEX IF NOT EXISTS idx_venue_reviews_user_id ON venue_reviews(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_venue_reviews_device_id ON venue_reviews(device_id)
  WHERE device_id IS NOT NULL;

-- Reviews linked to orders
CREATE INDEX IF NOT EXISTS idx_venue_reviews_order_id ON venue_reviews(order_id)
  WHERE order_id IS NOT NULL;

-- ============================================================================
-- REVIEW PHOTOS INDEXES
-- ============================================================================

-- Get photos for a review
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id 
  ON review_photos(review_id, sort_order);

-- ============================================================================
-- REVIEW HELPFUL VOTES INDEXES
-- ============================================================================

-- Get votes for a review
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id 
  ON review_helpful_votes(review_id);

-- Prevent duplicate votes (composite unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_helpful_votes_unique_device
  ON review_helpful_votes(review_id, device_id)
  WHERE device_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_review_helpful_votes_unique_user
  ON review_helpful_votes(review_id, user_id)
  WHERE user_id IS NOT NULL;

-- ============================================================================
-- VENUE PHOTOS INDEXES
-- ============================================================================

-- Get all photos for a venue
CREATE INDEX IF NOT EXISTS idx_venue_photos_venue_id ON venue_photos(venue_id);

-- Get photos by type (logo, cover, gallery, etc.)
CREATE INDEX IF NOT EXISTS idx_venue_photos_type 
  ON venue_photos(venue_id, photo_type, is_active, sort_order)
  WHERE is_active = true;

-- Get primary photo for each type
CREATE INDEX IF NOT EXISTS idx_venue_photos_primary
  ON venue_photos(venue_id, photo_type, is_primary)
  WHERE is_primary = true;

-- Photos by uploader (for attribution/management)
CREATE INDEX IF NOT EXISTS idx_venue_photos_uploader 
  ON venue_photos(uploaded_by)
  WHERE uploaded_by IS NOT NULL;

-- ============================================================================
-- VENUE BUSINESS HOURS INDEXES
-- ============================================================================

-- Get hours for a venue
CREATE INDEX IF NOT EXISTS idx_venue_business_hours_venue_id 
  ON venue_business_hours(venue_id);

-- Get hours for specific day
CREATE INDEX IF NOT EXISTS idx_venue_business_hours_venue_day 
  ON venue_business_hours(venue_id, day_of_week, sort_order);

-- ============================================================================
-- VENUE SPECIAL HOURS INDEXES
-- ============================================================================

-- Get special hours for a venue
CREATE INDEX IF NOT EXISTS idx_venue_special_hours_venue_id 
  ON venue_special_hours(venue_id);

-- Get special hours for date range
CREATE INDEX IF NOT EXISTS idx_venue_special_hours_date 
  ON venue_special_hours(venue_id, date);

-- Future special hours
CREATE INDEX IF NOT EXISTS idx_venue_special_hours_upcoming
  ON venue_special_hours(venue_id, date)
  WHERE date >= CURRENT_DATE;

-- ============================================================================
-- VENUE ATTRIBUTES INDEXES
-- ============================================================================

-- Get all attributes for a venue
CREATE INDEX IF NOT EXISTS idx_venue_attributes_venue_id 
  ON venue_attributes(venue_id);

-- Get specific attribute for a venue
CREATE INDEX IF NOT EXISTS idx_venue_attributes_venue_key 
  ON venue_attributes(venue_id, attribute_key, is_active)
  WHERE is_active = true;

-- Find venues with specific attribute
CREATE INDEX IF NOT EXISTS idx_venue_attributes_key 
  ON venue_attributes(attribute_key, is_active)
  WHERE is_active = true;

-- ============================================================================
-- ANALYSIS & STATISTICS
-- ============================================================================

-- After creating indexes, analyze tables for query optimization
ANALYZE venues;
ANALYZE venue_reviews;
ANALYZE review_photos;
ANALYZE review_helpful_votes;
ANALYZE venue_photos;
ANALYZE venue_business_hours;
ANALYZE venue_special_hours;
ANALYZE venue_attributes;

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

-- Run this to see all indexes on the venues table
-- \di+ venues*

-- Or use this query:
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN (
--   'venues', 
--   'venue_reviews', 
--   'review_photos', 
--   'review_helpful_votes',
--   'venue_photos',
--   'venue_business_hours',
--   'venue_special_hours',
--   'venue_attributes'
-- )
-- ORDER BY tablename, indexname;

