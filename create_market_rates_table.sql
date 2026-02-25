-- Create market_rates table for dynamic pricing
CREATE TABLE IF NOT EXISTS public.market_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name TEXT UNIQUE NOT NULL,
    price_per_kg DECIMAL NOT NULL,
    category TEXT, -- Hydroponics, Microgreens
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) -- Optional: for user-specific rates
);

-- Seed initial data
INSERT INTO public.market_rates (crop_name, price_per_kg, category)
VALUES 
    ('Lettuce', 180, 'Hydroponics'),
    ('Basil', 350, 'Hydroponics'),
    ('Tomato', 60, 'Hydroponics'),
    ('Spinach', 100, 'Hydroponics'),
    ('Cucumber', 50, 'Hydroponics'),
    ('Capsicum', 120, 'Hydroponics'),
    ('Radish', 120, 'Microgreens'),
    ('Sunflower', 150, 'Microgreens'),
    ('Pea Shoots', 140, 'Microgreens'),
    ('Mustard', 100, 'Microgreens'),
    ('Wheatgrass', 80, 'Microgreens'),
    ('Broccoli', 130, 'Microgreens')
ON CONFLICT (crop_name) DO UPDATE 
SET price_per_kg = EXCLUDED.price_per_kg, last_updated = NOW();
