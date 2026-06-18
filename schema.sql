-- Riyo Studio reviews (Cloudflare D1)
-- Apply locally:  npx wrangler d1 execute riyo-reviews --local  --file=./schema.sql
-- Apply to prod:  npx wrangler d1 execute riyo-reviews --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,                                   -- display name, NULL/blank shows as "Anonymous"
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT NOT NULL,
  tool       TEXT,                                   -- which tool they were using when prompted (optional context)
  status     TEXT NOT NULL DEFAULT 'pending',        -- pending | approved | rejected
  ip_hash    TEXT,                                   -- salted hash of the IP, for rate-limiting only (never the raw IP)
  created_at TEXT NOT NULL                           -- ISO 8601
);

CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_iphash_created ON reviews (ip_hash, created_at);
