# 🤖 ML Training Guide for Agri-OS

Agri-OS is designed to be "AI-Ready". To train Machine Learning models (like Yield Prediction or Disease Detection), you need to combine **Environmental Features** with **Harvest Outcomes**.

## 📊 1. Required Dataset Structure

For a high-quality ML model, your dataset should be a CSV or JSON file containing a join between your daily logs and harvest results.

### **Core Features (The "X" inputs)**
These are recorded daily in the `daily_logs` table:
- **Climate**: `temp` (Air Temperature), `humidity`, `vpd_kpa` (Vapor Pressure Deficit).
- **Water (Hydroponics)**: `ph`, `ec`, `water_temp`.
- **Lighting**: `dli_mol_per_m2` (Daily Light Integral), `light_hours_per_day`.
- **Biological**: `gdd_daily` (Growing Degree Days), `health_score`.

### **Target Labels (The "Y" outcome)**
These are found in `harvest_records` or `batches`:
- **Yield**: `yield_grams` or `yield_kg`.
- **Quality**: `quality_grade` (A, B, or C).
- **Cycle Time**: `days_to_harvest` (Calculated as `harvest_date` - `sow_date`).

---

## 📂 2. How to get the Dataset

### **Option A: Export from Dashboard (Easiest)**
1. Go to the **Daily Tracker** page.
2. Click the **"Export CSV"** button.
3. This will generate a cleaned file named `cGrow_Daily_Report_YYYY-MM-DD.csv`.
4. Use this file directly in Python (Pandas) or Excel.

### **Option B: Direct Supabase Query**
If you have access to the SQL Editor, run this to get a training-ready view:
```sql
SELECT 
    l.created_at,
    l.batch_id,
    l.temp,
    l.humidity,
    l.vpd_kpa,
    l.ph,
    l.ec,
    l.dli_mol_per_m2,
    l.health_score,
    b.crop,
    b.yield_grams as label_yield
FROM daily_logs l
JOIN batches b ON l.batch_id = b.id
WHERE b.status = 'Harvested';
```

---

## 🧠 3. Example ML Use Cases

| ML Model | Goal | Inputs (Features) | Output (Label) |
| :--- | :--- | :--- | :--- |
| **Yield Predictor** | Predict harvest weight | GDD, DLI, Average EC | Expected Grams |
| **Health Monitor** | Early disease warning | VPD Trends, pH swings | Health Score |
| **Harvest Timer** | Best day to cut | Cumulative GDD, Crop Type | Ready (Yes/No) |

---

## 🛠️ 4. Files involved in ML Logic
- `src/features/tracker/hooks/useCSVExport.js`: Logic behind the data export.
- `src/utils/agriUtils.js`: Scientific formulas for VPD, GDD, and DLI.
- `cgrowml.ipynb`: The primary research notebook for training models.

---

## 🔬 5. Insights from `cgrowml.ipynb`

Our research notebook uses a **Decision Tree** model trained on 2,000 rows of synthetic Delhi-specific data.

### **Research Data Features**
- **Delhi Weather Logic**: Simulates peak summer (36-48°C), monsoon (70-95% RH), and winter patterns.
- **Specific Crop Logic**: Rules for 11 Microgreens (Radish, Broccoli, etc.) and 11 Hydroponics (Lettuce, Cherry Tomato, etc.).
- **Smart Logic Rules**:
    - **Water Temp Rule**: >26°C triggers "Root Rot Risk".
    - **Monsoon Rule**: >85% Humidity for Microgreens triggers "Mold/Fungal Risk".
    - **VPD Logic**: VPD < 0.4 kPa (stagnant) or > 2.5 kPa (dry) triggers stress alerts.
    - **Heat Stress**: >35°C for sensitive crops (Lettuce, Spinach, Kale) triggers "Bolting Warning".

### **Broadening ML Applications**

You can also apply ML to other areas of the dashboard:

#### **1. Finance AI (ROI & Cost Predictor)**
- **Goal**: Predict the final profit of a batch before it is even harvested.
- **Data Needed**: `health_score` from logs + `cost_ledger` entries + `market_rates`.
- **Model**: Regression model to forecast "Projected Revenue vs. Expenses".

### **Data Collection Strategy for "Real Trust"**

For high-accuracy results, use this hierarchy for your truth-source:

| Data Type | Best For... | Source | Trust Level |
| :--- | :--- | :--- | :--- |
| **Dashboard Export** | Finance/Yield | Agri-OS "Export CSV" | **GOLD** (Real Truth) |
| **Web Scraping** | Market Pricing | Mandi sites, E-commerce | **HIGH** (Real Trends) |
| **Synthetic Data** | Initial Training | Python Scripts | **LOW** (Pattern Testing) |

#### **Recommended Approach (Hybrid)**
1.  **Cold Start**: Use **Synthetic Data** (like your current CSV) to build the Decision Tree logic and UI structure.
2.  **Market Validation**: Add **Web Scraping** scripts to your notebook to pull live Mandi prices (e.g., Agmarket API or CSVs). This ensures your pricing logic is tied to real Delhi markets.
3.  **Accuracy Loop**: Every month, export your **Real Dashboard Data** and retrain the model. This is the only way to get "Real Trust" because it includes your specific farm costs and labor performance.

To update the dashboard with new data, simply run the notebook on a fresh `cGrow_Daily_Report.csv` export.
