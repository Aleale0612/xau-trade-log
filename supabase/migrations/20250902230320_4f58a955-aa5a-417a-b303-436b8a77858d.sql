-- Add new columns to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS stop_loss DECIMAL,
ADD COLUMN IF NOT EXISTS take_profit DECIMAL,
ADD COLUMN IF NOT EXISTS emotional_psychology TEXT;