// ==========================================
//  COMMERCIAL FARM ENGINE (DELHI STANDARD)
//  ASAE + BIS + Agri-OS Merged Logic
// ==========================================

import { getAveragePrice } from './cropData.js';

export const UNIT_COSTS = {
    STRUCTURE_PER_SQFT: 950,    // GI + Polyfilm + Automation
    HYDRO_SYSTEM_PER_PLANT: 175, // Pipes + Stands + Plumbing
    IOT_KIT_BASE: 45000,         // Sensors + Panels
    CHILLER_PER_HP: 65000,
    FAN_INDUSTRIAL: 45000,
    PAD_PER_FT: 2500
};

export const generateFarmBlueprint = (lengthFt, widthFt, climate = "Delhi", crop = "Lettuce") => {

    // -------------------------------
    // 1️⃣ CLIMATE CONFIGURATION
    // -------------------------------
    const climateConfig = {
        Delhi: {
            airChangesPerMin: 1.2,
            greenhouseHeight: 13,
            chillerRule: 1500 // 1 HP per 1500 Liters
        },
        Bangalore: {
            airChangesPerMin: 1.0,
            greenhouseHeight: 12,
            chillerRule: 2000
        }
    };

    const config = climateConfig[climate] || climateConfig.Delhi;

    // -------------------------------
    // 2️⃣ CONSTANTS (PRODUCTION)
    // -------------------------------
    const WALKWAY_RATIO = 0.25;
    const PIPE_DIAMETER_MM = 110;
    const PIPE_SPACING_FT = 1.5;
    const PLANT_SPACING_INCH = 8;
    const PAD_VELOCITY_FPM = 250;
    const EXHAUST_FAN_CFM = 22000;
    const HAF_FAN_FAN_CFM = 1500;

    // -------------------------------
    // 3️⃣ BASIC DIMENSIONS
    // -------------------------------
    const area = lengthFt * widthFt;
    const volume = area * config.greenhouseHeight;

    // -------------------------------
    // 4️⃣ PRODUCTION CALCULATIONS
    // -------------------------------
    const usableWidth = widthFt * (1 - WALKWAY_RATIO);
    const totalPipes = Math.floor(usableWidth / PIPE_SPACING_FT);
    const totalPipeLength = totalPipes * lengthFt;

    const totalPlants = Math.floor(
        (totalPipeLength * 12) / PLANT_SPACING_INCH
    );

    // -------------------------------
    // 5️⃣ WATER SYSTEM
    // -------------------------------
    const waterPerFootLiters = 2.5; // 4" DFT approx
    const waterInPipes = totalPipeLength * waterPerFootLiters;
    const requiredTank = Math.ceil(waterInPipes * 1.4);

    const pumpHP = Math.ceil(requiredTank / 1000);
    const chillerHP = Math.ceil(requiredTank / config.chillerRule);

    // -------------------------------
    // 6️⃣ COOLING SYSTEM
    // -------------------------------
    const requiredCFM = Math.ceil(
        volume * config.airChangesPerMin
    );

    const padArea = Math.ceil(requiredCFM / PAD_VELOCITY_FPM);
    const padHeight = 5;
    const padLength = Math.ceil(padArea / padHeight);

    const exhaustFans = Math.ceil(requiredCFM / EXHAUST_FAN_CFM);
    const hafFans = Math.ceil((area * 2) / HAF_FAN_FAN_CFM);

    // -------------------------------
    // 7️⃣ ECONOMIC CALCULATIONS
    // -------------------------------
    const capexStructure = area * UNIT_COSTS.STRUCTURE_PER_SQFT;
    const capexHydro = totalPlants * UNIT_COSTS.HYDRO_SYSTEM_PER_PLANT;
    const capexCooling = (exhaustFans * UNIT_COSTS.FAN_INDUSTRIAL) + (padLength * UNIT_COSTS.PAD_PER_FT);
    const capexIOT = UNIT_COSTS.IOT_KIT_BASE;

    const totalCapex = capexStructure + capexHydro + capexCooling + capexIOT;

    // ROI Estimation (Based on Lettuce as default)
    const avgYieldPerPlantKg = 0.25; // 250g per head
    const cyclesPerYear = 10;
    // Fallback to 200 if getAveragePrice fails or returns null
    const marketPrice = getAveragePrice ? (getAveragePrice(crop) || 200) : 200;

    const annualRevenue = totalPlants * avgYieldPerPlantKg * marketPrice * cyclesPerYear;
    const annualOpEx = annualRevenue * 0.35; // 35% OpEx (Electricity, Nutrients, Labor)
    const annualNetProfit = annualRevenue - annualOpEx;
    const paybackYears = totalCapex / annualNetProfit;

    // -------------------------------
    // 8️⃣ FINAL STRUCTURED OUTPUT
    // -------------------------------
    return {
        dimensions: {
            area: `${area} Sq Ft`,
            height: `${config.greenhouseHeight} Ft`
        },

        production: {
            system: "Commercial Flatbed DFT",
            pipeSpec: "110mm (4 inch) UPVC, UV Stabilized",
            totalPipes,
            totalPlants,
            pipeLayout: `Run along ${lengthFt} Ft length`,
            plantSpacing: "8 inches",
            slope: "1 inch drop per 20 Ft",
            outletHeight: "2 inches from bottom (The 'Magic' Safety Layer)"
        },

        waterSystem: {
            staticWaterInPipes: `${Math.round(waterInPipes)} Liters`,
            minimumTankSize: `${requiredTank} Liters`,
            pump: `${pumpHP} HP Submersible (High Head)`,
            chiller: `${chillerHP} HP (Recommended for ${climate} Summer)`
        },

        cooling: {
            airflowRequired: `${requiredCFM} CFM`,
            exhaustFans: `${exhaustFans} x 50-inch Cone Fans`,
            coolingPad: `${padLength} Ft x ${padHeight} Ft (100mm Thick)`,
            circulationFans: `${hafFans} x 16-inch HAF Fans`
        },

        economics: {
            estimatedCapex: Math.round(totalCapex),
            capexBreakdown: {
                structure: capexStructure,
                hydroponics: capexHydro,
                cooling: capexCooling,
                automation: capexIOT
            },
            roi: {
                annualRevenue: Math.round(annualRevenue),
                annualNetProfit: Math.round(annualNetProfit),
                paybackPeriod: isFinite(paybackYears) ? `${paybackYears.toFixed(1)} Years` : "Calculating..."
            }
        },

        installationManual: [
            {
                title: "Exhaust Fans",
                steps: [
                    "Place on Leeward side (usually East/South-East in Delhi)",
                    "Bottom edge must be 3 feet (36 inches) above ground",
                    "Space fans 6-8 feet apart from each other"
                ]
            },
            {
                title: "Cooling Pads",
                steps: [
                    "Install directly opposite the exhaust fans",
                    "Bottom gutter should be 2.5 feet (30 inches) above ground",
                    "Use aluminum frame and silicone sealant for leak proofing"
                ]
            },
            {
                title: "DFT Piping & Slope",
                steps: [
                    "Slope Rule: 1 inch drop per 20 feet of length",
                    "Magic Outlet: Drill hole 2 inches above pipe bottom for power-failure safety",
                    "Provide pipe support every 4-5 feet to prevent sagging"
                ]
            },
            {
                title: "Sensor Placement",
                steps: [
                    "Temp/Humidity: Center of greenhouse, hung above canopy level",
                    "Lux: Near top canopy leaves, avoid pole shadows",
                    "pH/EC: In main reservoir, away from dosing inlets"
                ]
            }
        ]
    };
};
