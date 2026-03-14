/**
 * Synthetic Data Generator for Agricultural AI Training
 * Generates realistic time-series data for crops with advanced metrics.
 */

const CROPS = {
  'Radish': { cycle: 7, baseYield: 120, tempRange: [18, 24], humidityRange: [60, 75] },
  'Broccoli': { cycle: 10, baseYield: 150, tempRange: [20, 26], humidityRange: [65, 80] },
  'Sunflower': { cycle: 8, baseYield: 200, tempRange: [22, 28], humidityRange: [50, 70] },
  'Basil': { cycle: 14, baseYield: 100, tempRange: [21, 27], humidityRange: [70, 85] }
};

/**
 * Generates a synthetic log for a specific day in a crop's life
 */
export const generateDailyLog = (cropName, dayOfLife, baseDate = new Date()) => {
  const crop = CROPS[cropName] || CROPS['Radish'];
  const timestamp = new Date(baseDate);
  timestamp.setDate(baseDate.getDate() + dayOfLife);

  // 1. Simulate Environment (Sine waves + Noise)
  const hourFactor = Math.sin((dayOfLife * 24) * (Math.PI / 12));
  const temp = (crop.tempRange[0] + (crop.tempRange[1] - crop.tempRange[0]) / 2) + (hourFactor * 3) + (Math.random() * 2 - 1);
  const humidity = (crop.humidityRange[0] + (crop.humidityRange[1] - crop.humidityRange[0]) / 2) - (hourFactor * 5) + (Math.random() * 5 - 2.5);

  // 2. Simulate Growth (Logarithmic Curve)
  // Growth pct = log(day + 1) / log(cycle + 1)
  const growthPct = Math.log(dayOfLife + 1) / Math.log(crop.cycle + 1);
  const biomass = (crop.baseYield * growthPct) * (1 + (Math.random() * 0.1 - 0.05));
  const canopyCoverage = Math.min(100, growthPct * 110 + (Math.random() * 5));

  // 3. Advanced Sci-Columns
  const co2 = 400 + (Math.random() * 200) + (dayOfLife * 10); // Enrichment simulation
  const leafColorIndex = growthPct < 0.2 ? 0.3 : (0.7 + (Math.random() * 0.2)); // NDVI proxy
  const spectrum = dayOfLife < 3 ? 'BLUE_HEAVY' : 'FULL_SPECTRUM';
  
  // 4. Labels for ML
  let riskLabel = 'LOW_RISK';
  if (temp > 28 && humidity > 80) riskLabel = 'MOLD_RISK';
  else if (humidity < 40) riskLabel = 'DEHYDRATION_RISK';

  return {
    timestamp: timestamp.toISOString(),
    day_of_life: dayOfLife,
    crop: cropName,
    temp_c: temp.toFixed(1),
    humidity_pct: humidity.toFixed(1),
    biomass_weight_g: biomass.toFixed(2),
    canopy_coverage_pct: canopyCoverage.toFixed(1),
    co2_ppm: Math.round(co2),
    leaf_color_index: leafColorIndex.toFixed(2),
    light_spectrum: spectrum,
    target_yield_prediction_kg: (biomass / 1000 * 1.2).toFixed(3), // Label for future regression
    risk_label: riskLabel
  };
};

/**
 * Generates a full batch (multiple days) of synthetic data
 */
export const generateSyntheticBatch = (cropName, days = 30) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i <= days; i++) {
    data.push(generateDailyLog(cropName, i, startDate));
  }
  return data;
};

/**
 * Merges real farm logs with synthetic data to create a balanced 80/20 dataset.
 * @param {Array} realLogs - Array of logs from Supabase
 * @param {string} cropName - Crop to simulate for synthetic part
 * @param {number} totalRows - Desired total rows
 */
export const mergeWithRealData = (realLogs, cropName, totalRows = 100) => {
  // 1. Map real logs to the common AI schema
  const formattedReal = realLogs.map(log => ({
    timestamp: log.created_at,
    day_of_life: 'REAL_LOG',
    crop: log.crop || cropName,
    temp_c: log.temp || 24,
    humidity_pct: log.humidity || 60,
    biomass_weight_g: log.details?.biomass || (Math.random() * 50).toFixed(2),
    canopy_coverage_pct: log.details?.canopy || (Math.random() * 30).toFixed(1),
    co2_ppm: log.details?.co2 || 400,
    leaf_color_index: log.details?.ndvi || 0.6,
    light_spectrum: log.details?.spectrum || 'NATURAL',
    target_yield_prediction_kg: 'N/A', // Real data marks the baseline
    risk_label: log.visual_check ? log.visual_check.toUpperCase() : 'VERIFIED_REAL'
  }));

  // 2. Calculate counts for 80/20 ratio
  // If we have enough real logs, we use the ratio. Otherwise, we use all available real logs.
  const targetRealCount = Math.floor(totalRows * 0.2);
  const finalReal = formattedReal.slice(0, targetRealCount);
  
  // 3. Generate synthetic logs to fill the rest (80%)
  const syntheticCount = totalRows - finalReal.length;
  const finalSynthetic = generateSyntheticBatch(cropName, syntheticCount);

  // 4. Shuffle and return
  return [...finalReal, ...finalSynthetic].sort(() => Math.random() - 0.5);
};

/**
 * Converts array of objects to CSV string
 */
export const convertToCSV = (data) => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${val}"`).join(',')
  ).join('\n');
  return `${headers}\n${rows}`;
};

/**
 * Triggers a browser download of the CSV
 */
export const downloadCSV = (csvContent, fileName = 'cgrow_synthetic_training_data.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
