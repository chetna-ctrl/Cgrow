// Microgreens Bio-filter Complete Data Structure
// Universal Bio-filter Mix Ratio for all seeds
export const UNIVERSAL_MEDIA_MIX = {
    cocopeat: 50,
    perlite: 30,
    vermiculite: 20,
    note: "Perlite 30% rakhna zaruri hai taaki Fan ki hawa mitti se pass ho sake"
};

// Group A: Must Soak Seeds (Inhe Bhigona Zaruri Hai)
export const MUST_SOAK_SEEDS = [
    {
        seedName: "Coriander (Dhaniya)",
        soakingTime: "12-24 Hours",
        soakingNote: "Split seeds first (Beej ko do hisson mein todna zaruri hai)",
        germination: "5-7 Days (Slow)",
        harvestDay: "Day 18-21",
        biofilterTip: "Start Fan Day 8. Isse 'cool' temperature pasand hai.",
        healthNotes: "Digestion, heavy metal detox",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Fenugreek (Methi)",
        soakingTime: "8-12 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 8-12",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Diabetes control, Iron rich. Roots bohot jaldi felt banati hain.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Spinach (Palak)",
        soakingTime: "12 Hours",
        germination: "4-5 Days",
        harvestDay: "Day 14-16",
        biofilterTip: "Start Fan Day 6.",
        healthNotes: "High Iron & Vitamin K. Garmi mein jaldi kharab hota hai (>25°C avoid karein).",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Mung Bean (Moong)",
        soakingTime: "12 Hours",
        germination: "2-3 Days",
        harvestDay: "Day 8-10",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Protein rich. Andhere mein ugne par lambe (white) honge, light mein green.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Lentils (Masoor)",
        soakingTime: "12 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 8-12",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "High fiber. Roots system bio-filter ke liye strong hota hai.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Chickpea (Chana)",
        soakingTime: "12-24 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 10-12",
        biofilterTip: "Start Fan Day 5.",
        healthNotes: "Leaves mein 'Acidic' taste hota hai (Malic acid). Kam paani dein.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Adzuki Bean (Lal Lobia)",
        soakingTime: "12 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 10-14",
        biofilterTip: "Start Fan Day 5.",
        healthNotes: "High Protein. Red stem sundar dikhta hai.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Fava Bean (Bakla)",
        soakingTime: "12-24 Hours",
        germination: "4-5 Days",
        harvestDay: "Day 12-16",
        biofilterTip: "Start Fan Day 6.",
        healthNotes: "Large leaves, bio-filter coverage ke liye acha hai (High surface area).",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    }
];

