import pandas as pd
import numpy as np
import os

def augment_agri_data(input_file, output_file, multiplier=5):
    """
    Augments real agricultural log data by adding controlled Gaussian noise.
    Prevents overfitting by creating realistic edge-case variations.
    """
    print(f"Starting Data Augmentation: {input_file} -> {output_file}")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    df = pd.read_csv(input_file)
    original_rows = len(df)
    augmented_list = [df]

    # Features to apply noise to (Environmental factors)
    noise_features = ['avg_temp_c', 'humidity_pct', 'water_temp_c', 'vpd_kpa', 'ph_level', 'ec_level', 'dissolved_oxygen']

    for i in range(multiplier):
        df_new = df.copy()
        
        # 1. Add Gaussian Noise (slight variations)
        for feature in noise_features:
            if feature in df_new.columns:
                # Standard deviation for noise (e.g., 2% variation)
                std = df[feature].std() * 0.05 if df[feature].std() > 0 else 0.1
                noise = np.random.normal(0, std, size=len(df_new))
                df_new[feature] = df_new[feature] + noise
        
        # 2. Logic Guard: Ensure targets/labels stay the same unless environment drifts too far
        # For this augmentation, we assume slight noise doesn't flip the "is_recommended" flag
        # but we clip values to realistic ranges
        if 'ph_level' in df_new.columns:
            df_new['ph_level'] = df_new['ph_level'].clip(4.0, 9.0)
        if 'humidity_pct' in df_new.columns:
            df_new['humidity_pct'] = df_new['humidity_pct'].clip(10, 99)
            
        augmented_list.append(df_new)

    # Combine and shuffle
    df_final = pd.concat(augmented_list).sample(frac=1).reset_index(drop=True)
    df_final.to_csv(output_file, index=False)
    
    print(f"Success! Expanded {original_rows} rows to {len(df_final)} rows.")
    print(f"Overfitting Guard: Noise added to {len(noise_features)} environmental features.")

if __name__ == "__main__":
    # If user has a real export, use that. Otherwise use the master dataset.
    base_file = "cggrow_master_dataset_v2.csv"
    if os.path.exists("cGrow_Daily_Report.csv"):
        base_file = "cGrow_Daily_Report.csv"
        
    augment_agri_data(base_file, "augmented_agri_dataset.csv")
