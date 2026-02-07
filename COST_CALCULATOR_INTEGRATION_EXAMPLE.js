/**
 * EXAMPLE: How to Add CostCalculator to Daily Tracker Forms
 * 
 * This file shows you exactly where to add the CostCalculator component
 * in your DailyTrackerPage.js file
 */

// ============================================================
// STEP 1: Import (Already Done ✓)
// ============================================================
// At the top of DailyTrackerPage.js, you've already added:
// import CostCalculator from '../../components/CostCalculator';


// ============================================================
// STEP 2: Add to Microgreens Form
// ============================================================
// Find the section in your JSX where you have the microgreens form
// Look for where you collect data like temperature, humidity, etc.
// Add this code AFTER the form inputs, before the Save button:

/*
{microgreensEntry.lightHours && (
  <CostCalculator 
    lightingHours={parseFloat(microgreensEntry.lightHours) || 0}
    fanHours={24}
    lightWatts={20}
    fanWatts={15}
    costPerUnit={8}
  />
)}
*/


// ============================================================
// STEP 3: Add to Hydroponics Form
// ============================================================
// Similarly, in the hydroponics form section, add:

/*
{hydroponicsEntry.lightHours && (
  <CostCalculator 
    lightingHours={parseFloat(hydroponicsEntry.lightHours) || 0}
    fanHours={24}
    lightWatts={40}
    fanWatts={20}
    costPerUnit={8}
  />
)}
*/


// ============================================================
// STEP 4: Save Cost Data to Database
// ============================================================
// In the handleSave function (around line 446), add this code
// BEFORE the supabase insert:

/*
// Calculate electricity cost
const lightWatts = type === 'microgreens' ? 20 : 40;
const fanWatts = 15;
const lightHours = type === 'microgreens' 
  ? parseFloat(microgreensEntry.lightHours || 0)
  : parseFloat(hydroponicsEntry.lightHours || 0);

const lightKwh = (lightWatts * lightHours) / 1000;
const fanKwh = (fanWatts * 24) / 1000;
const totalKwh = lightKwh + fanKwh;
const electricityCost = totalKwh * 8; // ₹8/kWh

// Add to logData
logData.electricity_cost = parseFloat(electricityCost.toFixed(2));
logData.power_consumption_kwh = parseFloat(totalKwh.toFixed(2));
*/


// ============================================================
// COMPLETE EXAMPLE: Microgreens Form Section
// ============================================================

export const MicrogreensFormExample = () => {
    return (
        <div className="space-y-4">
            {/* Your existing form inputs */}
            <div>
                <label>Temperature (°C)</label>
                <input type="number" name="temperature" />
            </div>

            <div>
                <label>Humidity (%)</label>
                <input type="number" name="humidity" />
            </div>

            <div>
                <label>Light Hours</label>
                <input type="number" name="lightHours" />
            </div>

            {/* ADD COST CALCULATOR HERE */}
            {microgreensEntry.lightHours && (
                <CostCalculator
                    lightingHours={parseFloat(microgreensEntry.lightHours) || 0}
                    fanHours={24}
                    lightWatts={20}
                    fanWatts={15}
                    costPerUnit={8}
                />
            )}

            {/* Save button */}
            <button type="submit">Save Entry</button>
        </div>
    );
};


// ============================================================
// NOTES:
// ============================================================
// 1. The CostCalculator will only show when lightHours is entered
// 2. It updates in real-time as user types
// 3. Default values:
//    - Microgreens: 20W lights, 15W fans
//    - Hydroponics: 40W lights, 20W fans
//    - Cost: ₹8/kWh (Indian average)
// 4. You can make these values configurable from user settings later
