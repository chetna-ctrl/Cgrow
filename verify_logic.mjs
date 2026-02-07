
import { getDailyTaskAdvice, USER_SETTINGS } from './src/utils/agriUtils.js';

console.log("🔍 Verifying Microgreens Logic...");
console.log(`⚙️ User Settings: Tray Type = ${USER_SETTINGS.TRAY_TYPE}`);

// Mock Batch Data
const batch = { sow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }; // Day 5
const batchHarvest = { sow_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }; // Day 6 (Harvest is Day 7)

// Scenario 1: Normal Day 5 (Single Tray Default)
console.log("\n--- Scenario 1: Day 5, Normal Condition ---");
const normal = getDailyTaskAdvice({ sow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, 14, 50, 'NORMAL');
console.log(`Action: ${normal.watering.type}`);
console.log(`Tip: ${normal.watering.tip}`);

// Scenario 2: Humidity Lockout (>75%)
console.log("\n--- Scenario 2: Day 5, High Humidity (80%) ---");
const humid = getDailyTaskAdvice({ sow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, 14, 80, 'NORMAL');
console.log(`Action: ${humid.watering.type}`);
console.log(`Reason: ${humid.watering.tip}`);

// Scenario 3: Tray Heavy Lockout
console.log("\n--- Scenario 3: Day 5, Tray Heavy ---");
const heavy = getDailyTaskAdvice({ sow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, 14, 50, 'HEAVY');
console.log(`Action: ${heavy.watering.type}`);
console.log(`Reason: ${heavy.watering.tip}`);

// Scenario 4: Harvest Prep (Day 6, 1 Day left)
console.log("\n--- Scenario 4: Pre-Harvest (Day 6) ---");
const harvest = getDailyTaskAdvice({ sow_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) }, 14, 50, 'NORMAL');
console.log(`Action: ${harvest.watering.type}`);
console.log(`Tip: ${harvest.watering.tip}`);

// Scenario 5: Blackout (Day 2)
console.log("\n--- Scenario 5: Blackout (Day 2) ---");
const blackout = getDailyTaskAdvice({ sow_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, 0, 50, 'NORMAL');
console.log(`Action: ${blackout.watering.type}`);
console.log(`Tip: ${blackout.watering.tip}`);
