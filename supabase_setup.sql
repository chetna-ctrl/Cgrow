-- 1. Create the table
create table crops (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null, -- e.g. "Radish"
  sowing_date date not null,
  status text not null default 'Seeded', -- Seeded, Growing, Harvest Ready, Harvested
  harvest_date date, -- Can be null initially
  qty_trays int default 1
);

-- 2. Insert your "Real" Test Data (Note the dates are logic-safe)
insert into crops (name, sowing_date, status, qty_trays)
values 
  ('Radish (Batch A)', '2026-01-01', 'Growing', 2),
  ('Sunflower (Batch B)', '2026-01-05', 'Seeded', 4);
  
-- 3. Enable Row Level Security (Safety)
alter table crops enable row level security;
create policy "Public Access" on crops for all using (true);
