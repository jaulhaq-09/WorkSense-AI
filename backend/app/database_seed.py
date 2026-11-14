import logging
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal
from app.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.entities import (
    User,
    Team,
    Developer,
    Skill,
    DeveloperSkill,
    Project,
    Task,
    TaskAssignment,
    TaskRequiredSkill,
    TimeLog,
    TaskDependency,
    WorkloadHistory,
    Recommendation,
)

logger = logging.getLogger("worksense.seed")

def seed_db():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        admin_user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if admin_user:
            logger.info("Database already seeded with demo admin. Skipping seed.")
            return

        logger.info("Starting database seed...")

        # 1. Create Users
        admin = User(
            name=settings.DEMO_ADMIN_NAME,
            email=settings.DEMO_ADMIN_EMAIL,
            password_hash=get_password_hash(settings.DEMO_ADMIN_PASSWORD),
            role="admin",
            is_active=True
        )
        pm = User(
            name="Sarah Connor",
            email="pm@worksense.ai",
            password_hash=get_password_hash("Password123!"),
            role="project_manager",
            is_active=True
        )
        u_alex = User(
            name="Alex Rivera",
            email="alex@worksense.ai",
            password_hash=get_password_hash("Password123!"),
            role="developer",
            is_active=True
        )
        u_blake = User(
            name="Blake Chen",
            email="blake@worksense.ai",
            password_hash=get_password_hash("Password123!"),
            role="developer",
            is_active=True
        )
        u_casey = User(
            name="Casey Morgan",
            email="casey@worksense.ai",
            password_hash=get_password_hash("Password123!"),
            role="developer",
            is_active=True
        )
        u_dana = User(
            name="Dana Vance",
            email="dana@worksense.ai",
            password_hash=get_password_hash("Password123!"),
            role="developer",
            is_active=True
        )

        db.add_all([admin, pm, u_alex, u_blake, u_casey, u_dana])
        db.flush()

        # 2. Create Teams
        t_core = Team(
            team_name="Core Platform & Services",
            description="Responsible for scalable backend microservices, real-time engines, and data pipelines."
        )
        t_product = Team(
            team_name="Product Experience Team",
            description="Builds customer-facing web and mobile applications, analytics dashboards, and UX flows."
        )
        db.add_all([t_core, t_product])
        db.flush()

        # 3. Create Developers
        dev_alex = Developer(
            user_id=u_alex.id,
            team_id=t_core.id,
            experience_level="senior",
            available_hours_per_week=Decimal("40.00"),
            active_status=True
        )
        dev_blake = Developer(
            user_id=u_blake.id,
            team_id=t_core.id,
            experience_level="mid",
            available_hours_per_week=Decimal("40.00"),
            active_status=True
        )
        dev_casey = Developer(
            user_id=u_casey.id,
            team_id=t_core.id,
            experience_level="mid",
            available_hours_per_week=Decimal("40.00"),
            active_status=True
        )
        dev_dana = Developer(
            user_id=u_dana.id,
            team_id=t_product.id,
            experience_level="lead",
            available_hours_per_week=Decimal("40.00"),
            active_status=True
        )
        db.add_all([dev_alex, dev_blake, dev_casey, dev_dana])
        db.flush()

        # 4. Create Skills
        s_python = Skill(skill_name="Python / FastAPI", description="High-performance asynchronous backend services and APIs")
        s_postgres = Skill(skill_name="PostgreSQL / SQL", description="Relational database schema modeling, queries, and optimization")
        s_react = Skill(skill_name="React / Tailwind CSS", description="Modern frontend UI development and component architectures")
        s_docker = Skill(skill_name="Docker & CI/CD", description="Containerization, Kubernetes, and deployment automation pipelines")
        s_architecture = Skill(skill_name="Distributed Systems Architecture", description="Event-driven systems, caching, and resiliency design")
        s_ml = Skill(skill_name="Machine Learning / Scikit-Learn", description="Predictive model training, feature engineering, and inference")
        db.add_all([s_python, s_postgres, s_react, s_docker, s_architecture, s_ml])
        db.flush()

        # 5. Developer Skills
        dev_skills = [
            # Alex Rivera (Senior Backend): High Python, Postgres, Architecture
            DeveloperSkill(developer_id=dev_alex.id, skill_id=s_python.id, proficiency_level=5),
            DeveloperSkill(developer_id=dev_alex.id, skill_id=s_postgres.id, proficiency_level=5),
            DeveloperSkill(developer_id=dev_alex.id, skill_id=s_architecture.id, proficiency_level=4),
            DeveloperSkill(developer_id=dev_alex.id, skill_id=s_docker.id, proficiency_level=3),

            # Blake Chen (Mid Frontend / Fullstack)
            DeveloperSkill(developer_id=dev_blake.id, skill_id=s_react.id, proficiency_level=5),
            DeveloperSkill(developer_id=dev_blake.id, skill_id=s_python.id, proficiency_level=3),
            DeveloperSkill(developer_id=dev_blake.id, skill_id=s_postgres.id, proficiency_level=2),

            # Casey Morgan (Mid Backend / Fullstack with Python & Postgres)
            DeveloperSkill(developer_id=dev_casey.id, skill_id=s_python.id, proficiency_level=4),
            DeveloperSkill(developer_id=dev_casey.id, skill_id=s_postgres.id, proficiency_level=4),
            DeveloperSkill(developer_id=dev_casey.id, skill_id=s_react.id, proficiency_level=3),
            DeveloperSkill(developer_id=dev_casey.id, skill_id=s_docker.id, proficiency_level=3),

            # Dana Vance (Lead DevOps / Cloud)
            DeveloperSkill(developer_id=dev_dana.id, skill_id=s_docker.id, proficiency_level=5),
            DeveloperSkill(developer_id=dev_dana.id, skill_id=s_architecture.id, proficiency_level=5),
            DeveloperSkill(developer_id=dev_dana.id, skill_id=s_python.id, proficiency_level=4),
            DeveloperSkill(developer_id=dev_dana.id, skill_id=s_postgres.id, proficiency_level=4),
        ]
        db.add_all(dev_skills)
        db.flush()

        # 6. Projects
        p_modernization = Project(
            project_name="WorkSense Core Engine & Scalability",
            description="Major infrastructure upgrade to support distributed workload telemetry and analytics.",
            team_id=t_core.id,
            start_date=date.today() - timedelta(days=14),
            end_date=date.today() + timedelta(days=45),
            status="active"
        )
        p_analytics = Project(
            project_name="Real-Time Analytics Portal",
            description="Next-gen real-time interactive charts, imbalance heatmaps, and manager redistribution cockpit.",
            team_id=t_product.id,
            start_date=date.today() - timedelta(days=7),
            end_date=date.today() + timedelta(days=60),
            status="active"
        )
        db.add_all([p_modernization, p_analytics])
        db.flush()

        # 7. Tasks & Assignments matching Section 10 scenario:
        # Developer A (Alex):
        # Task 1: "High-Throughput Event Ingestion Pipeline" (Critical: 2.0x, Est: 16 hrs, Logged: 4 hrs => Rem: 12 hrs * 2.0 = 24.0 weighted)
        # Task 2: "Distributed Query Cache Optimization" (Hard: 1.5x, Est: 12 hrs, Logged: 4 hrs => Rem: 8 hrs * 1.5 = 12.0 weighted)
        # Task 3: "Database Connection Pool Tuning" (Easy: 1.0x, Est: 3 hrs, Logged: 2 hrs => Rem: 1 hr * 1.0 = 1.0 weighted)
        # Total Alex Weighted Remaining = 24 + 12 + 1 = 37.0 hrs. Available = 40.0 hrs. Utilization = 37.0 / 40.0 = 92.5% (High Workload / Overloaded).

        # Developer B (Blake):
        # Task 4: "Dashboard Heatmap Component" (Medium: 1.2x, Est: 15 hrs, Logged: 5 hrs => Rem: 10 hrs * 1.2 = 12.0 weighted)
        # Task 5: "User Preferences Modal" (Easy: 1.0x, Est: 8 hrs, Logged: 2 hrs => Rem: 6 hrs * 1.0 = 6.0 weighted)
        # Total Blake Weighted Remaining = 12 + 6 = 18.0 hrs. Available = 40.0 hrs. Utilization = 18.0 / 40.0 = 45.0% (Balanced).

        # Developer C (Casey):
        # Task 6: "API Audit Logging Middleware" (Medium: 1.2x, Est: 10 hrs, Logged: 2 hrs => Rem: 8 hrs * 1.2 = 9.6 -> let's make it easy 1.0x 7 hrs + 4 hrs = 11.0 weighted)
        # Total Casey Weighted Remaining = 11.0 hrs. Available = 40.0 hrs. Utilization = 11.0 / 40.0 = 27.5% (Underutilized).

        # Task 7: "Kafka Event Broker Setup" (Blocked task, assigned to Dana Vance, dependent on Network Security Approval)

        today = date.today()

        t1 = Task(
            project_id=p_modernization.id,
            task_name="High-Throughput Event Ingestion Pipeline",
            description="Implement async batch event ingestion pipeline handling 10k events/sec with backpressure handling.",
            complexity="critical",
            priority="critical",
            estimated_hours=Decimal("16.00"),
            status="in_progress",
            deadline=today + timedelta(days=5)
        )
        t2 = Task(
            project_id=p_modernization.id,
            task_name="Distributed Query Cache Optimization",
            description="Configure Redis cluster caching layer for heavy relational analytics queries.",
            complexity="hard",
            priority="high",
            estimated_hours=Decimal("12.00"),
            status="in_progress",
            deadline=today + timedelta(days=7)
        )
        t3 = Task(
            project_id=p_modernization.id,
            task_name="Database Connection Pool Tuning",
            description="Fine-tune max connections, overflow limits, and timeout parameters for PostgreSQL.",
            complexity="easy",
            priority="medium",
            estimated_hours=Decimal("3.00"),
            status="in_progress",
            deadline=today + timedelta(days=3)
        )
        t4 = Task(
            project_id=p_analytics.id,
            task_name="Dashboard Heatmap Visualizer",
            description="Build interactive SVG workload heatmap showing team member utilization over time.",
            complexity="medium",
            priority="medium",
            estimated_hours=Decimal("15.00"),
            status="in_progress",
            deadline=today + timedelta(days=6)
        )
        t5 = Task(
            project_id=p_analytics.id,
            task_name="User Preferences & Alert Settings UI",
            description="Create settings modal with form controls to adjust workload notification thresholds.",
            complexity="easy",
            priority="low",
            estimated_hours=Decimal("8.00"),
            status="in_progress",
            deadline=today + timedelta(days=8)
        )
        t6 = Task(
            project_id=p_modernization.id,
            task_name="API Audit Logging Middleware",
            description="Add request-response audit log middleware with request correlation ID tracking.",
            complexity="easy",
            priority="medium",
            estimated_hours=Decimal("11.00"),
            status="pending",
            deadline=today + timedelta(days=9)
        )
        t7 = Task(
            project_id=p_modernization.id,
            task_name="Production VPC Security Group Hardening",
            description="Lock down egress rules and configure security groups across staging and production clusters.",
            complexity="hard",
            priority="high",
            estimated_hours=Decimal("10.00"),
            status="blocked",
            deadline=today + timedelta(days=12)
        )
        t8 = Task(
            project_id=p_modernization.id,
            task_name="Legacy Service Decommissioning",
            description="Verify all clients migrated away from v0 API before shutting down server instances.",
            complexity="easy",
            priority="low",
            estimated_hours=Decimal("6.00"),
            status="completed",
            deadline=today - timedelta(days=1)
        )

        db.add_all([t1, t2, t3, t4, t5, t6, t7, t8])
        db.flush()

        # Dependencies: t7 depends on t2 (e.g., distributed cache and network topology)
        dep1 = TaskDependency(task_id=t7.id, depends_on_task_id=t2.id)
        db.add(dep1)

        # Required Skills
        reqs = [
            TaskRequiredSkill(task_id=t1.id, skill_id=s_python.id, minimum_proficiency=4),
            TaskRequiredSkill(task_id=t1.id, skill_id=s_architecture.id, minimum_proficiency=3),
            TaskRequiredSkill(task_id=t2.id, skill_id=s_python.id, minimum_proficiency=3),
            TaskRequiredSkill(task_id=t2.id, skill_id=s_postgres.id, minimum_proficiency=3),
            TaskRequiredSkill(task_id=t3.id, skill_id=s_postgres.id, minimum_proficiency=2),
            TaskRequiredSkill(task_id=t4.id, skill_id=s_react.id, minimum_proficiency=3),
            TaskRequiredSkill(task_id=t5.id, skill_id=s_react.id, minimum_proficiency=2),
            TaskRequiredSkill(task_id=t6.id, skill_id=s_python.id, minimum_proficiency=2),
            TaskRequiredSkill(task_id=t7.id, skill_id=s_docker.id, minimum_proficiency=4),
        ]
        db.add_all(reqs)

        # Task Assignments
        assigns = [
            # Alex Rivera (Overloaded)
            TaskAssignment(task_id=t1.id, developer_id=dev_alex.id, allocation_percentage=Decimal("100.00")),
            TaskAssignment(task_id=t2.id, developer_id=dev_alex.id, allocation_percentage=Decimal("100.00")),
            TaskAssignment(task_id=t3.id, developer_id=dev_alex.id, allocation_percentage=Decimal("100.00")),

            # Blake Chen (Balanced)
            TaskAssignment(task_id=t4.id, developer_id=dev_blake.id, allocation_percentage=Decimal("100.00")),
            TaskAssignment(task_id=t5.id, developer_id=dev_blake.id, allocation_percentage=Decimal("100.00")),

            # Casey Morgan (Underutilized)
            TaskAssignment(task_id=t6.id, developer_id=dev_casey.id, allocation_percentage=Decimal("100.00")),

            # Dana Vance (DevOps)
            TaskAssignment(task_id=t7.id, developer_id=dev_dana.id, allocation_percentage=Decimal("100.00")),
            TaskAssignment(task_id=t8.id, developer_id=dev_alex.id, allocation_percentage=Decimal("100.00")),
        ]
        db.add_all(assigns)
        db.flush()

        # Time Logs
        logs = [
            # Alex logs:
            TimeLog(task_id=t1.id, developer_id=dev_alex.id, hours_spent=Decimal("4.00"), log_date=today - timedelta(days=1), description="Initial async pipeline boilerplate and protocol buffers"),
            TimeLog(task_id=t2.id, developer_id=dev_alex.id, hours_spent=Decimal("4.00"), log_date=today - timedelta(days=2), description="Benchmarked redis cache hit ratios"),
            TimeLog(task_id=t3.id, developer_id=dev_alex.id, hours_spent=Decimal("2.00"), log_date=today, description="Adjusted connection pool pool_pre_ping settings"),
            TimeLog(task_id=t8.id, developer_id=dev_alex.id, hours_spent=Decimal("6.00"), log_date=today - timedelta(days=3), description="Decommissioned legacy endpoint instances"),

            # Blake logs:
            TimeLog(task_id=t4.id, developer_id=dev_blake.id, hours_spent=Decimal("5.00"), log_date=today - timedelta(days=1), description="Wrote D3/SVG chart component"),
            TimeLog(task_id=t5.id, developer_id=dev_blake.id, hours_spent=Decimal("2.00"), log_date=today, description="Drafted modal forms in Tailwind"),

            # Casey logs:
            # None on pending t6

            # Dana logs:
            TimeLog(task_id=t7.id, developer_id=dev_dana.id, hours_spent=Decimal("2.00"), log_date=today - timedelta(days=2), description="Investigated security rule conflicts before block"),
        ]
        db.add_all(logs)

        # Historical Workload Entries (for 5 days history to plot trend lines)
        history_records = []
        for i in range(5, 0, -1):
            calc_date = datetime.now(timezone.utc) - timedelta(days=i)
            # Alex has been consistently high
            history_records.append(WorkloadHistory(
                developer_id=dev_alex.id,
                workload_score=Decimal(str(85 + i)),
                utilization_percentage=Decimal(str(88.0 + (i * 1.2))),
                workload_status="high",
                calculated_at=calc_date
            ))
            # Blake balanced
            history_records.append(WorkloadHistory(
                developer_id=dev_blake.id,
                workload_score=Decimal(str(42 + i)),
                utilization_percentage=Decimal(str(44.0 + (i * 0.5))),
                workload_status="balanced",
                calculated_at=calc_date
            ))
            # Casey underutilized
            history_records.append(WorkloadHistory(
                developer_id=dev_casey.id,
                workload_score=Decimal(str(24 + i)),
                utilization_percentage=Decimal(str(25.0 + (i * 0.4))),
                workload_status="underutilized",
                calculated_at=calc_date
            ))

        db.add_all(history_records)

        # Initial Recommendation: Redistribute Task 2 (Distributed Query Cache Optimization)
        # from Alex Rivera to Casey Morgan
        initial_rec = Recommendation(
            task_id=t2.id,
            from_developer_id=dev_alex.id,
            suggested_developer_id=dev_casey.id,
            recommendation_reason=(
                "Alex Rivera has 92.5% capacity utilization (37.0 weighted remaining hours). "
                "Casey Morgan is underutilized at 27.5% (11.0 weighted hours) with 4/5 Python and 4/5 PostgreSQL skills. "
                "Reassigning 'Distributed Query Cache Optimization' (12.0 weighted hours) will bring Alex to a balanced 62.5% "
                "and Casey to a balanced 57.5% utilization."
            ),
            status="pending"
        )
        db.add(initial_rec)

        db.commit()
        logger.info("Database seeding successfully completed!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_db()
