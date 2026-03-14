/**
 * Agri-OS Expert Knowledge Base (Offline Knowledge Layer)
 * Contains common agricultural patterns, definitions, and troubleshooting logic.
 */

export const EXPERT_KB = {
    // 1. Troubleshoot Patterns (Keywords -> Diagnosis/Action)
    troubleshoot: [
        {
            keywords: ['ph', 'high', 'alkaline'],
            answer: "High pH (>7.0) blocks nutrient uptake. In Delhi, tap water is often alkaline. Action: Use 'pH Down' (phosphoric acid) to reach 5.5-6.5."
        },
        {
            keywords: ['ph', 'low', 'acidic'],
            answer: "Low pH (<5.0) can cause metal toxicity. Action: Add 'pH Up' or fresh water to stabilize between 5.8-6.2."
        },
        {
            keywords: ['mold', 'fungus', 'white', 'fuzz'],
            answer: "White fuzz is often mold due to high humidity (>70%) or poor airflow. Action: Stop misting, increase fan speed, and spray a 3% hydrogen peroxide solution."
        },
        {
            keywords: ['yellow', 'leaves', 'nitrogen', 'chlorosis'],
            answer: "Yellowing (Chlorosis) usually means low nitrogen or pH lockout. Check if your EC is too low (<1.0) or if pH is >7.0."
        },
        {
            keywords: ['root', 'rot', 'brown', 'smell'],
            answer: "Brown, slimy roots = Root Rot. Likely due to high water temp (>26°C). Action: Add an air stone for oxygen and use 'Hydroguard' or hydrogen peroxide."
        },
        {
            keywords: ['harvest', 'when', 'ready'],
            answer: "For microgreens, harvest when first true leaves appear (Day 7-12). For hydro, check your GDD progress in the Analytics tab."
        },
        {
            keywords: ['monsoon', 'rain', 'humidity'],
            answer: "Monsoon means high humidity (>85%). STOP all misting to prevent mold. Keep fans ON 24/7 to ensure airflow."
        },
        {
            keywords: ['winter', 'cold', 'growth'],
            answer: "Delhi winters can slow growth. Keep water temp >18°C. For COOL crops like Lettuce, this is peak season!"
        }
    ],

    // 2. Terminology definitions from Glossary
    definitions: {
        'vpd': "Vapor Pressure Deficit: Measures the 'drying power' of air. Ideal range is 0.8-1.2 kPa.",
        'dli': "Daily Light Integral: Total light received in 24 hours. Most crops need 12-25 mol/m²/day.",
        'ec': "Electrical Conductivity: Measures nutrient strength. Higher EC = more salts/food in water.",
        'blackout': "Initial growth phase where seeds are kept in total darkness to stretch the stems."
    }
};

/**
 * Intelligent local search for agricultural answers
 */
export const searchLocalExpert = (question) => {
    const query = question.toLowerCase();
    
    // 1. Search troubleshooting patterns
    for (const item of EXPERT_KB.troubleshoot) {
        if (item.keywords.some(kw => query.includes(kw))) {
            return `🎓 Local Expert Advice: ${item.answer}`;
        }
    }

    // 2. Search definitions
    for (const [term, def] of Object.entries(EXPERT_KB.definitions)) {
        if (query.includes(term)) {
            return `🎓 Definition: ${def}`;
        }
    }

    return null;
};
