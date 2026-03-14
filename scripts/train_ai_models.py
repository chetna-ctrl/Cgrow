import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
import joblib
import json
import os

def train_advanced_models():
    print("Starting Robust AI/ML/DL Training...")
    
    # 1. Load Data (Prefer Augmented > Master)
    data_path = "augmented_agri_dataset.csv"
    if not os.path.exists(data_path):
        data_path = "cggrow_master_dataset_v2.csv"
        print(f"Warning: Augmented data not found, falling back to: {data_path}")
    else:
        print(f"Training with Augmented Dataset: {data_path}")
        
    df = pd.read_csv(data_path)
    
    # 2. Pre-processing
    X = df.drop(['is_recommended', 'risk_factor'], axis=1)
    X = pd.get_dummies(X, columns=['month', 'crop_category', 'crop_name', 'system_type'])
    y = df['is_recommended']
    
    # Hold-out validation set (20% for testing robustness)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. ML Training: Random Forest with Guards
    # min_samples_leaf=5 prevents the tree from creating paths for single outliers
    # max_features='sqrt' ensures diversity across trees
    print("Training Forest (ML) with Memorization Guards...")
    rf_model = RandomForestClassifier(
        n_estimators=100, 
        max_depth=8, 
        min_samples_leaf=5, 
        max_features='sqrt',
        random_state=42
    )
    rf_model.fit(X_train, y_train)
    rf_acc = rf_model.score(X_test, y_test)
    print(f"DONE: RF Robust Accuracy: {rf_acc*100:.2f}%")
    
    # 4. DL Training: ANN with Regularization
    # alpha=0.01 adds L2 regularization to prevent weight explosion
    # early_stopping=True stops training if validation score stops improving
    print("Training Neural Network (DL) with Regularization...")
    dl_model = MLPClassifier(
        hidden_layer_sizes=(64, 32), 
        alpha=0.01, 
        early_stopping=True, 
        validation_fraction=0.1,
        max_iter=1000, 
        random_state=42
    )
    dl_model.fit(X_train, y_train)
    dl_acc = dl_model.score(X_test, y_test)
    print(f"DONE: DL Robust Accuracy: {dl_acc*100:.2f}%")
    
    # 5. Save Models
    joblib.dump(rf_model, 'cggrow_rf_model.pkl')
    joblib.dump(dl_model, 'cggrow_dl_model.pkl')
    
    # 6. Save Model Metadata
    metadata = {
        "last_trained": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ml_accuracy": rf_acc,
        "dl_accuracy": dl_acc,
        "features": list(X.columns),
        "dataset_type": "Augmented" if "augmented" in data_path else "Standard",
        "status": "Ready",
        "engine": "Robust Hybrid Core"
    }
    
    if not os.path.exists('src/data'):
        os.makedirs('src/data')
        
    with open('src/data/ai_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print("Robust Training Cycle Complete!")

if __name__ == "__main__":
    train_advanced_models()
