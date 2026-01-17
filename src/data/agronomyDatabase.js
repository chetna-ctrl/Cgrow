// ========================================
// AGRONOMY DATABASE - COMPREHENSIVE DATA
// ========================================

// 1. CROP DATABASE (India-focused)
export const CROPS = {
    // VEGETABLES
    tomato: {
        name: "Tomato",
        category: "Vegetable",
        season: ["Kharif", "Rabi"],
        climate: ["Tropical", "Sub-tropical"],
        soilTypes: ["Loamy", "Sandy Loam", "Clay Loam"],
        phRange: { min: 6.0, max: 7.0, ideal: 6.5 },
        ecRange: { min: 2.0, max: 5.0, ideal: 3.5 }, // mS/cm
        tempRange: { min: 20, max: 30, ideal: 25 }, // °C
        growthDays: 90,
        waterNeed: "Medium-High",
        nutrients: {
            N: { value: 120, unit: "kg/ha", stage: "Vegetative" },
            P: { value: 60, unit: "kg/ha", stage: "Flowering" },
            K: { value: 80, unit: "kg/ha", stage: "Fruiting" }
        },
        deficiencySymptoms: {
            N: "Yellowing of older leaves, stunted growth",
            P: "Purple discoloration on leaves, poor root development",
            K: "Brown leaf edges, weak stems"
        }
    },

    lettuce: {
        name: "Lettuce",
        category: "Leafy Green",
        season: ["Rabi", "Zaid"],
        climate: ["Temperate", "Cool"],
        soilTypes: ["Loamy", "Sandy Loam"],
        phRange: { min: 6.0, max: 7.0, ideal: 6.5 },
        ecRange: { min: 1.2, max: 2.0, ideal: 1.6 },
        tempRange: { min: 15, max: 25, ideal: 20 },
        growthDays: 45,
        waterNeed: "Medium",
        nutrients: {
            N: { value: 80, unit: "kg/ha", stage: "Vegetative" },
            P: { value: 40, unit: "kg/ha", stage: "Early Growth" },
            K: { value: 60, unit: "kg/ha", stage: "Maturity" }
        }
    },

    radish: {
        name: "Radish (Microgreen)",
        category: "Microgreen",
        season: ["All Year"],
        climate: ["All"],
        soilTypes: ["Cocopeat", "Soil Mix"],
        phRange: { min: 6.0, max: 7.0, ideal: 6.5 },
        ecRange: { min: 1.0, max: 1.5, ideal: 1.2 },
        tempRange: { min: 18, max: 24, ideal: 21 },
        growthDays: 7,
        waterNeed: "High",
        nutrients: {
            N: { value: 50, unit: "ppm", stage: "Germination" },
            P: { value: 30, unit: "ppm", stage: "Growth" },
            K: { value: 40, unit: "ppm", stage: "Harvest" }
        }
    },

    wheat: {
        name: "Wheat",
        category: "Cereal",
        season: ["Rabi"],
        climate: ["Temperate", "Cool"],
        soilTypes: ["Loamy", "Clay Loam", "Black"],
        phRange: { min: 6.0, max: 7.5, ideal: 6.8 },
        ecRange: { min: 1.0, max: 2.0, ideal: 1.5 },
        tempRange: { min: 12, max: 25, ideal: 20 },
        growthDays: 120,
        waterNeed: "Medium",
        nutrients: {
            N: { value: 120, unit: "kg/ha", stage: "Tillering" },
            P: { value: 60, unit: "kg/ha", stage: "Sowing" },
            K: { value: 40, unit: "kg/ha", stage: "Grain Filling" }
        }
    },

    rice: {
        name: "Rice (Paddy)",
        category: "Cereal",
        season: ["Kharif"],
        climate: ["Tropical", "Sub-tropical"],
        soilTypes: ["Clay", "Clay Loam"],
        phRange: { min: 5.5, max: 6.5, ideal: 6.0 },
        ecRange: { min: 1.0, max: 2.0, ideal: 1.5 },
        tempRange: { min: 25, max: 35, ideal: 30 },
        growthDays: 120,
        waterNeed: "Very High",
        nutrients: {
            N: { value: 120, unit: "kg/ha", stage: "Tillering" },
            P: { value: 60, unit: "kg/ha", stage: "Transplanting" },
            K: { value: 40, unit: "kg/ha", stage: "Panicle Initiation" }
        }
    }
};

