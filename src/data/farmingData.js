export const farmingTypes = [
    { id: 'organic', name: 'Organic Farming' },
    { id: 'hydroponic', name: 'Hydroponic System' },
    { id: 'conventional', name: 'Conventional Farming' },
    { id: 'microgreens', name: 'Microgreen Farming' },
    { id: 'vertical', name: 'Vertical Farming' },
    { id: 'aquaponics', name: 'Aquaponics' },
];

export const cropsByType = {
    organic: [
        { id: 'organic_wheat', name: 'Organic Wheat' },
        { id: 'organic_corn', name: 'Organic Corn' },
        { id: 'organic_soy', name: 'Organic Soybeans' },
    ],
    hydroponic: [
        { id: 'lettuce', name: 'Lettuce' },
        { id: 'tomatoes', name: 'Cherry Tomatoes' },
        { id: 'strawberries', name: 'Strawberries' },
        { id: 'herbs', name: 'Mixed Herbs' },
    ],
    conventional: [
        { id: 'wheat', name: 'Wheat' },
        { id: 'rice', name: 'Rice' },
        { id: 'cotton', name: 'Cotton' },
        { id: 'sugarcane', name: 'Sugarcane' },
    ],
    microgreens: [
        { id: 'sunflower_shoots', name: 'Sunflower Shoots' },
        { id: 'pea_shoots', name: 'Pea Shoots' },
        { id: 'radish_micro', name: 'Radish Microgreens' },
        { id: 'broccoli_micro', name: 'Broccoli Microgreens' },
    ],
    vertical: [
        { id: 'kale_vert', name: 'Kale' },
        { id: 'basil_vert', name: 'Basil' },
        { id: 'bok_choy', name: 'Bok Choy' },
        { id: 'arugula', name: 'Arugula' },
    ],
    aquaponics: [
        { id: 'tilapia_lettuce', name: 'Tilapia & Lettuce' },
        { id: 'trout_basil', name: 'Trout & Basil' },
        { id: 'catfish_mint', name: 'Catfish & Mint' },
    ]
};

export const requirementsData = {
    organic_wheat: {
        maintenance: [
            'Apply organic compost',
            'Mechanical weed control',
            'Monitor for pests bi-weekly',
            'Irrigation scheduling',
        ],
        equipment: [
            'Tractor with plow',
            'Seed drill',
            'Combine harvester',
            'Storage bins',
        ],
        environmentalFactors: {
            ph: '6.0 - 7.0',
            water: 'Regular irrigation needed',
            light: 'Full Sun',
            sensors: ['Soil Moisture', 'Rain Gauge'],
            other: 'Drought tolerant once established'
        }
    },
    organic_corn: {
        maintenance: [
            'Harrowing for weed control',
            'Side-dressing with manure',
            'Scout for corn borer',
        ],
        equipment: [
            'Planter',
            'Cultivator',
            'Corn header for combine',
        ],
        environmentalFactors: {
            ph: '5.8 - 7.0',
            water: 'High water requirement',
            light: 'Full Sun',
            sensors: ['Soil Moisture', 'Nitrogen Sensor'],
            other: 'Sensitive to frost'
        }
    },
    microgreens: {
        maintenance: [
            'Daily misting (morning & evening)',
            'Check tray humidity',
            'Ensure dark period (blackout)',
            'Harvest at first true leaf',
        ],
        equipment: [
            'Shallow Trays (10x20)',
            'Coco Coir or Soil Medium',
            'Spray Bottle/Mister',
            'Grow Lights (T5 or LED)',
            'Blackout Domes',
        ],
        environmentalFactors: {
            ph: '6.0 - 6.5',
            water: 'Mist twice daily',
            light: '12-16 hours (after blackout)',
            sensors: ['Humidity/Temp Genus'],
            other: 'Keep temperature 20-24°C'
        }
    },
    vertical: {
        maintenance: [
            'Check nutrient delivery lines',
            'Monitor LED light distance',
            'Prune for airflow',
            'Check reservoir temperature',
        ],
        equipment: [
            'Vertical Towers/Racks',
            'LED Grow Strips',
            'Nutrient Reservoir',
            'Automated Timer',
            'Air Circulation Fans',
        ],
        environmentalFactors: {
            ph: '5.5 - 6.5',
            water: 'Continuous Drip/Flood',
            light: '16-18 hours LED',
            sensors: ['pH Probe', 'EC Sensor', 'Water Temp'],
            other: 'Maintain airflow to prevent mold'
        }
    },
    aquaponics: {
        maintenance: [
            'Feed fish (measure ratio)',
            'Test Ammonia/Nitrite/Nitrate daily',
            'Check solids filter',
            'Monitor water temperature',
        ],
        equipment: [
            'Fish Tank (50+ Gallons)',
            'Grow Bed with Media',
            'Water Pump & Piping',
            'Air Pump & Stones',
            'Water Test Kit (API Master)',
        ],
        environmentalFactors: {
            ph: '6.8 - 7.0 (Compromise)',
            water: 'Recirculating System',
            light: 'Natural or Supplements',
            sensors: ['Dissolved Oxygen', 'Water Temp', 'pH'],
            other: 'Keep tank covered to prevent algae'
        }
    },
    hydroponic: {
        maintenance: [
            'Check pH levels daily',
            'Monitor nutrient solution EC',
            'Clean filters and pumps',
            'Inspect root health',
        ],
        equipment: [
            'pH Meter',
            'EC Meter',
            'Water Pump',
            'Grow Lights (LED)',
            'Reservoir Tank',
        ],
        environmentalFactors: {
            ph: '5.5 - 6.0',
            water: 'Dependent on system type',
            light: '14-16 hours',
            sensors: ['EC Meter', 'pH Meter', 'Lux Meter'],
            other: 'Oxygenate reservoir'
        }
    },
    conventional: {
        maintenance: [
            'Soil testing',
            'Fertilizer application',
            'Pest control spraying',
            'Irrigation'
        ],
        equipment: [
            'Tractor',
            'Sprayer',
            'Harvester'
        ],
        environmentalFactors: {
            ph: '6.0 - 7.5',
            water: 'Rainfed / Supplemental',
            light: 'Full Sun',
            sensors: ['General Weather Station'],
            other: 'Follow local almanac'
        }
    }
};

export const getRequirements = (typeId, cropId) => {
    if (requirementsData[cropId]) return requirementsData[cropId];
    if (requirementsData[typeId]) return requirementsData[typeId];
    return requirementsData['conventional'];
};
