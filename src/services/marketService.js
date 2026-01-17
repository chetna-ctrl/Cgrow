/**
 * Market Intelligence Service
 * Fetches real-time commodity prices for Indian Mandis
 * Source: data.gov.in (Agmarknet)
 */

const API_ENDPOINT = 'https://api.data.gov.in/resource/9ef27131-652a-4a3a-813b-1bc8afcc60c1'; // Example Agmarknet Resource
const API_KEY = process.env.REACT_APP_DATA_GOV_IN_KEY;

// Market Fallbacks (In case API is throttled or key missing)
const MARKET_FALLBACKS = {
    'Radish': { modal_price: 1800, state: 'Delhi', unit: 'Quintal' },
    'Tomato': { modal_price: 2500, state: 'Maharashtra', unit: 'Quintal' },
    'Lettuce': { modal_price: 3500, state: 'Karnataka', unit: 'Quintal' },
    'Basil': { modal_price: 4500, state: 'Maharashtra', unit: 'Quintal' },
    'Spinach': { modal_price: 1500, state: 'Delhi', unit: 'Quintal' },
    'Coriander': { modal_price: 3000, state: 'Gujarat', unit: 'Quintal' },
    'Mustard': { modal_price: 5500, state: 'Rajasthan', unit: 'Quintal' },
    'Fenugreek': { modal_price: 4000, state: 'Gujarat', unit: 'Quintal' }
};

export const fetchMarketPrice = async (crop) => {
    try {
        if (!API_KEY) throw new Error("API Key Missing");

        const url = `${API_ENDPOINT}?api-key=${API_KEY}&format=json&filters[commodity]=${crop}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        if (data.records && data.records.length > 0) {
            const record = data.records[0];

            // CRITICAL: Verify actual API response format before production
            // Assumption: API returns price in ₹/Quintal (1 Quintal = 100 kg)
            // If API already returns ₹/kg, remove the /100 divisor
            return {
                pricePerKg: parseFloat(record.modal_price) / 100, // Convert Quintal to Kg
                market: record.market,
                state: record.state,
                isLive: true
            };
        }
        throw new Error("No records found");
    } catch (error) {
        // Return intelligence-based fallback
        const fallback = MARKET_FALLBACKS[crop] || MARKET_FALLBACKS['Radish'];
        console.log(`Using market fallback for ${crop}`);
        return {
            pricePerKg: fallback.modal_price / 100,
            market: 'Intelligence Estimate',
            state: fallback.state,
            isLive: false
        };
    }
};

/**
 * Get Market Trends (Simulated based on seasonal logic if API fails)
 */
export const getMarketTrend = (crop) => {
    const month = new Date().getMonth();
    // Simple logic: Green leafy vegetables are cheaper in winter (Nov-Feb in India)
    const isWinter = month >= 10 || month <= 1;
    const winterCrops = ['Spinach', 'Fenugreek', 'Mustard', 'Coriander', 'Radish'];

    if (winterCrops.includes(crop)) {
        return isWinter ? 'Down' : 'Up';
    }
    return 'Stable';
};