// 2. SOIL TYPES DATABASE
export const SOIL_TYPES = {
    loamy: {
        name: "Loamy Soil",
        texture: "Balanced (Sand + Silt + Clay)",
        waterRetention: "Good",
        drainage: "Excellent",
        fertility: "High",
        bestFor: ["Tomato", "Lettuce", "Wheat", "Most Vegetables"],
        phRange: { min: 6.0, max: 7.5 },
        organicMatter: "3-5%",
        recommendation: "Ideal for most crops. Add compost annually."
    },

    sandy: {
        name: "Sandy Soil",
        texture: "Coarse, Gritty",
        waterRetention: "Poor",
        drainage: "Excellent",
        fertility: "Low",
        bestFor: ["Root Vegetables", "Melons", "Potatoes"],
        phRange: { min: 5.5, max: 7.0 },
        organicMatter: "1-2%",
        recommendation: "Add organic matter frequently. Use drip irrigation."
    },

    clay: {
        name: "Clay Soil",
        texture: "Fine, Sticky when wet",
        waterRetention: "Excellent",
        drainage: "Poor",
        fertility: "High",
        bestFor: ["Rice", "Wheat", "Cabbage"],
        phRange: { min: 6.0, max: 7.5 },
        organicMatter: "2-4%",
        recommendation: "Improve drainage with sand/compost. Avoid overwatering."
    },

    black: {
        name: "Black Soil (Regur)",
        texture: "Fine, Deep black",
        waterRetention: "Very High",
        drainage: "Moderate",
        fertility: "Very High",
        bestFor: ["Cotton", "Wheat", "Sorghum", "Sunflower"],
        phRange: { min: 7.0, max: 8.5 },
        organicMatter: "3-5%",
        recommendation: "Rich in calcium and magnesium. Good for Rabi crops."
    },

    red: {
        name: "Red Soil",
        texture: "Sandy to Clay",
        waterRetention: "Moderate",
        drainage: "Good",
        fertility: "Moderate",
        bestFor: ["Groundnut", "Millets", "Pulses"],
        phRange: { min: 5.5, max: 7.0 },
        organicMatter: "1-3%",
        recommendation: "Add lime if pH < 6.0. Use organic fertilizers."
    }
};

// 3. GROWING MEDIA (Hydroponics/Soilless)
export const GROWING_MEDIA = {
    cocopeat: {
        name: "Cocopeat (Coir)",
        type: "Organic",
        waterRetention: "Very High (8-9x its weight)",
        aeration: "Good",
        phRange: { min: 5.5, max: 6.5 },
        ecRange: { min: 0.5, max: 1.0 },
        reusability: "2-3 cycles",
        bestFor: ["Microgreens", "Seedlings", "Potted Plants", "Nursery"],
        mixing: "Mix with perlite (70:30) for better drainage",
        cost: "₹15-25/kg",
        warning: "Pre-wash to remove salts. Check EC before use."
    },

    leca: {
        name: "LECA (Lightweight Expanded Clay Aggregate)",
        type: "Inorganic",
        waterRetention: "Low",
        aeration: "Excellent",
        phRange: { min: 5.5, max: 7.0 },
        ecRange: { min: 0.0, max: 0.5 },
        reusability: "Indefinite (sterilize between crops)",
        bestFor: ["Hydroponics", "DWC", "Flood & Drain", "Aquaponics"],
        mixing: "Use alone or with 10% perlite",
        cost: "₹40-60/kg",
        warning: "Requires continuous nutrient flow. Not suitable for hand-watering."
    },

    perlite: {
        name: "Perlite",
        type: "Inorganic (Volcanic Glass)",
        waterRetention: "Low",
        aeration: "Excellent",
        phRange: { min: 6.5, max: 7.5 },
        ecRange: { min: 0.0, max: 0.0 },
        reusability: "3-4 cycles",
        bestFor: ["Drainage improvement", "Seed starting", "Cuttings"],
        mixing: "Mix with cocopeat (30:70) or soil (20:80)",
        cost: "₹50-80/kg",
        warning: "Dust can irritate lungs. Wet before use."
    },

    rockwool: {
        name: "Rockwool (Stonewool)",
        type: "Inorganic (Spun Rock)",
        waterRetention: "High",
        aeration: "Good",
        phRange: { min: 5.5, max: 6.5 },
        ecRange: { min: 0.5, max: 1.5 },
        reusability: "Single use",
        bestFor: ["Hydroponics", "NFT", "Drip Systems"],
        mixing: "Use alone in cubes/slabs",
        cost: "₹100-150/slab",
        warning: "Pre-soak in pH 5.5 water for 24 hours. Not eco-friendly."
    }
};

// 4. CLIMATE ZONES (India)
export const CLIMATE_ZONES = {
    tropical: {
        name: "Tropical",
        states: ["Kerala", "Tamil Nadu", "Karnataka (South)", "Goa"],
        tempRange: { min: 25, max: 35 },
        rainfall: "High (>200cm)",
        humidity: "High (70-90%)",
        bestCrops: ["Rice", "Coconut", "Banana", "Spices"]
    },

    subtropical: {
        name: "Sub-tropical",
        states: ["Maharashtra", "Gujarat", "MP", "UP (South)"],
        tempRange: { min: 20, max: 35 },
        rainfall: "Moderate (100-200cm)",
        humidity: "Moderate (50-70%)",
        bestCrops: ["Cotton", "Sugarcane", "Wheat", "Soybean"]
    },

    temperate: {
        name: "Temperate",
        states: ["HP", "Uttarakhand", "J&K", "Sikkim"],
        tempRange: { min: 10, max: 25 },
        rainfall: "Moderate (100-200cm)",
        humidity: "Moderate (40-60%)",
        bestCrops: ["Apple", "Wheat", "Barley", "Potato"]
    },

    arid: {
        name: "Arid/Semi-Arid",
        states: ["Rajasthan", "Gujarat (North)", "Haryana"],
        tempRange: { min: 15, max: 45 },
        rainfall: "Low (<50cm)",
        humidity: "Low (20-40%)",
        bestCrops: ["Bajra", "Jowar", "Pulses", "Mustard"]
    }
};

