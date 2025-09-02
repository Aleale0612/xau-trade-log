-- Add risk_percent column to trades table for tracking risk percentage
ALTER TABLE public.trades ADD COLUMN risk_percent numeric;