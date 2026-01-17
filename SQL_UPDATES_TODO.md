# 📋 SQL Updates - Must Run on Supabase!

## ⚠️ IMPORTANT: Run These SQL Updates

**Last Updated**: January 16, 2026, 1:11 PM IST

---

## ✅ **Step 1: Add Lighting Columns** (REQUIRED)

**File**: `lighting_system_update.sql`

**What It Does**:
- Adds `lighting_source` column to `daily_logs`
- Adds `light_hours_per_day` column to `daily_logs`
- Creates performance indexes

**How to Run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `lighting_system_update.sql`
3. Click **Run**
4. Look for: `✅ LIGHTING SYSTEM UPDATE COMPLETE`

**Script Location**: `c:\Users\deepe\my-agri-os\lighting_system_update.sql`

---

## ✅ **Step 2: Verify All Columns Exist**

Run this query to check if columns are present:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_logs' 
AND column_name IN (
    'lighting_source',
    'light_hours_per_day',
    'dli_mol_per_m2',
    'vpd_kpa',
    'gdd_daily',
    'health_score'
);
```

**Expected Result**: 6 rows (all columns should exist)

---

## ✅ **Step 3 (Optional): Fresh Setup**

If you're setting up a **NEW database**, use the complete schema instead:

**File**: `supabase_clean_setup.sql`

**What It Does**:
- Creates ALL tables from scratch
- Sets up RLS policies
- Adds all triggers and indexes
- Includes all latest columns

**⚠️ WARNING**: Only use this for NEW databases! It will drop existing tables.

**Script Location**: `c:\Users\deepe\my-agri-os\supabase_clean_setup.sql`

---

## 📊 **What Columns Are Needed**

### Required Columns in `daily_logs` Table:

| Column Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| `lighting_source` | TEXT | Light type (LED/Sunlight/etc) | ⚠️ **Add via SQL** |
| `light_hours_per_day` | NUMERIC(4,1) | Hours light was on | ⚠️ **Add via SQL** |
| `dli_mol_per_m2` | NUMERIC(5,2) | Daily Light Integral | ✅ Should exist |
| `vpd_kpa` | NUMERIC(4,2) | Vapor Pressure Deficit | ✅ Should exist |
| `gdd_daily` | NUMERIC(5,2) | Growing Degree Days | ✅ Should exist |
| `health_score` | INTEGER | 0-100 health score | ✅ Should exist |

---

## 🔍 **How to Check Current Schema**

Run this to see ALL columns in `daily_logs`:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_logs'
ORDER BY ordinal_position;
```

---

## ✅ **What to Do Right Now**

### **Option A: Update Existing Database** (Recommended)
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy `lighting_system_update.sql`
4. Click "Run"
5. Check for success message
```

### **Option B: Fresh Setup** (Only if starting new)
```
1. Backup existing data (if any)
2. Run `supabase_clean_setup.sql`
3. Verify all tables created
```

---

## 📝 **After Running SQL**

Check that app works:
1. ✅ Go to Daily Tracker
2. ✅ Select a batch
3. ✅ Blue Advice Card should appear
4. ✅ Lighting dropdown should save data
5. ✅ DLI should calculate correctly

---

## 🆘 **If SQL Fails**

Common issues:

**Error: "Column already exists"**
- ✅ Good! It means it's already added
- Skip to next section

**Error: "Permission denied"**
- Check you're logged in as database owner
- Verify RLS policies

**Error: "Table doesn't exist"**
- You need to run `supabase_clean_setup.sql` (fresh setup)

---

## 📅 **Future SQL Updates**

When adding new features, you may need:

### **Cumulative DLI Tracking**:
```sql
-- No new columns needed! 
-- Just query: SUM(dli_mol_per_m2) WHERE batch_id = 'X'
```

### **Electricity Cost**:
```sql
ALTER TABLE daily_logs 
ADD COLUMN electricity_cost_inr NUMERIC(10,2);
```

### **Notifications**:
```sql
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  severity TEXT,
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## ✅ **Quick Checklist**

- [ ] Run `lighting_system_update.sql` in Supabase
- [ ] Verify 6 columns exist in `daily_logs`
- [ ] Test Daily Tracker (Blue Card appears)
- [ ] Test Operations Page (Blackout icons show)
- [ ] Refresh browser (Ctrl + Shift + R)

---

**File to Run**: `lighting_system_update.sql`  
**Time Needed**: 30 seconds  
**Status**: ⚠️ **PENDING - Must Run!**
