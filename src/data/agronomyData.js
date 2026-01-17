export const growingMedia = {
    cocopeat: {
        name: "Cocopeat (Coir)",
        retention: "High",
        advice: "Check weight before watering. Do not over-water as it holds moisture well.",
        suitableFor: ["Microgreens", "Dutch Bucket", "Pots"]
    },
    leca: {
        name: "LECA (Clay Balls)",
        retention: "Low",
        advice: "Requires continuous flow or frequent flooding. Pump failure is critical.",
        suitableFor: ["DWC", "Flood & Drain", "Nutrient Film"]
    },
    rockwool: {
        name: "Rockwool",
        retention: "Medium-High",
        advice: "Pre-soak in pH 5.5 water. Good for starting seeds but requires careful pH management.",
        suitableFor: ["NFT", "Hydroponics"]
    }
};

export const nutrientDeficiencies = [
    {
        element: "Nitrogen (N)",
        role: "Vegetative Growth (Leaves)",
        symptoms: "Yellowing of older (bottom) leaves. Stunted growth.",
        fix: "Add Nitrogen-rich fertilizer (Calcium Nitrate or Blood Meal)."
    },
    {
        element: "Phosphorus (P)",
        role: "Roots & Flowers",
        symptoms: "Dark green or purple discolouration on leaves (especially underside). Weak roots.",
        fix: "Add Phosphorus booster (Mono Potassium Phosphate or Bone Meal)."
    },
    {
        element: "Potassium (K)",
        role: "Overall Health & Fruit Quality",
        symptoms: "Yellowing/browning at leaf edges (margins). Weak stems.",
        fix: "Add Potassium Sulfate or Kelp Meal."
    },
    {
        element: "Calcium (Ca)",
        role: "Cell Wall Structure",
        symptoms: "New growth is distorted/hooked. Blossom End Rot (black tips) on tomatoes/peppers.",
        fix: "Add Cal-Mag or Calcium Nitrate. Ensure pH is correct (Ca locks out at low pH)."
    },
    {
        element: "Magnesium (Mg)",
        role: "Photosynthesis (Chlorophyll)",
        symptoms: "Interveinal chlorosis (yellowing between veins) on older leaves.",
        fix: "Add Epsom Salts (Magnesium Sulfate)."
    },
    {
        element: "Iron (Fe)",
        role: "Chlorophyll Production",
        symptoms: "Interveinal chlorosis on NEW (top) leaves. Veins remain green.",
        fix: "Add Chelated Iron (Fe-EDTA or Fe-DTPA). Check pH (locks out above 6.5)."
    }
];
