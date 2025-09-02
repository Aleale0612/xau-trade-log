-- Add PNL IDR column to trades table
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS pnl_idr DECIMAL DEFAULT 0;

-- Update existing trades to calculate PNL IDR based on result_usd
UPDATE public.trades SET pnl_idr = result_usd * 15500;