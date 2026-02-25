-- cGrow CRM & Sales Infrastructure
-- This table tracks customers (B2B/B2C) and their orders.

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    phone text,
    email text,
    type text DEFAULT 'Retail', -- 'Retail', 'Wholesale', 'Restaurant'
    location text,
    notes text,
    total_lifetime_value numeric DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    customer_id uuid REFERENCES public.customers(id),
    batch_id uuid, -- Optional link to production
    product_name text NOT NULL,
    quantity numeric NOT NULL,
    unit text DEFAULT 'kg', -- 'kg', 'grams', 'trays'
    total_price numeric NOT NULL,
    status text DEFAULT 'Pending', -- 'Pending', 'Delivered', 'Cancelled'
    payment_status text DEFAULT 'Unpaid', 
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own customers" ON public.customers;
CREATE POLICY "Users can manage their own customers" ON public.customers 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;
CREATE POLICY "Users can manage their own orders" ON public.orders
USING (auth.uid() = user_id);