// 5. NUTRIENT DEFICIENCY SYMPTOMS
export const NUTRIENT_DEFICIENCIES = {
    nitrogen: {
        symbol: "N",
        role: "Vegetative growth (leaves, stems)",
        deficiency: {
            symptoms: "Yellowing of older (bottom) leaves, stunted growth, pale green color",
            visual: "Starts from leaf tips, spreads inward",
            severity: "High - affects yield significantly"
        },
        excess: {
            symptoms: "Dark green leaves, delayed flowering, lodging (falling over)",
            fix: "Reduce N fertilizer, increase K"
        },
        sources: ["Urea", "Ammonium Sulfate", "Calcium Nitrate", "Blood Meal"],
        application: "Split doses - 50% basal, 25% vegetative, 25% flowering"
    },

    phosphorus: {
        symbol: "P",
        role: "Root development, flowering, fruiting",
        deficiency: {
            symptoms: "Purple/dark green leaves (especially underside), weak roots, delayed maturity",
            visual: "Older leaves affected first",
            severity: "Medium - affects root strength"
        },
        excess: {
            symptoms: "Locks out zinc and iron, leaf burn",
            fix: "Flush with water, add chelated micronutrients"
        },
        sources: ["DAP", "SSP", "Bone Meal", "Rock Phosphate"],
        application: "100% at sowing/transplanting (immobile in soil)"
    },

    potassium: {
        symbol: "K",
        role: "Overall plant health, disease resistance, fruit quality",
        deficiency: {
            symptoms: "Yellowing/browning at leaf margins (edges), weak stems, poor fruit quality",
            visual: "Scorched leaf edges, curling",
            severity: "High - affects quality and shelf life"
        },
        excess: {
            symptoms: "Locks out calcium and magnesium",
            fix: "Add gypsum (calcium sulfate)"
        },
        sources: ["MOP (Muriate of Potash)", "SOP (Sulfate of Potash)", "Kelp Meal"],
        application: "Split doses - 50% basal, 50% flowering/fruiting"
    },

    calcium: {
        symbol: "Ca",
        role: "Cell wall structure, fruit firmness",
        deficiency: {
            symptoms: "Blossom end rot (black tips on tomatoes/peppers), tip burn in lettuce, distorted new growth",
            visual: "New growth affected (immobile nutrient)",
            severity: "High - causes fruit loss"
        },
        sources: ["Gypsum", "Calcium Nitrate", "Lime"],
        application: "Foliar spray during fruiting, ensure pH > 6.0"
    },

    magnesium: {
        symbol: "Mg",
        role: "Chlorophyll production (photosynthesis)",
        deficiency: {
            symptoms: "Interveinal chlorosis (yellowing between veins) on older leaves, veins remain green",
            visual: "Christmas tree pattern on leaves",
            severity: "Medium - reduces photosynthesis"
        },
        sources: ["Epsom Salt (MgSO4)", "Dolomite Lime"],
        application: "Foliar spray (2% solution) or soil drench"
    },

    iron: {
        symbol: "Fe",
        role: "Chlorophyll synthesis, enzyme activation",
        deficiency: {
            symptoms: "Interveinal chlorosis on NEW (young) leaves, veins remain green",
            visual: "Starts at growing tips",
            severity: "Medium - common in high pH soils"
        },
        sources: ["Chelated Iron (Fe-EDTA)", "Ferrous Sulfate"],
        application: "Foliar spray or acidify soil (pH < 6.5)"
    }
};

// 6. SEASON MAPPING (India)
export const SEASONS = {
    kharif: {
        name: "Kharif (Monsoon)",
        months: ["June", "July", "August", "September"],
        rainfall: "High",
        crops: ["Rice", "Cotton", "Soybean", "Maize", "Groundnut"],
        sowing: "June-July",
        harvest: "September-October"
    },

    rabi: {
        name: "Rabi (Winter)",
        months: ["October", "November", "December", "January", "February", "March"],
        rainfall: "Low (Irrigation needed)",
        crops: ["Wheat", "Barley", "Mustard", "Chickpea", "Peas"],
        sowing: "October-November",
        harvest: "March-April"
    },

    zaid: {
        name: "Zaid (Summer)",
        months: ["March", "April", "May", "June"],
        rainfall: "Low",
        crops: ["Watermelon", "Cucumber", "Muskmelon", "Vegetables"],
        sowing: "March-April",
        harvest: "May-June"
    }
};

export default {
    CROPS,
    SOIL_TYPES,
    GROWING_MEDIA,
    CLIMATE_ZONES,
    NUTRIENT_DEFICIENCIES,
    SEASONS
};
