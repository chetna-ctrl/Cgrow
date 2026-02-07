export const CROP_LIBRARY = {
    // ==========================================
    // CATEGORY A: LEAFY GREENS (High N, Cool/Temperate)
    // ==========================================
    'lettuce': {
        name: 'Lettuce',
        type: 'Leafy',
        variety: 'Generic / Romaine / Butterhead',
        growth_days: 45,
        stages: {
            'all': { ec_min: 1.2, ec_max: 1.8, ph_min: 6.0, ph_max: 7.0 }
        },
        temp: { min: 15, optimal: 20, max: 24 }, // Bolting risk > 24
        light: { dli_min: 12, dli_max: 17 },
        season: 'cool',
        notes: "Sensitive to heat (Bolting). Keep water cool.",
        common_issues: ['Tip Burn', 'Bolting', 'Root Rot']
    },
    'spinach': {
        name: 'Spinach',
        type: 'Leafy',
        variety: 'Savoy / Smooth',
        growth_days: 40,
        stages: {
            'all': { ec_min: 1.8, ec_max: 2.3, ph_min: 6.0, ph_max: 7.0 }
        },
        temp: { min: 10, optimal: 18, max: 23 },
        light: { dli_min: 10, dli_max: 15 },
        season: 'cool',
        notes: "Very sensitive to heat. Pythium risk high > 25°C.",
        common_issues: ['Pythium (Root Rot)', 'Yellowing (Iron deficiency)']
    },
    'kale': {
        name: 'Kale',
        type: 'Leafy',
        variety: 'Curly / Lacinato',
        growth_days: 60,
        stages: {
            'all': { ec_min: 1.8, ec_max: 2.5, ph_min: 6.0, ph_max: 7.0 }
        },
        temp: { min: 15, optimal: 22, max: 28 }, // Hardier
        light: { dli_min: 15, dli_max: 20 },
        season: 'versatile',
        notes: "Heavy feeder. Calcium hungry.",
        common_issues: ['Aphids', 'Calcium Deficiency']
    },
    'asian_greens': {
        name: 'Asian Greens (Bok Choy)',
        type: 'Leafy',
        variety: 'Pak Choi / Tatsoi',
        growth_days: 35,
        stages: {
            'all': { ec_min: 1.5, ec_max: 2.0, ph_min: 6.0, ph_max: 6.5 }
        },
        temp: { min: 18, optimal: 24, max: 30 },
        light: { dli_min: 12, dli_max: 18 },
        season: 'warm',
        notes: "Fast grower. Harvest early for tender leaves.",
        common_issues: ['Bolting', 'Flea Beetles']
    },

    // ==========================================
    // CATEGORY B: HERBS (High Flavor, Perennial-ish)
    // ==========================================
    'basil': {
        name: 'Basil',
        type: 'Herb',
        variety: 'Genovese / Thai',
        growth_days: 60, // Cut and come again
        stages: {
            'all': { ec_min: 1.0, ec_max: 1.6, ph_min: 5.5, ph_max: 6.5 }
        },
        temp: { min: 20, optimal: 26, max: 32 }, // Loves heat
        light: { dli_min: 15, dli_max: 25 },
        season: 'warm',
        notes: "Loves heat. Hate cold (<10°C kills it).",
        common_issues: ['Fusarium Wilt', 'Downy Mildew', 'Cold Stress']
    },
    'mint': {
        name: 'Mint',
        type: 'Herb',
        variety: 'Peppermint / Spearmint',
        growth_days: 90,
        stages: {
            'all': { ec_min: 2.0, ec_max: 2.4, ph_min: 5.5, ph_max: 6.0 }
        },
        temp: { min: 15, optimal: 22, max: 28 },
        light: { dli_min: 12, dli_max: 18 },
        season: 'versatile',
        notes: "Invasive roots (Keep in separate tank). Thirsty.",
        common_issues: ['Rust', 'Spider Mites']
    },
    'cilantro': {
        name: 'Cilantro (Coriander)',
        type: 'Herb',
        growth_days: 45,
        stages: {
            'all': { ec_min: 1.6, ec_max: 1.8, ph_min: 6.5, ph_max: 6.7 } // Higher pH preference
        },
        temp: { min: 15, optimal: 20, max: 24 }, // Bolts easily
        light: { dli_min: 12, dli_max: 17 },
        season: 'cool',
        notes: "Bolts very fast in heat. Use slow-bolt seeds.",
        common_issues: ['Bolting', 'Aphids']
    },

    // ==========================================
    // CATEGORY C: FRUITING (Phase Dependent)
    // ==========================================
    'tomato': {
        name: 'Tomato',
        type: 'Fruiting',
        variety: 'Cherry / Vine',
        growth_days: 90,
        stages: {
            'Vegetative': { ec_min: 2.0, ec_max: 2.5, ph_min: 6.0, ph_max: 6.5, ratio: 'High N' },
            'Flowering': { ec_min: 2.5, ec_max: 4.0, ph_min: 6.0, ph_max: 6.5, ratio: 'High K' }
        },
        temp: { min: 18, optimal: 25, max: 30 },
        light: { dli_min: 25, dli_max: 35 }, // High light need
        season: 'warm',
        notes: "Heavy feeder. Needs trellis support.",
        common_issues: ['Blossom End Rot', 'Early Blight', 'Hornworms']
    },
    'pepper': {
        name: 'Peppers (Exotic)',
        type: 'Fruiting',
        variety: 'Bell / Habanero / Jalapeno',
        growth_days: 100,
        stages: {
            'Vegetative': { ec_min: 1.5, ec_max: 2.0, ph_min: 5.5, ph_max: 6.0 },
            'Flowering': { ec_min: 2.0, ec_max: 2.8, ph_min: 6.0, ph_max: 6.5 }
        },
        temp: { min: 20, optimal: 26, max: 32 }, // Loves heat
        light: { dli_min: 20, dli_max: 30 },
        season: 'warm',
        notes: "Slow starter. Don't overwater young plants.",
        common_issues: ['Blossom Drop', 'Aphids']
    },
    'strawberry': {
        name: 'Strawberry',
        type: 'Fruiting',
        variety: 'Albion / Chandler',
        growth_days: 60,
        stages: {
            'Vegetative': { ec_min: 0.8, ec_max: 1.2, ph_min: 5.8, ph_max: 6.2 },
            'Flowering': { ec_min: 1.2, ec_max: 1.8, ph_min: 6.0, ph_max: 6.5 } // Strange: pH goes up slightly for sweetness
        },
        temp: { min: 10, optimal: 20, max: 26 },
        light: { dli_min: 15, dli_max: 25 },
        season: 'cool',
        notes: "Crown root must not be submerged. Sensitive to salt.",
        common_issues: ['Crown Rot', 'Spider Mites', 'Powdery Mildew']
    },
    'cucumber': {
        name: 'Cucumber',
        type: 'Fruiting',
        variety: 'English / Persian',
        growth_days: 60, // Fast
        stages: {
            'Vegetative': { ec_min: 1.7, ec_max: 2.0, ph_min: 5.5, ph_max: 6.0 },
            'Flowering': { ec_min: 2.0, ec_max: 2.5, ph_min: 5.5, ph_max: 6.0 }
        },
        temp: { min: 22, optimal: 26, max: 30 },
        light: { dli_min: 20, dli_max: 30 },
        season: 'warm',
        notes: "Drink water like crazy. Check drink levels daily.",
        common_issues: ['Powdery Mildew', 'Beetles']
    }
};

