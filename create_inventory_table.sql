-- Create Inventory Table for Smart Seed Vault
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    crop_name TEXT NOT NULL,
    quantity_grams NUMERIC DEFAULT 0,
    low_stock_threshold NUMERIC DEFAULT 200,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own inventory" ON inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);
