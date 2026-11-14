import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

DATASET_PATH = "ml/datasets/task_effort_dataset.csv"
MODEL_DIR = "ml/saved_models"
MODEL_PATH = os.path.join(MODEL_DIR, "rf_effort_model.pkl")
ANOMALY_MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest_model.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

def generate_synthetic_dataset(num_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic dataset for task effort prediction modeling.
    Features:
      - complexity_num: easy=1, medium=2, hard=3, critical=4
      - priority_num: low=1, medium=2, high=3, critical=4
      - estimated_hours: 2.0 to 40.0
      - dev_experience_num: junior=1, mid=2, senior=3, lead=4
      - required_skills_count: 1 to 5
      - avg_skill_proficiency: 1.0 to 5.0
    Target:
      - actual_hours: Realistic non-linear effort variation based on complexity, skill mismatch,
        and experience level.
    """
    np.random.seed(random_seed)
    
    complexities = np.random.choice([1, 2, 3, 4], size=num_samples, p=[0.3, 0.4, 0.2, 0.1])
    priorities = np.random.choice([1, 2, 3, 4], size=num_samples, p=[0.2, 0.4, 0.3, 0.1])
    dev_exp = np.random.choice([1, 2, 3, 4], size=num_samples, p=[0.25, 0.45, 0.20, 0.10])
    req_skills = np.random.choice([1, 2, 3, 4, 5], size=num_samples, p=[0.2, 0.4, 0.25, 0.1, 0.05])
    skill_proficiency = np.random.uniform(2.0, 5.0, size=num_samples)
    
    # Base estimated hours tied somewhat to complexity
    base_est = np.random.gamma(shape=complexities * 2.5, scale=2.0) + 2.0
    estimated_hours = np.round(np.clip(base_est, 1.0, 60.0), 1)

    # Actual hours calculation with realistic physics:
    # - Junior devs (exp=1) take ~1.35x longer; senior/lead (exp>=3) take ~0.85x
    exp_factor = 1.6 - (dev_exp * 0.18)
    # - Higher complexity tasks have higher variance and risk of scope creep
    complexity_risk = 1.0 + (complexities * 0.12)
    # - Skill mismatch penalty
    skill_match_factor = 1.3 - (skill_proficiency / 5.0 * 0.4)
    # - Random noise (developer interruptions, review cycles)
    noise = np.random.normal(loc=0.0, scale=0.15, size=num_samples)

    actual_multiplier = np.clip(exp_factor * complexity_risk * skill_match_factor + noise, 0.5, 3.0)
    actual_hours = np.round(np.clip(estimated_hours * actual_multiplier, 0.5, 90.0), 1)

    df = pd.DataFrame({
        "complexity_num": complexities,
        "priority_num": priorities,
        "estimated_hours": estimated_hours,
        "dev_experience_num": dev_exp,
        "required_skills_count": req_skills,
        "avg_skill_proficiency": np.round(skill_proficiency, 2),
        "actual_hours": actual_hours
    })
    return df

def train_and_save_models():
    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Generating training dataset...")
    df = generate_synthetic_dataset(num_samples=2000)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Dataset saved to {DATASET_PATH} ({len(df)} rows)")

    feature_cols = [
        "complexity_num",
        "priority_num",
        "estimated_hours",
        "dev_experience_num",
        "required_skills_count",
        "avg_skill_proficiency"
    ]
    X = df[feature_cols]
    y = df["actual_hours"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Regressor...")
    rf = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    # Evaluate
    y_pred = rf.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2_score = float(rf.score(X_test, y_test))

    print(f"Model Evaluation -> MAE: {mae:.2f} hrs, RMSE: {rmse:.2f} hrs, R²: {r2_score:.3f}")

    joblib.dump(rf, MODEL_PATH)
    print(f"Saved Random Forest model to {MODEL_PATH}")

    # Train Isolation Forest for workload anomaly detection
    # Features: utilization_percentage, weighted_remaining_effort, active_tasks, variance
    print("Training Isolation Forest Anomaly Detector...")
    utilizations = np.random.normal(loc=65.0, scale=25.0, size=1000)
    efforts = np.random.normal(loc=25.0, scale=12.0, size=1000)
    tasks = np.random.poisson(lam=4, size=1000)
    
    # Introduce some synthetic extreme anomalies (over 130% utilization, 80+ hours)
    anomaly_mask = np.random.choice([0, 1], size=1000, p=[0.95, 0.05])
    utilizations[anomaly_mask == 1] += np.random.uniform(50.0, 90.0, size=int(sum(anomaly_mask)))
    efforts[anomaly_mask == 1] += np.random.uniform(30.0, 60.0, size=int(sum(anomaly_mask)))

    X_anomaly = np.column_stack([utilizations, efforts, tasks])
    iso = IsolationForest(contamination=0.06, random_state=42)
    iso.fit(X_anomaly)

    joblib.dump(iso, ANOMALY_MODEL_PATH)
    print(f"Saved Isolation Forest model to {ANOMALY_MODEL_PATH}")

    # Save metadata
    metadata = {
        "model_type": "RandomForestRegressor",
        "features": feature_cols,
        "n_samples": len(df),
        "test_size": 0.2,
        "evaluation_metrics": {
            "mae_hours": round(mae, 2),
            "rmse_hours": round(rmse, 2),
            "r2_score": round(r2_score, 3)
        },
        "is_synthetic": True,
        "disclaimer": (
            "Model is trained on structured task effort distributions for demonstration and prototype evaluation. "
            "Real-world enterprise deployments should fine-tune with at least 90 days of verified team completion logs."
        ),
        "trained_at": pd.Timestamp.now().isoformat()
    }

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved metadata to {METADATA_PATH}")

if __name__ == "__main__":
    train_and_save_models()
