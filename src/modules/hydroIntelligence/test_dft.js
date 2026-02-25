// TEST SCRIPT for DFT Logic
// Run with: node src/modules/hydroIntelligence/test_dft.js

import { calculatePowerFailureBuffer, detectStratification, calculateDFTRisk } from './dftAlgorithms.js';
import { calculateOxygenSolubility, detectDeadZones, checkWaterChangeNeeded } from './waterQuality.js';

console.log("=== 🧪 STARTING DFT LOGIC VERIFICATION ===");

// 1. TEST POWER BUFFER
console.log("\n1. Testing Power Failure Buffer:");
const buffer1 = calculatePowerFailureBuffer(100, 25, 20); // 100L, 25C, 20 Plants
console.log(`[100L, 25C, 20 Plants] -> ${buffer1.minutesBuffer} mins (${buffer1.status})`);
if (buffer1.minutesBuffer > 0) console.log("✅ Buffer Calculation Passed");
else console.error("❌ Buffer Math Failed");

// 2. TEST STRATIFICATION
console.log("\n2. Testing Stratification:");
const strat1 = detectStratification(28, 24); // 4C Delta (Bad)
console.log(`[Top 28C, Bottom 24C] -> Alert: ${strat1?.title}`);
if (strat1?.severity === 'HIGH') console.log("✅ Stratification Detection Passed");

// 3. TEST OXYGEN SOLUBILITY
console.log("\n3. Testing O2 Solubility:");
const sat20 = calculateOxygenSolubility(20);
const sat30 = calculateOxygenSolubility(30);
console.log(`Saturation @ 20C: ${sat20} mg/L (Target ~9.1)`);
console.log(`Saturation @ 30C: ${sat30} mg/L (Target ~7.5)`);
if (sat20 > sat30) console.log("✅ Henry's Law Passed (Colder water holds more O2)");

// 4. TEST DEAD ZONES
console.log("\n4. Testing Dead Zone Logic:");
const zone1 = detectDeadZones(1.2, 0.8); // 0.4 Drop (High)
console.log(`[In 1.2, Out 0.8] -> ${zone1?.message}`);
if (zone1?.status === 'DEAD_ZONE') console.log("✅ Dead Zone Detected");

console.log("\n=== ✅ VERIFICATION COMPLETE ===");
