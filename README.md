# WorkSense AI: AI-Based Developer Workload Imbalance Detector

WorkSense AI is an enterprise-grade full-stack web application and intelligence platform designed to eliminate engineering burnout, detect workload skew, predict actual task completion effort using machine learning, and provide automated task redistribution recommendations with human-in-the-loop managerial approval.

---

## 🌟 Key Capabilities

1. **Intelligent Workload Engine**: Calculates remaining effort using non-linear complexity weighting (`Easy=1.0x`, `Medium=1.2x`, `Hard=1.5x`, `Critical=2.0x`) and active time logs.
2. **Dynamic Capacity Utilization**: Differentiates nominal capacity utilization (`Weighted Effort / Weekly Hours * 100`) from normalized workload scores (`0-100`).
3. **Machine Learning Task Effort Prediction**: Trained Random Forest Regressor predicts actual completion hours and risk profiles based on developer experience, task complexity, priority, and skill matrices.
4. **Outlier Anomaly Detection**: Isolation Forest model identifies persistent fatigue and workload concentration anomalies.
5. **Skill-Based Redistribution Recommendations**: Matches overloaded developers with qualified, underutilized candidates having matching skill proficiencies.
6. **Role-Based Access Control (RBAC)**: Distinct permissions and views for **Admin**, **Project Manager**, and **Developer**.
7. **Interactive Dashboard**: Modern Linear-inspired UI built with React 18, Tailwind CSS, Recharts, and Lucide icons.

---

## 🏗️ Technology Stack

- **Frontend**: React.js with Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, Alembic, JWT Authentication (python-jose), Password Hashing (bcrypt/passlib).
- **Database**: PostgreSQL (primary engine) with automatic resilient SQLite fallback for local development.
- **Machine Learning & Analytics**: Scikit-Learn (Random Forest Regressor, Isolation Forest), Pandas, NumPy.
- **Testing**: Pytest with automated calculation edge cases and route coverage.

---

## 🔑 Demo Accounts & Credentials

The database is pre-seeded with realistic demonstration accounts:

| Role | Name | Email | Password | Baseline Status |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | System Administrator | `admin@worksense.ai` | `AdminPassword123!` | System-wide access |
| **Project Manager** | Sarah Connor | `pm@worksense.ai` | `Password123!` | Squad governance & redistribution approval |
| **Developer A** | Alex Rivera | `alex@worksense.ai` | `Password123!` | **Overloaded (92.5% utilization, 37.0 weighted hrs)** |
| **Developer B** | Blake Chen | `blake@worksense.ai` | `Password123!` | **Balanced (45.0% utilization, 18.0 weighted hrs)** |
| **Developer C** | Casey Morgan | `casey@worksense.ai` | `Password123!` | **Underutilized (27.5% utilization, 11.0 weighted hrs)** |
| **Developer D** | Dana Vance | `dana@worksense.ai` | `Password123!` | Lead DevOps Specialist |

---

## 🚀 Quickstart Guide

### 1. Environment Setup
The configuration template is provided in `.env.example`.
```bash
cp .env.example .env
```

### 2. Run Database Migrations & Seed Data
```bash
cd backend
alembic upgrade head
python -m app.database_seed
```

### 3. Retrain / Evaluate Machine Learning Models
```bash
python ml/train_model.py
```
*(Model evaluation metrics: MAE = 1.79 hrs, RMSE = 2.55 hrs, R² = 0.963)*

### 4. Run Automated Backend Tests
```bash
cd backend
python -m pytest tests/test_api_and_engine.py -v
```

### 5. Start the Application

#### Start Backend (FastAPI on Port 8000)
```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Interactive Swagger UI Documentation is live at `http://127.0.0.1:8000/docs`*

#### Start Frontend (Vite on Port 5173)
```bash
cd frontend
npm run dev
```
*Access the Web Application in your browser at `http://localhost:5173`*

---

## 📐 Mathematical Formulas

### 1. Remaining Estimated Hours
$$\text{Remaining Hours} = \max\left(0, \text{Estimated Hours} \times \left(\frac{\text{Allocation \%}}{100}\right) - \text{Actual Hours Logged}\right)$$

### 2. Weighted Remaining Effort
$$\text{Weighted Effort} = \text{Remaining Hours} \times \text{Complexity Weight}$$

*Initial Weights:* Easy = `1.0`, Medium = `1.2`, Hard = `1.5`, Critical = `2.0`.

### 3. Capacity Utilization Percentage
$$\text{Utilization \%} = \left(\frac{\text{Weighted Remaining Effort}}{\text{Available Weekly Hours}}\right) \times 100$$

*Thresholds:*
- Underutilized: `< 40.0%`
- Balanced: `40.0% - 80.0%`
- High Workload: `80.0% - 100.0%`
- Overloaded: `> 100.0%`

---

## 📁 Repository Structure

```
WorkSense AI/
├── backend/
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── core/             # Configuration, JWT security
│   │   ├── intelligence/     # Workload, Imbalance, ML, Recommendation engines
│   │   ├── models/           # 13 SQLAlchemy relational models
│   │   ├── routes/           # REST API endpoints (Auth, Tasks, Workload, etc.)
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── database.py       # Engine session manager
│   │   ├── database_seed.py  # Seed script for realistic scenarios
│   │   └── main.py           # FastAPI entrypoint
│   ├── tests/                # Automated pytest suite
│   ├── alembic.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Status badges, Modals, Navbar, Sidebar
│   │   ├── context/          # JWT Auth Context
│   │   ├── layouts/          # DashboardLayout
│   │   ├── pages/            # Dashboard, Developers, Tasks, Analytics, etc.
│   │   ├── services/         # Axios interceptor
│   │   ├── App.jsx           # Protected routes
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── ml/
│   ├── datasets/             # Generated dataset (2000 samples)
│   ├── saved_models/         # Trained Random Forest & Isolation Forest .pkl
│   └── train_model.py        # ML training script
├── documentation/
│   ├── system_architecture.md
│   ├── database_design.md
│   └── api_documentation.md
├── README.md
├── .env.example
└── .gitignore
```
