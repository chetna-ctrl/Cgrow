// Bilingual Microgreens Data (English + Hinglish)

export const UNIVERSAL_MEDIA_MIX = {
    cocopeat: 50,
    perlite: 30,
    vermiculite: 20,
    note: {
        en: "30% Perlite is essential for proper airflow through the fan system",
        hi: "Perlite 30% rakhna zaruri hai taaki Fan ki hawa mitti se pass ho sake"
    }
};

export const MUST_SOAK_SEEDS = [
    {
        seedName: "Coriander (Dhaniya)",
        soakingTime: "12-24 Hours",
        soakingNote: {
            en: "Split seeds first - breaking the seed into two halves is essential",
            hi: "Beej ko do hisson mein todna (split) zaruri hai"
        },
        germination: "5-7 Days (Slow)",
        harvestDay: "Day 18-21",
        biofilterTip: {
            en: "Start Fan on Day 8. Prefers cool temperature.",
            hi: "Start Fan Day 8. Isse 'cool' temperature pasand hai."
        },
        healthNotes: {
            en: "Digestion support, heavy metal detox",
            hi: "Digestion, heavy metal detox"
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Fenugreek (Methi)",
        soakingTime: "8-12 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 8-12",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Diabetes control, Iron rich. Roots form felt-like mat very quickly.",
            hi: "Diabetes control, Iron rich. Roots bohot jaldi felt banati hain."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Spinach (Palak)",
        soakingTime: "12 Hours",
        germination: "4-5 Days",
        harvestDay: "Day 14-16",
        biofilterTip: {
            en: "Start Fan on Day 6.",
            hi: "Start Fan Day 6."
        },
        healthNotes: {
            en: "High Iron & Vitamin K. Spoils quickly in heat (avoid >25°C).",
            hi: "High Iron & Vitamin K. Garmi mein jaldi kharab hota hai (>25°C avoid karein)."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Mung Bean (Moong)",
        soakingTime: "12 Hours",
        germination: "2-3 Days",
        harvestDay: "Day 8-10",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Protein rich. Grows white/long in darkness, green in light.",
            hi: "Protein rich. Andhere mein ugne par lambe (white) honge, light mein green."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Lentils (Masoor)",
        soakingTime: "12 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 8-12",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "High fiber. Root system is strong for bio-filtration.",
            hi: "High fiber. Roots system bio-filter ke liye strong hota hai."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Chickpea (Chana)",
        soakingTime: "12-24 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 10-12",
        biofilterTip: {
            en: "Start Fan on Day 5.",
            hi: "Start Fan Day 5."
        },
        healthNotes: {
            en: "Leaves have acidic taste (Malic acid). Use less water.",
            hi: "Leaves mein 'Acidic' taste hota hai (Malic acid). Kam paani dein."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Adzuki Bean (Lal Lobia)",
        soakingTime: "12 Hours",
        germination: "3-4 Days",
        harvestDay: "Day 10-14",
        biofilterTip: {
            en: "Start Fan on Day 5.",
            hi: "Start Fan Day 5."
        },
        healthNotes: {
            en: "High Protein. Beautiful red stems.",
            hi: "High Protein. Red stem sundar dikhta hai."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Fava Bean (Bakla)",
        soakingTime: "12-24 Hours",
        germination: "4-5 Days",
        harvestDay: "Day 12-16",
        biofilterTip: {
            en: "Start Fan on Day 6.",
            hi: "Start Fan Day 6."
        },
        healthNotes: {
            en: "Large leaves, excellent for bio-filter coverage (High surface area).",
            hi: "Large leaves, bio-filter coverage ke liye acha hai (High surface area)."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    }
];

export const NO_SOAK_SEEDS = [
    {
        seedName: "Chia Seeds",
        soaking: "NO ❌",
        soakingReason: {
            en: "Forms gel coating",
            hi: "Gel banta hai"
        },
        germination: "3-4 Days",
        harvestDay: "Day 10-14",
        biofilterTip: {
            en: "Start Fan on Day 5.",
            hi: "Start Fan Day 5."
        },
        healthNotes: {
            en: "Superfood, Omega-3. Keep soil moist but don't cover seeds with soil.",
            hi: "Superfood, Omega-3. Mitti gili rakhein par beej ke upar mitti na dalein."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Flax Seed (Alsi)",
        soaking: "NO ❌",
        soakingReason: {
            en: "Becomes sticky",
            hi: "Sticky hota hai"
        },
        germination: "3-4 Days",
        harvestDay: "Day 10-12",
        biofilterTip: {
            en: "Start Fan on Day 5.",
            hi: "Start Fan Day 5."
        },
        healthNotes: {
            en: "High production yield. Shallow roots, spray carefully.",
            hi: "High production yield. Roots shallow hoti hain, spray dhyan se karein."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Cress (Halim)",
        soaking: "NO ❌",
        germination: "3 Days",
        harvestDay: "Day 8-10",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Spicy taste. Grows very fast.",
            hi: "Spicy taste. Bohot tez ugta hai."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Kale (Karam Saag)",
        soaking: "NO",
        soakingReason: {
            en: "Small seed",
            hi: "Small seed"
        },
        germination: "3-4 Days",
        harvestDay: "Day 10-13",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Vitamin C & K rich. Sturdy leaves for bio-filtration.",
            hi: "Vitamin C & K rich. Bio-filter ke liye sturdy leaves hain."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Pak Choi / Tatsoi",
        soaking: "NO",
        germination: "3 Days",
        harvestDay: "Day 10-14",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Mild flavor. Large leaves filter air well.",
            hi: "Mild flavor. Leaves badi hoti hain, achi hawa filter karti hain."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Kohlrabi (Ganth Gobhi)",
        soaking: "NO",
        germination: "3-4 Days",
        harvestDay: "Day 10-12",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Purple varieties are beautiful (Anthocyanins rich).",
            hi: "Purple varieties bohot sundar lagti hain (Anthocyanins rich)."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Mizuna",
        soaking: "NO",
        germination: "3 Days",
        harvestDay: "Day 10-14",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Serrated leaves. Grows well even in low light.",
            hi: "Serrated leaves (katedar). Low light mein bhi acha ugta hai."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Lettuce (Salaad Patta)",
        soaking: "NO",
        germination: "2-3 Days",
        harvestDay: "Day 12-16",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Delicate. Keep fan speed LOW or it will wilt.",
            hi: "Delicate hota hai. Fan speed LOW rakhein nahi toh murjha jayega."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Ajwain (Carom)",
        soaking: "NO",
        germination: "4-6 Days",
        harvestDay: "Day 14-18",
        biofilterTip: {
            en: "Start Fan on Day 7.",
            hi: "Start Fan Day 7."
        },
        healthNotes: {
            en: "Strong aroma (creates aromatherapy bio-filter).",
            hi: "Strong aroma (active bio-filter mein khushboo dega)."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Thyme",
        soaking: "NO",
        germination: "5-7 Days",
        harvestDay: "Day 20+",
        biofilterTip: {
            en: "Start Fan on Day 8.",
            hi: "Start Fan Day 8."
        },
        healthNotes: {
            en: "Slow grower. Not efficient for bio-filter (low biomass).",
            hi: "Slow grower. Bio-filter ke liye efficient nahi hai (biomass kam hai)."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    },
    {
        seedName: "Clover",
        soaking: "NO",
        germination: "3 Days",
        harvestDay: "Day 10-12",
        biofilterTip: {
            en: "Start Fan on Day 4.",
            hi: "Start Fan Day 4."
        },
        healthNotes: {
            en: "Mild taste. Looks similar to Alfalfa.",
            hi: "Mild taste. Alfalfa jaisa dikhta hai."
        },
        mediaRatio: "50% Cocopeat + 30% Perlite + 20% Vermiculite"
    }
];

export const MASTER_MICROGREENS_TABLE = [
    {
        seedName: "Radish (Mooli)",
        soakingTime: {
            en: "No Soaking (Direct sow)",
            hi: "No Soaking (Seedha mitti par dalein)"
        },
        growingCycle: "8-10 Days (Blackout: 3 days)",
        biofilterPhase: "Day 4 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "< 28°C",
        moisture: "Medium",
        healthBenefits: {
            en: "High Vitamin E, Digestion support",
            hi: "High Vit E, Digestion"
        },
        biofilterProperties: {
            en: "Fastest growing. Strong roots withstand fan airflow.",
            hi: "Sabse fast ugta hai. Roots strong hain, fan ki hawa seh leti hain."
        },
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Broccoli",
        soakingTime: {
            en: "No Soaking (Direct sow)",
            hi: "No Soaking (Seedha dalein)"
        },
        growingCycle: "10-13 Days (Blackout: 3-4 days)",
        biofilterPhase: "Day 4 se ON",
        tempIdeal: "18°C - 22°C",
        tempMax: "< 25°C",
        moisture: "Medium-High",
        healthBenefits: {
            en: "Sulforaphane (Cancer fighting)",
            hi: "Sulforaphane (Cancer fighting)"
        },
        biofilterProperties: {
            en: "Best air cleaning root structure. High value crop.",
            hi: "Best 'Air Cleaning' roots structure. High value crop."
        },
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Mustard (Sarson)",
        soakingTime: {
            en: "No Soaking",
            hi: "No Soaking"
        },
        growingCycle: "7-10 Days (Blackout: 3 days)",
        biofilterPhase: "Day 3 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "< 30°C",
        moisture: "Medium",
        healthBenefits: {
            en: "Anti-inflammatory, Antioxidants",
            hi: "Anti-inflammatory, Antioxidants"
        },
        biofilterProperties: {
            en: "Very fast biomass production (leaves fill quickly).",
            hi: "Very fast biomass (Patte jaldi bharte hain)."
        },
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Pea Shoots (Matar)",
        soakingTime: {
            en: "12-24 Hours (Essential)",
            hi: "12 - 24 Hours (Zaruri hai)"
        },
        growingCycle: "10-14 Days (Blackout: 3 days)",
        biofilterPhase: "Day 4 se ON (High Speed)",
        tempIdeal: "15°C - 20°C",
        tempMax: "< 25°C",
        moisture: "High",
        healthBenefits: {
            en: "High Protein, Fiber",
            hi: "High Protein, Fiber"
        },
        biofilterProperties: {
            en: "Very deep roots. Best for air filtration.",
            hi: "Roots bohot gehri hoti hain. Hawa filter karne ke liye best hai."
        },
        mediaRatio: "40:40:20"
    },
    {
        seedName: "Sunflower (Surajmukhi)",
        soakingTime: {
            en: "8-12 Hours",
            hi: "8 - 12 Hours"
        },
        growingCycle: "10-12 Days (Blackout: 4 days)",
        biofilterPhase: "Day 5 se ON",
        tempIdeal: "20°C - 24°C",
        tempMax: "< 28°C",
        moisture: "Medium",
        healthBenefits: {
            en: "Healthy Fats, Zinc, Iron",
            hi: "Healthy Fats, Zinc, Iron"
        },
        biofilterProperties: {
            en: "Heavy leaves. Need strong fan airflow to prevent mold.",
            hi: "Heavy leaves. Need strong fan airflow to prevent mold."
        },
        mediaRatio: "40:40:20"
    },
    {
        seedName: "Wheatgrass (Gehun)",
        soakingTime: {
            en: "8-12 Hours",
            hi: "8 - 12 Hours"
        },
        growingCycle: "7-10 Days (Blackout: 2-3 days)",
        biofilterPhase: "Day 3 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "Tolerates heat",
        moisture: "Medium",
        healthBenefits: {
            en: "Chlorophyll rich, Detox",
            hi: "Chlorophyll rich, Detox"
        },
        biofilterProperties: {
            en: "Dense roots = Good filtration but high pressure drop.",
            hi: "Dense roots = Good filtration but pressure drop high hoga."
        },
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Beetroot (Chukandar)",
        soakingTime: {
            en: "12-24 Hours (Hard shell)",
            hi: "12 - 24 Hours (Hard shell)"
        },
        growingCycle: "14-18 Days (Blackout: 5-6 days)",
        biofilterPhase: "Day 6 se ON",
        tempIdeal: "18°C - 24°C",
        tempMax: "< 25°C",
        moisture: "High",
        healthBenefits: {
            en: "Blood pressure control",
            hi: "Blood pressure control"
        },
        biofilterProperties: {
            en: "Slow grower. Challenging for startups.",
            hi: "Slow grower. Startups ke liye thoda mushkil hai."
        },
        mediaRatio: "50:30:20"
    },
    {
        seedName: "Amaranth (Red)",
        soakingTime: {
            en: "No Soaking (Small seeds)",
            hi: "No Soaking (Small seeds)"
        },
        growingCycle: "12-16 Days (Blackout: 4-5 days)",
        biofilterPhase: "Day 5 se ON (Low Speed)",
        tempIdeal: "22°C - 28°C",
        tempMax: "> 20°C (Needs heat)",
        moisture: "Low-Medium",
        healthBenefits: {
            en: "Vitamin K, C, Betalains",
            hi: "Vit K, C, Betalains"
        },
        biofilterProperties: {
            en: "Delicate roots. Keep fan speed low.",
            hi: "Delicate roots. Fan speed kam rakhni padegi."
        },
        mediaRatio: "60:20:20"
    },
    {
        seedName: "Basil (Tulsi/Sabja)",
        soakingTime: {
            en: "NEVER SOAK ❌ (Becomes sticky)",
            hi: "NEVER SOAK ❌ (Chipchipa hojayega)"
        },
        growingCycle: "14-21 Days (Blackout: 4 days)",
        biofilterPhase: "Day 5 se ON",
        tempIdeal: "20°C - 25°C",
        tempMax: "< 30°C",
        moisture: "High",
        healthBenefits: {
            en: "Anti-stress, Immunity",
            hi: "Anti-stress, Immunity"
        },
        biofilterProperties: {
            en: "Creates aromatherapy bio-filter.",
            hi: "Aroma therapy biofilter banata hai."
        },
        mediaRatio: "60:20:20"
    },
    {
        seedName: "Arugula (Rocket)",
        soakingTime: {
            en: "NEVER SOAK ❌ (Forms gel)",
            hi: "NEVER SOAK ❌ (Gel ban jata hai)"
        },
        growingCycle: "8-12 Days (Blackout: 3 days)",
        biofilterPhase: "Day 4 se ON",
        tempIdeal: "15°C - 20°C",
        tempMax: "< 25°C",
        moisture: "Medium",
        healthBenefits: {
            en: "Peppery taste, Bone health",
            hi: "Peppery taste, Bone health"
        },
        biofilterProperties: {
            en: "Delicate leaves, dry quickly from fan.",
            hi: "Leaves nazuk hoti hain, fan se jaldi sookh sakti hain."
        },
        mediaRatio: "50:30:20"
    }
];

export const WORKING_MANUAL_STEPS = [
    {
        step: 1,
        action: {
            en: "Mix Prep - Media Mixing",
            hi: "Mix Prep - Media Mixing"
        },
        detail: {
            en: "Mix Cocopeat (50%) + Perlite (30%) + Vermiculite (20%) in a bucket. Add water until moist (Squeeze Test: when you close your fist, 1 drop should fall).",
            hi: "Bucket mein Cocopeat (50%) + Perlite (30%) + Vermiculite (20%) mix karein. Pani dalkar gila karein (Mutthi band karne par 1 boond tapke - Squeeze Test)."
        }
    },
    {
        step: 2,
        action: {
            en: "Filling - Fill Tray",
            hi: "Filling - Tray Bharna"
        },
        detail: {
            en: "Fill your perforated tray with 2-3 inches of mixture. Keep it light, don't compress (if compressed, fan won't pull air through).",
            hi: "Apni holes wali tray mein 2-3 inch mixture bharein. Halka haath rakhein, dabana nahi hai (agar dabaya toh fan hawa nahi kheench payega)."
        }
    },
    {
        step: 3,
        action: {
            en: "Soaking - Seed Soaking",
            hi: "Soaking - Beej Bhigona"
        },
        detail: {
            en: "Check table: If 'No Soaking' is mentioned, go directly to step 4. If '12 Hours' is mentioned, soak seeds in water in a bowl.",
            hi: "Table dekhein: Agar 'No Soaking' likha hai toh seedha step 4 par jayein. Agar '12 Hours' likha hai, toh beej ko katori mein pani mein rakhein."
        }
    },
    {
        step: 4,
        action: {
            en: "Sowing - Seed Placement",
            hi: "Sowing - Beej Dalna"
        },
        detail: {
            en: "Spread seeds evenly on top of media (Don't make it too dense, air will get blocked).",
            hi: "Media ke upar beej barabar faila dein (Dense mat karna, hawa ruk jayegi)."
        }
    },
    {
        step: 5,
        action: {
            en: "Covering - Top Layer",
            hi: "Covering - Top Layer"
        },
        detail: {
            en: "Sprinkle a thin layer of Vermiculite (0.5 cm) on top of seeds and mist with spray bottle.",
            hi: "Beejon ke upar halki si Vermiculite ki layer (0.5 cm) chhidak dein aur spray bottle se pani dein (Mist)."
        }
    },
    {
        step: 6,
        action: {
            en: "Blackout - Darkness (Days 0-3)",
            hi: "Blackout - Andhera (Days 0-3)"
        },
        detail: {
            en: "Cover tray with black cloth or another tray. KEEP FAN OFF. (If you turn on fan now, seeds will dry out).",
            hi: "Tray ko kale kapde ya dusri tray se dhak dein. FAN OFF RAKHEIN. (Agar abhi fan chalaya toh beej sookh jayenge)."
        }
    },
    {
        step: 7,
        action: {
            en: "The Shift - Light + Fan ON (Day 4)",
            hi: "The Shift - Light + Fan ON (Day 4)"
        },
        detail: {
            en: "When sprout reaches 1 inch (check 'Bio-filter Phase' in table), remove cover. Turn ON Light and turn ON Fan (Suction mode).",
            hi: "Jab sprout 1 inch ka ho jaye (Table mein 'Bio-filter Phase' dekhein), dhakkan hata dein. Light ON karein aur Fan ON karein (Suction mode)."
        }
    },
    {
        step: 8,
        action: {
            en: "Watering - Bottom Watering",
            hi: "Watering - Bottom Watering"
        },
        detail: {
            en: "Don't water from top anymore. Lift tray and place in water tub for 10 min, then put back on Fan box.",
            hi: "Ab upar se pani nahi dena hai. Tray ko utha kar pani ke tub mein 10 min rakhein, fir wapis Fan box par rakh dein."
        }
    },
    {
        step: 9,
        action: {
            en: "Monitor - Daily Check",
            hi: "Monitor - Daily Check"
        },
        detail: {
            en: "Check if fan is running. If plants are wilting, insert finger in soil to check moisture.",
            hi: "Check karein ki fan chal raha hai ya nahi. Agar paudhe murjha rahe hain, toh mitti mein ungli daal kar nami check karein."
        }
    },
    {
        step: 10,
        action: {
            en: "Harvest - Cutting",
            hi: "Harvest - Kataai"
        },
        detail: {
            en: "When 2 true leaves appear (check Harvest Day), cut with scissors and plant new seeds.",
            hi: "Jab 2 patte (True leaves) aa jayein (Harvest Day dekhein), tab kainchi se kaat lein aur naye beej lagayein."
        }
    }
];

export const TRAY_RECOMMENDATION = {
    totalTrays: 22,
    distribution: [
        {
            category: {
                en: "Fast & Easy",
                hi: "Fast & Easy"
            },
            trays: 10,
            seeds: ["Radish", "Broccoli", "Mustard"],
            note: {
                en: "No soaking required",
                hi: "Inhe bhigona nahi hai"
            }
        },
        {
            category: {
                en: "High Biomass/Massive Roots",
                hi: "High Biomass/Massive Roots"
            },
            trays: 5,
            seeds: ["Pea Shoots", "Sunflower"],
            note: {
                en: "Soaking required",
                hi: "Inhe bhigona hai"
            }
        },
        {
            category: {
                en: "Visual/Color",
                hi: "Visual/Color"
            },
            trays: 5,
            seeds: ["Red Amaranth", "Beetroot"],
            note: {
                en: "Amaranth no soak, Beetroot soak",
                hi: "Amaranth no soak, Beetroot soak"
            }
        },
        {
            category: {
                en: "Aroma/Scent",
                hi: "Aroma/Scent"
            },
            trays: 2,
            seeds: ["Basil", "Ajwain"],
            note: {
                en: "No soaking required",
                hi: "Inhe bhigona nahi hai"
            }
        }
    ],
    benefit: {
        en: "This mix will clean the air, look beautiful, and provide fragrance.",
        hi: "Is mix se aapka bio-filter hawa bhi saaf karega, dikhne mein bhi sundar lagega, aur khushboo bhi dega."
    }
};

export const CRITICAL_NOTES = [
    {
        title: {
            en: "Soaking Rule",
            hi: "Soaking Rule"
        },
        description: {
            en: "Only soak Large Seeds (Peas, Sunflower, Wheatgrass, Beetroot). Directly sow Small seeds (Radish, Mustard, Broccoli). NEVER soak Mucilaginous seeds (Basil, Chia) - they will turn into jelly and spoil.",
            hi: "Sirf Bade Beej (Matar, Sunflower, Wheatgrass, Beetroot) ko bhigona hai. Chote beej (Radish, Mustard, Broccoli) ko seedha mitti par dalna hai. Mucilaginous (Basil, Chia) ko galti se bhi mat bhigona, wo jelly ban jayenge aur kharab ho jayenge."
        }
    },
    {
        title: {
            en: "Bio-filter Logic",
            hi: "Bio-filter Logic"
        },
        description: {
            en: "Turn on fan only when plants come out of 'Blackout' phase (Day 3 or 4). Before that, humidity is needed for germination.",
            hi: "Fan tabhi chalana hai jab plants 'Blackout' se bahar aa jayein (Day 3 or 4). Usse pehle humidity chahiye hoti hai germination ke liye."
        }
    },
    {
        title: {
            en: "Watering",
            hi: "Watering"
        },
        description: {
            en: "In single tray setup, soil dries quickly due to fan. Check twice daily. If soil color turns light brown, add water.",
            hi: "Single tray mein fan chalne ki wajah se mitti jaldi sookhegi. Din mein 2 baar check karein. Agar mitti ka rang halka brown ho raha hai, toh pani dein."
        }
    }
];

export default {
    UNIVERSAL_MEDIA_MIX,
    MUST_SOAK_SEEDS,
    NO_SOAK_SEEDS,
    MASTER_MICROGREENS_TABLE,
    WORKING_MANUAL_STEPS,
    TRAY_RECOMMENDATION,
    CRITICAL_NOTES
};
