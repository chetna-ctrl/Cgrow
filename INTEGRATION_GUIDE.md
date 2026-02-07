# Integration Guide: Cost Calculator & Biofilter Features

## Step 1: Run Database Migration

### Instructions:
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `professor_recommendations_schema.sql`
4. Paste and click "Run"
5. Verify success by running the verification queries at the bottom

---

## Step 2: Add Cost Calculator to Daily Tracker

### File: `src/features/tracker/DailyTrackerPage.js`

Add this import at the top:
```javascript
import CostCalculator from '../../components/CostCalculator';
```

Add this code inside the Microgreens form, after the lighting section (around line 950):

```javascript
{/* COST CALCULATOR - NEW FEATURE */}
{microgreensEntry.lightHours && (
  <CostCalculator 
    lightingHours={parseFloat(microgreensEntry.lightHours) || 0}
    fanHours={24} // Assuming fans run 24/7
    lightWatts={20} // T5/T8 LED tubes typical wattage
    fanWatts={15} // Small circulation fan
    costPerUnit={8} // ₹8/kWh - Indian average
  />
)}
```

Similarly, add for Hydroponics form (around line 1200):

```javascript
{/* COST CALCULATOR - NEW FEATURE */}
{hydroponicsEntry.lightHours && (
  <CostCalculator 
    lightingHours={parseFloat(hydroponicsEntry.lightHours) || 0}
    fanHours={24}
    lightWatts={40} // Professional grow lights
    fanWatts={20}
    costPerUnit={8}
  />
)}
```

---

## Step 3: Save Cost Data to Database

### In the `handleSave` function (around line 446):

Add this code before the database insert:

```javascript
// Calculate and save electricity cost
const lightWatts = microgreensEntry.lightingSource === 'GROW_LIGHTS_FULL' ? 40 : 20;
const fanWatts = 15;
const lightKwh = (lightWatts * parseFloat(microgreensEntry.lightHours || 0)) / 1000;
const fanKwh = (fanWatts * 24) / 1000; // Fans run 24/7
const totalKwh = lightKwh + fanKwh;
const electricityCost = totalKwh * 8; // ₹8/kWh

// Add to logData
logData.electricity_cost = parseFloat(electricityCost.toFixed(2));
logData.power_consumption_kwh = parseFloat(totalKwh.toFixed(2));
```

---

## Step 4: Add Biofilter Widget to Dashboard

### File: `src/features/dashboard/DashboardHome.js`

Add this import at the top:
```javascript
import { calculateAirQualityImpact } from '../../utils/agriUtils';
```

Add this code in the component (after stats calculation, around line 50):

```javascript
// Calculate Biofilter Impact
const activeBatchCount = batches.filter(b => 
  b.status === 'Growing' || b.status === 'Harvest Ready'
).length;
const airQuality = calculateAirQualityImpact(activeBatchCount, 'MEDIUM');
```

Add this widget in the JSX (in the grid with other stat cards):

```javascript
{/* BIOFILTER AIR QUALITY WIDGET - NEW FEATURE */}
<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
      <span className="text-2xl">🌱</span>
      Air Quality Impact
    </h3>
    <div className="px-3 py-1 bg-green-100 rounded-full">
      <span className="text-xs font-bold text-green-700">ACTIVE</span>
    </div>
  </div>
  
  <div className="space-y-3">
    <div>
      <p className="text-sm text-green-600 mb-1">Clean Air Delivery Rate</p>
      <p className="text-3xl font-black text-green-700">
        {airQuality.cleanAirVolume} <span className="text-lg">m³/h</span>
      </p>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-3 rounded-lg">
        <p className="text-xs text-gray-600">Daily Volume</p>
        <p className="text-lg font-bold text-green-600">{airQuality.cleanAirVolumeDaily} m³</p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <p className="text-xs text-gray-600">VOC Removal</p>
        <p className="text-lg font-bold text-green-600">{airQuality.vocRemovalEfficiency}%</p>
      </div>
    </div>
    
    <div className="bg-green-100 p-3 rounded-lg border border-green-200">
      <p className="text-sm font-bold text-green-800">{airQuality.message}</p>
    </div>
    
    <p className="text-xs text-green-600 italic">
      {airQuality.recommendation}
    </p>
  </div>
</div>
```

