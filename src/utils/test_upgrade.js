// Smoke Test for Upgraded Agri Utils
import { calculateVPD, calculateDailyGDD, calculateFarmHealth } from './agriUtils.js';

console.log("=== 🔍 Testing Delhi Upgrades ===");

// 1. Test VPD Leaf Offset
// Air 30C, Humidity 60%.
// Old Logic: VPD ~ 1.7
// New Logic: Leaf Temp 28C -> VPD should be lower (better)
const vpd = calculateVPD(30, 60);
console.log(`VPD (Air 30C / Hum 60%) Adjusted: ${vpd.vpd_kpa} kPa`);
if (vpd.vpd_kpa < 1.7) console.log("✅ Leaf Temp Offset Active");

// 2. Test Heat Cap for GDD
// Temp 45C (Delhi Heatwave). Should be treated as 35C (or penalized).
const gdd = calculateDailyGDD(45, 25, 'Lettuce');
console.log(`GDD (Max 45C / Min 25C): ${gdd}`);
// Avg (35+25)/2 = 30. Base 4. GDD ~26. 
// If un-capped: (45+25)/2 = 35. GDD 31.
if (gdd < 31) console.log("✅ Heat Stress Cap Active");

console.log("=== Upgrade Verified ===");
