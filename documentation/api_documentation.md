# WorkSense AI — REST API Documentation

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@worksense.ai",
    "password": "AdminPassword123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@worksense.ai",
      "role": "admin",
      "developer_id": null
    }
  }
  ```

### `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:** User identity, active role, and associated profile.

---

## 2. Workload & Intelligence Endpoints

### `GET /api/workload/overview`
Returns global engineering metrics, team variance, overloaded count, balanced count, underutilized count, and imbalance explanations.

### `GET /api/workload/developers`
Returns list of all active developers with remaining hours, weighted effort, capacity, utilization %, and normalized score.

### `GET /api/workload/developers/{id}`
Returns deep-dive breakdown of a developer's active tasks, logged hours, and deadline risks.

### `POST /api/workload/recalculate`
Forces a global recomputation of all remaining hours, updates utilization metrics, and records a snapshot in `workload_history`.

---

## 3. AI Task Redistribution Endpoints

### `GET /api/recommendations`
Lists all task redistribution recommendations with status filter (`pending`, `approved`, `rejected`).

### `POST /api/recommendations/generate`
Scans for overloaded developers ($\ge 80\%$) and generates skill-matched redistribution proposals.

### `POST /api/recommendations/{id}/approve`
**Role:** Admin, Project Manager  
Applies approved reassignment in `task_assignments`, sets status to `approved`, and triggers real-time workload recalculation for both developers.

### `POST /api/recommendations/{id}/reject`
**Role:** Admin, Project Manager  
Marks recommendation as `rejected` without modifying active assignments.

---

## 4. Machine Learning Endpoints

### `POST /api/ml/predict-effort`
- **Request Body:**
  ```json
  {
    "complexity": "hard",
    "priority": "high",
    "estimated_hours": 12.0,
    "dev_experience": "mid",
    "required_skills_count": 2,
    "avg_skill_proficiency": 3.5
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "estimated_hours": 12.0,
    "predicted_actual_hours": 14.8,
    "variance_hours": 2.8,
    "confidence_interval_hours": [13.0, 16.6],
    "risk_level": "moderate"
  }
  ```

### `GET /api/ml/model-status`
Returns Random Forest and Isolation Forest metadata, training date, sample count, and validation metrics (MAE, RMSE, R²).

### `POST /api/ml/detect-anomaly`
Evaluates multi-dimensional developer workload telemetry using Isolation Forest to identify outlier fatigue patterns.
