# ✅ Blackout Tracker - Timezone Fix Complete!

## 🎯 Problem Solved

**Issue**: Blackout Mode Tracker was showing incorrect days/status due to timezone differences causing "Day 0" to start at midnight UTC instead of local midnight.

**Solution**: Fixed date calculation to use `.setHours(0, 0, 0, 0)` for timezone-independent day counting.

---

## 🔧 Changes Made

### 1. **`timerLogic.js`** - Core Logic Fix ✅
**File**: `src/utils/timerLogic.js`

**Updated** `calculateBlackoutStatus()` function:

```javascript
// ✅ BEFORE (Timezone-Dependent - WRONG)
const sow = new Date(sowDate);
const today = new Date();
const daysSinceSowing = Math.floor((today - sow) / (1000 * 60 * 60 * 24));

// ✅ AFTER (Timezone-Independent - CORRECT)
const sow = new Date(sowDate);
sow.setHours(0, 0, 0, 0); // Ignore time component

const today = new Date();
today.setHours(0, 0, 0, 0); // Ignore time component

const age = Math.floor((today - sow) / (1000 * 60 * 60 * 24));
```

---

### 2. **New Status Object Properties** ✅

The function now returns a rich status object with visual properties:

```javascript
{
    phase: 'blackout' | 'growth',
    age: 0-N,                    // Actual days since sowing
    displayAge: 'Day 0',         // User-friendly display
    status: 'KEEP COVERED (Blackout)' | 'UNDER LIGHTS',
    icon: '🌑' | '☀️',          // Visual icon
    iconColor: 'text-slate-800' | 'text-yellow-500',
    bgColor: 'bg-slate-800' | 'bg-green-50',
    textColor: 'text-white' | 'text-green-900',
    borderColor: 'border-slate-600' | 'border-green-300',
    action: 'Keep covered in darkness. 2 days remaining.',
    scientific: 'ICAR Protocol: 72h darkness promotes stem elongation',
    warning: null | {            // WARNING for crops kept in blackout too long
        severity: 'CRITICAL',
        message: '⚠️ ALERT: Day 5 crop should be under lights!',
        action: 'Remove covers immediately...'
    }
}
```

---

### 3. **SchedulerPage.js** - Display Fix ✅
**File**: `src/pages/SchedulerPage.js`

**Updated** Blackout Tracker rendering:

**Before**:
- Used hardcoded color classes based on `urgency` prop
- No icon display
- No warning for late blackout removal

**After**:
- Uses dynamic properties from status object
- Shows icon (🌑 for blackout, ☀️ for light)
- Displays "Day X since sowing"
- Shows red pulsing warning if crop age > 3 days but still marked as in blackout

```javascript
// Check if user marked it as still in blackout
const isStillInBlackout = batch.is_in_blackout;
const blackoutStatus = calculateBlackoutStatus(batch.sow_date, isStillInBlackout);

// Display with dynamic styling
<div className={`${blackoutStatus.bgColor} ${blackoutStatus.borderColor}`}>
    <span className="text-2xl">{blackoutStatus.icon}</span>
    <p>{blackoutStatus.displayAge} since sowing</p>
    <div className="badge">{blackoutStatus.status}</div>
</div>

// Warning alert (if applicable)
{blackoutStatus.warning && (
    <div className="animate-pulse bg-red-100 border-red-500">
        {blackoutStatus.warning.message}
    </div>
)}
```

---

## 📅 Status Display Logic

### **Age 0-3 Days: BLACKOUT PHASE**
```
🌑 KEEP COVERED (Blackout)
└─ Dark background (bg-slate-800)
└─ White text
└─ Action: "Keep covered in darkness. X days remaining."
```

### **Age 4 Days: TRANSITION (URGENT)**
```
☀️ UNDER LIGHTS
└─ Orange background (bg-orange-50)
└─ Orange border (border-orange-500)
└─ Action: "Provide 12-16 hours of light daily."
└─ Urgency: IMMEDIATE
```