---

## Step 5: Add Net Profit Widget (Optional Enhancement)

### In Dashboard, add this calculation:

```javascript
// Calculate Net Profit
const totalRevenue = batches
  .filter(b => b.status === 'Harvested')
  .reduce((sum, b) => sum + (b.revenue || 0), 0);

const totalElectricityCost = dailyLogs
  .reduce((sum, log) => sum + (log.electricity_cost || 0), 0);

const netProfit = totalRevenue - totalElectricityCost;
```

### Add this widget:

```javascript
<div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
  <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
    <span className="text-2xl">💰</span>
    Net Profit (This Month)
  </h3>
  
  <div className="space-y-3">
    <div>
      <p className="text-4xl font-black text-emerald-600">
        ₹{netProfit.toFixed(2)}
      </p>
    </div>
    
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Revenue:</span>
        <span className="font-bold text-green-600">₹{totalRevenue.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Electricity Cost:</span>
        <span className="font-bold text-red-600">₹{totalElectricityCost.toFixed(2)}</span>
      </div>
    </div>
    
    <div className="bg-emerald-100 p-2 rounded-lg">
      <p className="text-xs text-emerald-800 text-center font-bold">
        {netProfit > 0 ? '✅ Profitable!' : '⚠️ Review costs'}
      </p>
    </div>
  </div>
</div>
```

---

## Step 6: Test Your Integration

### Testing Checklist:

1. **Database Migration**
   - [ ] Run SQL in Supabase
   - [ ] Verify columns exist
   - [ ] Check indexes created

2. **Cost Calculator**
   - [ ] Appears in Daily Tracker when light hours entered
   - [ ] Shows correct ₹ amount
   - [ ] Updates in real-time

3. **Biofilter Widget**
   - [ ] Shows on Dashboard
   - [ ] Displays CADR correctly
   - [ ] Shows VOC removal percentage
   - [ ] Message updates based on batch count

4. **Data Saving**
   - [ ] Create a new daily log
   - [ ] Check if `electricity_cost` saved in database
   - [ ] Verify `power_consumption_kwh` saved

---

## Troubleshooting

### Issue: Cost Calculator not showing
**Solution:** Make sure you've entered light hours in the form first

### Issue: Biofilter shows 0 m³/h
**Solution:** Create at least one active batch (status = 'Growing')

### Issue: Database columns missing
**Solution:** Run the SQL migration again, check for errors

### Issue: Build errors after integration
**Solution:** Run `npm run build` to see specific errors

---

## Next Steps After Integration

1. **User Settings for Electricity Rate**
   - Add a settings page where users can customize `cost_per_kwh`
   - Default is ₹8/kWh but users may have different rates

2. **Fan Speed Control**
   - Add a dropdown in Daily Tracker for fan speed (HIGH/MEDIUM/LOW/OFF)
   - This will affect biofilter calculations

3. **Historical Cost Analytics**
   - Create a chart showing electricity costs over time
   - Compare cost vs revenue trends

4. **Export Enhanced**
   - Update CSV export to include electricity costs
   - Add net profit column

---

## Quick Copy-Paste Snippets

### Import Statement:
```javascript
import CostCalculator from '../../components/CostCalculator';
import { calculateAirQualityImpact } from '../../utils/agriUtils';
```

### Cost Calculator Usage:
```javascript
<CostCalculator 
  lightingHours={parseFloat(lightHours) || 0}
  fanHours={24}
  costPerUnit={8}
/>
```

### Biofilter Calculation:
```javascript
const airQuality = calculateAirQualityImpact(activeBatchCount, 'MEDIUM');
```

---

**Need Help?** Check `PROFESSOR_IMPLEMENTATION_SUMMARY.md` for detailed explanations!