export const SYSTEM_TYPES = {
    'NFT': {
        label: 'NFT (Nutrient Film)',
        risk: 'Pump Failure',
        task: 'Check Flow Rate',
        best_for: ['Leafy', 'Herb'],
        avoid: ['Fruiting'],
        tip: "Best for lightweight plants like Lettuce & Spinach. Avoid Tomatoes (roots block pipes)."
    },
    'DWC': {
        label: 'DWC (Deep Water)',
        risk: 'Root Rot',
        task: 'Check Air Stones',
        best_for: ['Leafy', 'Herb'],
        avoid: ['Fruiting'], // Technically possible but hard for beginners due to weight
        tip: "Great for Lettuce & Basil. Needs 24/7 air bubbles. Avoid heavy plants."
    },
    'Drip': {
        label: 'Drip System (Bucket)',
        risk: 'Clogging',
        task: 'Check Drippers',
        best_for: ['Fruiting'],
        avoid: ['Leafy'],
        tip: "Standard for heavy feeders like Tomatoes & Peppers. Use Cocopeat."
    },
    'Ebb': {
        label: 'Ebb & Flow',
        risk: 'Timer Failure',
        task: 'Check Flood Level',
        best_for: ['Leafy', 'Herb', 'Root'], // If we had root veggies
        avoid: [],
        tip: "Versatile. Good for root veggies or mixed setups."
    }
};

export const getCropParams = (cropId, stage = 'all') => {
    const crop = CROP_LIBRARY[cropId?.toLowerCase()];
    if (!crop) return null;

    // Handle fruiting stages, default to vegetative if not found or 'all'
    const targetStage = (crop.type === 'Fruiting' && stage !== 'all') ? stage :
        (crop.stages['all'] ? 'all' : 'Vegetative');

    return {
        ...crop.stages[targetStage],
        temp: crop.temp,
        name: crop.name,
        type: crop.type
    };
};