### **Age 5+ Days: GROWTH PHASE**
```
☀️ UNDER LIGHTS
└─ Green background (bg-green-50)
└─ Green border (border-green-300)
└─ Action: "Provide 12-16 hours of light daily. Growth day X."
```

---

## ⚠️ Warning System

**Scenario**: User accidentally keeps a 5-day old crop in blackout

**Detection**: Checks `batch.is_in_blackout` from database

**Alert**:
```
┌─────────────────────────────────────────┐
│ ⚠️ ALERT: Day 5 crop should be under   │
│ lights!                                 │
│                                         │
│ Remove covers immediately to prevent   │
│ weak, leggy growth                      │
└─────────────────────────────────────────┘
└─ Red pulsing animation
└─ bg-red-100, border-red-500
```

---

## 🧪 Test Cases

### Test 1: Day 0 (Sowing Day)
```
Sow Date: 2026-01-16
Today: 2026-01-16
Expected: Age = 0, Status = "KEEP COVERED (Blackout)", Icon = 🌑
```

### Test 2: Day 3 (Last Blackout Day)
```
Sow Date: 2026-01-13
Today: 2026-01-16
Expected: Age = 3, Status = "KEEP COVERED (Blackout)", Remaining = 0 days
```

### Test 3: Day 4 (Remove Covers)
```
Sow Date: 2026-01-12
Today: 2026-01-16
Expected: Age = 4, Status = "UNDER LIGHTS", Urgency = IMMEDIATE, Orange BG
```

### Test 4: Day 7 (Growth Phase)
```
Sow Date: 2026-01-09
Today: 2026-01-16
Expected: Age = 7, Status = "UNDER LIGHTS", Green BG, Growth Day 4
```

### Test 5: Warning Alert
```
Sow Date: 2026-01-11 (Age = 5)
is_in_blackout: true (User manually set)
Expected: Status = "UNDER LIGHTS" + Red Warning Alert
```

---

## 🔍 How to Verify

1. **Navigate to Operations Page**
2. **Check Console** (F12 → Console):
   ```
   [Blackout Tracker] Fetched batches from Supabase: [...]
   ```
3. **Look for**:
   - Icon: 🌑 for blackout, ☀️ for light
   - "Day X since sowing" text
   - Correct status badge
   - Color coding (dark for blackout, green/orange for light)

---

## 📋 Database Column Used

| Column | Type | Purpose |
|--------|------|---------|
| `sow_date` | DATE | Sowing date |
| `is_in_blackout` | BOOLEAN | Manual blackout flag |
| `blackout_end_date` | DATE | Auto-calculated (trigger) |

**Note**: The `blackout_end_date` is auto-calculated by the trigger in `supabase_clean_setup.sql` as `sow_date + 3 days`.

---

## ✅ Benefits of This Fix

1. **Timezone Independence**: Works correctly regardless of user's timezone
2. **Accurate Day Counting**: "Day 1" starts at local midnight
3. **Visual Clarity**: Icons and colors make status immediately obvious
4. **Safety Warnings**: Alerts user if crop is kept in blackout too long
5. **Scientific Basis**: Based on ICAR Microgreens Protocol (72-hour darkness)

---

## 🎉 Result

**Before**:
- ❌ "Day 0" might start at 5:30pm IST (UTC midnight)
- ❌ Generic status messages
- ❌ No visual differentiation
- ❌ No warnings for late removal

**After**:
- ✅ "Day 0" starts at local midnight
- ✅ Clear "KEEP COVERED" vs "UNDER LIGHTS"
- ✅ Icons (🌑 / ☀️) for instant recognition
- ✅ Red pulsing alert for late blackout removal
- ✅ Scientific explanations included

**Build Status**: ✅ **SUCCESS** (Exit Code: 0)

---

**Version**: 4.2  
**Date**: January 16, 2026  
**Status**: 🟢 Production Ready