// Group B: DO NOT SOAK Seeds (Inhe Bhigona Mana Hai)
export const NO_SOAK_SEEDS = [
    {
        seedName: "Chia Seeds",
        soaking: "NO ❌ (Gel banta hai)",
        germination: "3-4 Days",
        harvestDay: "Day 10-14",
        biofilterTip: "Start Fan Day 5.",
        healthNotes: "Superfood, Omega-3. Mitti gili rakhein par beej ke upar mitti na dalein.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Flax Seed (Alsi)",
        soaking: "NO ❌ (Sticky)",
        germination: "3-4 Days",
        harvestDay: "Day 10-12",
        biofilterTip: "Start Fan Day 5.",
        healthNotes: "High production yield. Roots shallow hoti hain, spray dhyan se karein.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Cress (Halim)",
        soaking: "NO ❌",
        germination: "3 Days",
        harvestDay: "Day 8-10",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Spicy taste. Bohot tez ugta hai.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Kale (Karam Saag)",
        soaking: "NO (Small seed)",
        germination: "3-4 Days",
        harvestDay: "Day 10-13",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Vitamin C & K rich. Bio-filter ke liye sturdy leaves hain.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Pak Choi / Tatsoi",
        soaking: "NO",
        germination: "3 Days",
        harvestDay: "Day 10-14",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Mild flavor. Leaves badi hoti hain, achi hawa filter karti hain.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Kohlrabi (Ganth Gobhi)",
        soaking: "NO",
        germination: "3-4 Days",
        harvestDay: "Day 10-12",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Purple varieties bohot sundar lagti hain (Anthocyanins rich).",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Mizuna",
        soaking: "NO",
        germination: "3 Days",
        harvestDay: "Day 10-14",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Serrated leaves (katedar). Low light mein bhi acha ugta hai.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Lettuce (Salaad Patta)",
        soaking: "NO",
        germination: "2-3 Days",
        harvestDay: "Day 12-16",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Delicate hota hai. Fan speed LOW rakhein nahi toh murjha jayega.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Ajwain (Carom)",
        soaking: "NO",
        germination: "4-6 Days",
        harvestDay: "Day 14-18",
        biofilterTip: "Start Fan Day 7.",
        healthNotes: "Strong aroma (active bio-filter mein khushboo dega).",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Thyme",
        soaking: "NO",
        germination: "5-7 Days",
        harvestDay: "Day 20+",
        biofilterTip: "Start Fan Day 8.",
        healthNotes: "Slow grower. Bio-filter ke liye efficient nahi hai (biomass kam hai).",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Clover",
        soaking: "NO",
        germination: "3 Days",
        harvestDay: "Day 10-12",
        biofilterTip: "Start Fan Day 4.",
        healthNotes: "Mild taste. Alfalfa jaisa dikhta hai.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    }
];

// Special Trick Seeds
export const SPECIAL_TRICK_SEEDS = [
    {
        category: "Beetroot & Swiss Chard",
        note: "Inke beej 'Clusters' hote hain (ek beej se 2-3 paudhe nikalte hain)",
        soakingTime: "24 Hours",
        harvestDay: "Day 14-18 (Slow)",
        biofilterNote: "Inke beej sakht hote hain, isliye mitti ki ek patli layer (0.5 cm) se dhakna zaruri hai (Cover them), varna fan ki hawa se beej sookh jayega aur sprout nahi hoga.",
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        category: "Sunflower (Surajmukhi)",
        soakingTime: "8-12 Hours",
        blackoutNote: "Is par thoda wazan (weight) rakhna padta hai blackout phase mein taaki roots mitti mein deep jayein aur chilka (hull) aasaani se utar jaye.",
        mediaRatio: "40% Cocopeat + 40% Perlite + 20% Vermiculite"
    }
];

// Master Table: Complete Microgreen Data
export const MASTER_MICROGREENS_TABLE = [
    {
        seedName: "Radish (Mooli)",
        soakingTime: "No Soaking (Seedha mitti par dalein)",
        growingCycle: "8-10 Days (Blackout: 3 days)",
        biofilterPhase: "Day 4 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "< 28°C",
        moisture: "Medium",
        healthBenefits: "High Vit E, Digestion",
        biofilterProperties: "Sabse fast ugta hai. Roots strong hain, fan ki hawa seh leti hain.",
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Broccoli",
        soakingTime: "No Soaking (Seedha dalein)",
        growingCycle: "10-13 Days (Blackout: 3-4 days)",
        biofilterPhase: "Day 4 se ON",
        tempIdeal: "18°C - 22°C",
        tempMax: "< 25°C",
        moisture: "Medium-High",
        healthBenefits: "Sulforaphane (Cancer fighting)",
        biofilterProperties: "Best 'Air Cleaning' roots structure. High value crop.",
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Mustard (Sarson)",
        soakingTime: "No Soaking",
        growingCycle: "7-10 Days (Blackout: 3 days)",
        biofilterPhase: "Day 3 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "< 30°C",
        moisture: "Medium",
        healthBenefits: "Anti-inflammatory, Antioxidants",
        biofilterProperties: "Very fast biomass (Patte jaldi bharte hain).",
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Pea Shoots (Matar)",
        soakingTime: "12 - 24 Hours (Zaruri hai)",
        growingCycle: "10-14 Days (Blackout: 3 days)",
        biofilterPhase: "Day 4 se ON (High Speed)",
        tempIdeal: "15°C - 20°C",
        tempMax: "< 25°C",
        moisture: "High",
        healthBenefits: "High Protein, Fiber",
        biofilterProperties: "Roots bohot gehri hoti hain. Hawa filter karne ke liye best hai.",
        mediaRatio: "40:40:20"
    },
    {
        seedName: "Sunflower (Surajmukhi)",
        soakingTime: "8 - 12 Hours",
        growingCycle: "10-12 Days (Blackout: 4 days)",
        biofilterPhase: "Day 5 se ON",
        tempIdeal: "20°C - 24°C",
        tempMax: "< 28°C",
        moisture: "Medium",
        healthBenefits: "Healthy Fats, Zinc, Iron",
        biofilterProperties: "Heavy leaves. Need strong fan airflow to prevent mold.",
        mediaRatio: "40:40:20"
    },
    {
        seedName: "Wheatgrass (Gehun)",
        soakingTime: "8 - 12 Hours",
        growingCycle: "7-10 Days (Blackout: 2-3 days)",
        biofilterPhase: "Day 3 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "Tolerates heat",
        moisture: "Medium",
        healthBenefits: "Chlorophyll rich, Detox",
        biofilterProperties: "Dense roots = Good filtration but pressure drop high hoga.",
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Beetroot (Chukandar)",
        soakingTime: "12 - 24 Hours (Hard shell)",
        growingCycle: "14-18 Days (Blackout: 5-6 days)",
        biofilterPhase: "Day 6 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "< 25°C",
        moisture: "High",
        healthBenefits: "Blood pressure control",
        biofilterProperties: "Slow grower. Startups ke liye thoda mushkil hai.",
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Amaranth (Red)",
        soakingTime: "No Soaking (Small seeds)",
        growingCycle: "12-16 Days (Blackout: 4-5 days)",
        biofilterPhase: "Day 5 se ON (Low Speed)",
        tempIdeal: "22°C - 28°C",
        tempMax: "> 20°C (Needs heat)",
        moisture: "Low-Medium",
        healthBenefits: "Vit K, C, Betalains",
        biofilterProperties: "Delicate roots. Fan speed kam rakhni padegi.",
        mediaRatio: "60:20:20"
    },
    {
        seedName: "Basil (Tulsi/Sabja)",
        soakingTime: "NEVER SOAK ❌ (Chipchipa hojayega)",
        growingCycle: "14-21 Days (Blackout: 4 days)",
        biofilterPhase: "Day 5 se ON",
        tempIdeal: "20°C - 25°C",
        tempMax: "< 30°C",
        moisture: "High",
        healthBenefits: "Anti-stress, Immunity",
        biofilterProperties: "Aroma therapy biofilter banata hai.",
        mediaRatio: "60:20:20"
    },
    {
        seedName: "Arugula (Rocket)",
        soakingTime: "NEVER SOAK ❌ (Gel ban jata hai)",
        growingCycle: "8-12 Days (Blackout: 3 days)",
        biofilterPhase: "Day 4 se ON",
        tempIdeal: "15°C - 20°C",
        tempMax: "< 25°C",
        moisture: "Medium",
        healthBenefits: "Peppery taste, Bone health",
        biofilterProperties: "Leaves nazuk hoti hain, fan se jaldi sookh sakti hain.",
        mediaRatio: "50:30:20"
    }
];

// Working Manual Steps
export const WORKING_MANUAL_STEPS = [
    {
        step: 1,
        action: "Mix Prep - Media Mixing",
        detail: "Bucket mein Cocopeat (50%) + Perlite (30%) + Vermiculite (20%) mix karein. Pani dalkar gila karein (Mutthi band karne par 1 boond tapke - Squeeze Test)."
    },
    {
        step: 2,
        action: "Filling - Tray Bharna",
        detail: "Apni holes wali tray mein 2-3 inch mixture bharein. Halka haath rakhein, dabana nahi hai (agar dabaya toh fan hawa nahi kheench payega)."
    },
    {
        step: 3,
        action: "Soaking - Beej Bhigona",
        detail: "Table dekhein: Agar 'No Soaking' likha hai toh seedha step 4 par jayein. Agar '12 Hours' likha hai, toh beej ko katori mein pani mein rakhein."
    },
    {
        step: 4,
        action: "Sowing - Beej Dalna",
        detail: "Media ke upar beej barabar faila dein (Dense mat karna, hawa ruk jayegi)."
    },
    {
        step: 5,
        action: "Covering - Top Layer",
        detail: "Beejon ke upar halki si Vermiculite ki layer (0.5 cm) chhidak dein aur spray bottle se pani dein (Mist)."
    },
    {
        step: 6,
        action: "Blackout - Andhera (Days 0-3)",
        detail: "Tray ko kale kapde ya dusri tray se dhak dein. FAN OFF RAKHEIN. (Agar abhi fan chalaya toh beej sookh jayenge)."
    },
    {
        step: 7,
        action: "The Shift - Light + Fan ON (Day 4)",
        detail: "Jab sprout 1 inch ka ho jaye (Table mein 'Bio-filter Phase' dekhein), dhakkan hata dein. Light ON karein aur Fan ON karein (Suction mode)."
    },
    {
        step: 8,
        action: "Watering - Bottom Watering",
        detail: "Ab upar se pani nahi dena hai. Tray ko utha kar pani ke tub mein 10 min rakhein, fir wapis Fan box par rakh dein."
    },
    {
        step: 9,
        action: "Monitor - Daily Check",
        detail: "Check karein ki fan chal raha hai ya nahi. Agar paudhe murjha rahe hain, toh mitti mein ungli daal kar nami check karein."
    },
    {
        step: 10,
        action: "Harvest - Kataai",
        detail: "Jab 2 patte (True leaves) aa jayein (Harvest Day dekhein), tab kainchi se kaat lein aur naye beej lagayein."
    }
];

// Project Recommendation for 22 Trays
export const TRAY_RECOMMENDATION = {
    totalTrays: 22,
    distribution: [
        {
            category: "Fast & Easy",
            trays: 10,
            seeds: ["Radish", "Broccoli", "Mustard"],
            note: "Inhe bhigona nahi hai"
        },
        {
            category: "High Biomass/Massive Roots",
            trays: 5,
            seeds: ["Pea Shoots", "Sunflower"],
            note: "Inhe bhigona hai"
        },
        {
            category: "Visual/Color",
            trays: 5,
            seeds: ["Red Amaranth", "Beetroot"],
            note: "Amaranth no soak, Beetroot soak"
        },
        {
            category: "Aroma/Scent",
            trays: 2,
            seeds: ["Basil", "Ajwain"],
            note: "Inhe bhigona nahi hai"
        }
    ],
    benefit: "Is mix se aapka bio-filter hawa bhi saaf karega, dikhne mein bhi sundar lagega, aur khushboo bhi dega."
};

// Critical Notes
export const CRITICAL_NOTES = [
    {
        title: "Soaking Rule",
        description: "Sirf Bade Beej (Matar, Sunflower, Wheatgrass, Beetroot) ko bhigona hai. Chote beej (Radish, Mustard, Broccoli) ko seedha mitti par dalna hai. Mucilaginous (Basil, Chia) ko galti se bhi mat bhigona, wo jelly ban jayenge aur kharab ho jayenge."
    },
    {
        title: "Bio-filter Logic",
        description: "Fan tabhi chalana hai jab plants 'Blackout' se bahar aa jayein (Day 3 or 4). Usse pehle humidity chahiye hoti hai germination ke liye."
    },
    {
        title: "Watering",
        description: "Single tray mein fan chalne ki wajah se mitti jaldi sookhegi. Din mein 2 baar check karein. Agar mitti ka rang halka brown ho raha hai, toh pani dein."
    }
];

// Export all data as default
export default {
    UNIVERSAL_MEDIA_MIX,
    MUST_SOAK_SEEDS,
    NO_SOAK_SEEDS,
    SPECIAL_TRICK_SEEDS,
    MASTER_MICROGREENS_TABLE,
    WORKING_MANUAL_STEPS,
    TRAY_RECOMMENDATION,
    CRITICAL_NOTES
};
