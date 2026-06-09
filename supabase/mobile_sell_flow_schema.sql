-- Sellkar mobile sell-flow schema documentation
-- Documents the existing public.leads and public.pickup_requests tables.
-- NOTE: This file documents the schema, NOT a migration script.
-- These tables already exist with their defined structure.

-- ============================================================
-- CORRECT SCHEMA (Do NOT add these fields - they don't exist)
-- ============================================================
-- DO NOT add: source_channel, customer_id, pickup_request_id,
-- order_id, lead_status to these tables. They don't exist.
-- ============================================================

-- public.leads — Primary Lead Storage
-- Created when user completes OTP verification.
-- Enriched during sell flow (brand/model/condition).
-- lead_notes is TEXT (plain text), NOT JSONB.

-- public.pickup_requests — Created When Pickup is Scheduled
-- Created separately when customer schedules a pickup.
-- Not linked to leads table via foreign key.
-- Both tables exist independently.

-- ============================================================
-- INDEX RECOMMENDATIONS (Run these if needed)
-- ============================================================

-- Indexes for public.leads
-- Phone number lookups
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone_number);

-- Verified phone lookups
CREATE INDEX IF NOT EXISTS idx_leads_verified_phone ON public.leads (verified_phone);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (lead_status);

-- Converted leads
CREATE INDEX IF NOT EXISTS idx_leads_converted ON public.leads (converted_to_pickup);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);

-- Indexes for public.pickup_requests
-- Status filtering
CREATE INDEX IF NOT EXISTS idx_pickup_status ON public.pickup_requests (status);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_pickup_created_at ON public.pickup_requests (created_at DESC);

-- Phone lookups
CREATE INDEX IF NOT EXISTS idx_pickup_phone ON public.pickup_requests (user_phone);

-- ============================================================
-- TABLE STRUCTURE DOCUMENTATION
-- ============================================================

/*
public.leads columns (existing):
- id (UUID, PK)
- customer_name (TEXT)
- phone_number (TEXT)
- verified_phone (TEXT)
- is_phone_verified (BOOLEAN)
- brand_name (TEXT)
- device_id (UUID, FK to devices)
- variant_id (UUID, FK to variants)
- city_id (UUID, FK to cities)
- lead_status (TEXT) — values: 'rnr' (default), 'not-interested', 'scheduled', 'reschedule'
- lead_notes (TEXT) — plain text, NOT JSONB
- final_price (NUMERIC)
- converted_to_pickup (BOOLEAN)
- has_bill, has_box, has_charger (BOOLEAN)
- device_powers_on (BOOLEAN)
- display_condition, body_condition (TEXT)
- can_make_calls, is_touch_working, is_screen_original, is_battery_healthy (BOOLEAN)
- overall_condition, age_group (TEXT)
- created_at (TIMESTAMPTZ)

public.pickup_requests columns (existing):
- id (UUID, PK)
- user_phone (TEXT)
- customer_name (TEXT)
- device_id (UUID, FK to devices)
- variant_id (UUID, FK to variants)
- city_id (UUID, FK to cities)
- address (TEXT)
- pincode (TEXT)
- pickup_date (DATE)
- pickup_time (TEXT)
- status (TEXT)
- final_price (NUMERIC)
- All condition fields (same as leads)
- created_at (TIMESTAMPTZ)
*/