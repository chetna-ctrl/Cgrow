/**
 * Comprehensive Crop Database
 * Contains real agricultural data for microgreens and hydroponics crops
 */

export const CROP_DATABASE = {
    // ========== MICROGREENS ==========
    'Radish (Mooli)': {
        type: 'microgreens',
        days_to_maturity: 7,
        ideal_conditions: {
            ph: [5.5, 6.5],
            ec: [1.2, 1.8],
            temp: [18, 24], // Celsius
            humidity: [40, 60] // Percentage
        },
        yield: {
            avg_per_tray: 150, // grams
            min_per_tray: 100,
            max_per_tray: 200
        },
        market: {
            price_range: [150, 200], // ₹/kg
            avg_price: 180,
            demand: 'high'
        },
        quality_grades: {
            'A': { min_yield: 140, color: 'bright green', texture: 'crisp' },
            'B': { min_yield: 100, color: 'green', texture: 'good' },
            'C': { min_yield: 60, color: 'pale green', texture: 'soft' }
        },
        growing_tips: 'Keep moist, harvest when 2-3 inches tall'
    },

    'Fenugreek (Methi)': {
        type: 'microgreens',
        days_to_maturity: 10,
        ideal_conditions: {
            ph: [6.0, 7.0],
            ec: [1.0, 1.6],
            temp: [20, 25],
            humidity: [50, 70]
        },
        yield: {
            avg_per_tray: 120,
            min_per_tray: 80,
            max_per_tray: 160
        },
        market: {
            price_range: [180, 220],
            avg_price: 200,
            demand: 'high'
        },
        quality_grades: {
            'A': { min_yield: 120, color: 'dark green', texture: 'tender' },
            'B': { min_yield: 90, color: 'green', texture: 'good' },
            'C': { min_yield: 60, color: 'light green', texture: 'tough' }
        },
        growing_tips: 'Soak seeds 8 hours before sowing'
    },

    'Mustard (Sarson)': {
        type: 'microgreens',
        days_to_maturity: 8,
        ideal_conditions: {
            ph: [5.5, 6.5],
            ec: [1.2, 1.8],
            temp: [18, 22],
            humidity: [40, 60]
        },
        yield: {
            avg_per_tray: 140,
            min_per_tray: 100,
            max_per_tray: 180
        },
        market: {
            price_range: [140, 180],
            avg_price: 160,
            demand: 'medium'
        },
        quality_grades: {
            'A': { min_yield: 130, color: 'vibrant green', texture: 'crisp' },
            'B': { min_yield: 100, color: 'green', texture: 'good' },
            'C': { min_yield: 70, color: 'yellow-green', texture: 'wilted' }
        },
        growing_tips: 'Fast growing, harvest early for best flavor'
    },

    'Coriander (Dhania)': {
        type: 'microgreens',
        days_to_maturity: 12,
        ideal_conditions: {
            ph: [6.0, 7.0],
            ec: [1.4, 2.0],
            temp: [20, 25],
            humidity: [50, 70]
        },
        yield: {
            avg_per_tray: 110,
            min_per_tray: 80,
            max_per_tray: 150
        },
        market: {
            price_range: [200, 250],
            avg_price: 220,
            demand: 'very high'
        },
        quality_grades: {
            'A': { min_yield: 110, color: 'bright green', aroma: 'strong' },
            'B': { min_yield: 85, color: 'green', aroma: 'moderate' },
            'C': { min_yield: 60, color: 'pale', aroma: 'weak' }
        },
        growing_tips: 'Crush seeds before sowing for better germination'
    },

    'Lettuce': {
        type: 'hydroponics',
        days_to_maturity: 30,
        ideal_conditions: {
            ph: [5.8, 6.2],
            ec: [1.0, 1.5],
            temp: [18, 22],
            water_temp: [18, 21]
        },
        yield: {
            avg_per_system: 2.5, // kg
            min_per_system: 1.8,
            max_per_system: 3.2
        },
        market: {
            price_range: [180, 250],
            avg_price: 200,
            demand: 'very high'
        },
        quality_grades: {
            'A': { min_yield: 2.3, firmness: 'crisp', color: 'bright' },
            'B': { min_yield: 1.8, firmness: 'good', color: 'green' },
            'C': { min_yield: 1.3, firmness: 'soft', color: 'pale' }
        },
        growing_tips: 'Change nutrient solution weekly'
    },

    'Tomato': {
        type: 'hydroponics',
        days_to_maturity: 60,
        ideal_conditions: {
            ph: [6.0, 6.5],
            ec: [2.0, 3.5],
            temp: [22, 28],
            water_temp: [20, 24]
        },
        yield: {
            avg_per_system: 5.0, // kg
            min_per_system: 3.5,
            max_per_system: 7.0
        },
        market: {
            price_range: [60, 100],
            avg_price: 80,
            demand: 'very high'
        },
        quality_grades: {
            'A': { min_yield: 4.5, firmness: 'firm', color: 'deep red' },
            'B': { min_yield: 3.5, firmness: 'good', color: 'red' },
            'C': { min_yield: 2.5, firmness: 'soft', color: 'light red' }
        },
        growing_tips: 'Requires support, prune regularly'
    },

    'Basil (Tulsi)': {
        type: 'hydroponics',
        days_to_maturity: 25,
        ideal_conditions: {
            ph: [5.5, 6.5],
            ec: [1.0, 1.6],
            temp: [20, 25],
            water_temp: [20, 23]
        },
        yield: {
            avg_per_system: 3.0, // kg
            min_per_system: 2.0,
            max_per_system: 4.0
        },
        market: {
            price_range: [250, 400],
            avg_price: 300,
            demand: 'medium'
        },
        quality_grades: {
            'A': { min_yield: 2.8, color: 'deep green', aroma: 'strong' },
            'B': { min_yield: 2.0, color: 'green', aroma: 'moderate' },
            'C': { min_yield: 1.5, color: 'pale', aroma: 'weak' }
        },
        growing_tips: 'Keep dry, avoid humidity on leaves'
    },

    'Spinach (Palak)': {
        type: 'hydroponics',
        days_to_maturity: 40,
        ideal_conditions: {
            ph: [6.0, 7.0],
            ec: [1.8, 2.3],
            temp: [15, 22],
            water_temp: [18, 20]
        },
        yield: {
            avg_per_system: 2.5, // kg
            min_per_system: 1.5,
            max_per_system: 3.5
        },
        market: {
            price_range: [60, 100],
            avg_price: 80,
            demand: 'high'
        },
        quality_grades: {
            'A': { min_yield: 2.2, color: 'dark green', texture: 'tender' },
            'B': { min_yield: 1.5, color: 'green', texture: 'good' },
            'C': { min_yield: 1.0, color: 'light green', texture: 'tough' }
        },
        growing_tips: 'Cool temperatures prevent bolting'
    }
};

// Helper functions
export const getCropData = (cropName) => {
    return CROP_DATABASE[cropName] || null;
};

export const getDaysToMaturity = (cropName) => {
    const crop = getCropData(cropName);
    return crop ? crop.days_to_maturity : 7; // Default 7 days
};

export const getAveragePrice = (cropName) => {
    const crop = getCropData(cropName);
    return crop ? crop.market.avg_price : 180; // Default ₹180/kg
};

export const getAverageYield = (cropName, quantity = 1) => {
    const crop = getCropData(cropName);
    if (!crop) return 100; // Default 100g

    if (crop.type === 'microgreens') {
        return crop.yield.avg_per_tray * quantity; // grams
    } else {
        return crop.yield.avg_per_system * quantity * 1000; // Convert kg to grams
    }
};

export const getIdealConditions = (cropName) => {
    const crop = getCropData(cropName);
    return crop ? crop.ideal_conditions : {
        ph: [6.0, 7.0],
        ec: [1.2, 1.8],
        temp: [20, 25]
    };
};
