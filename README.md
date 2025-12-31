# HireSmart AI - Advanced Job Portal

A production-ready AI-powered job portal with intelligent resume-job matching, built with React, FastAPI, PostgreSQL, and advanced NLP techniques.

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Management](#-database-management)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Features

### Authentication & Authorization
- ✅ Secure JWT-based authentication
- ✅ Role-based access control (Job Seeker, Recruiter, Admin)
- ✅ User registration and login with password hashing

### Job Seeker Features
- ✅ Profile creation and management
- ✅ Resume upload (PDF) with AI-powered parsing
- ✅ Automatic skill, experience, and education extraction
- ✅ Apply to jobs with real-time match score (0-100%)
- ✅ View AI-powered match analysis and explanations
- ✅ Track application status

### Recruiter Features
- ✅ Post, edit, and delete job listings
- ✅ View all applicants for posted jobs
- ✅ AI-ranked candidate list (sorted by match score)
- ✅ View candidate profiles, resumes, and contact information
- ✅ Application status management
- ✅ Recruiter analytics dashboard

### Admin Features
- ✅ User management
- ✅ Job posting oversight
- ✅ System-wide analytics dashboard
- ✅ Application statistics

### AI/ML Features
- ✅ **Resume Parsing**: Extract skills, education, and experience from PDF resumes using NLP
- ✅ **Skill Extraction**: Advanced skill identification using spaCy
- ✅ **Job Matching**: TF-IDF + Cosine Similarity algorithm for accurate matching
- ✅ **Match Scoring**: 0-100% match score with detailed analysis
- ✅ **Candidate Ranking**: Automatic ranking of applicants by relevance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Home   │  │  Jobs    │  │ Profile  │  │ Dashboard │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                         │                                    │
│                    Axios Client                              │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────┼────────────────────────────────────┐
│                  Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth API   │  │   Jobs API   │  │ Applications │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AI Services Layer                             │  │
│  │  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ Resume Parser│  │ Match Engine  │                 │  │
│  │  │ (NLP/spaCy)  │  │ (TF-IDF/ML)   │                 │  │
│  │  └──────────────┘  └──────────────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                    SQLAlchemy ORM                           │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│              PostgreSQL Database                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Users   │  │   Jobs   │  │Applications│ │ Profiles │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - Modern UI framework
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Python ORM for database operations
- **PostgreSQL** - Robust relational database
- **JWT** - Secure token-based authentication
- **PyPDF2** - PDF parsing for resume extraction
- **spaCy** - Advanced NLP for skill extraction
- **scikit-learn** - ML algorithms (TF-IDF, Cosine Similarity)
- **Alembic** - Database migration tool
- **Pydantic** - Data validation and settings management

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+ (or use Docker)
- **PostgreSQL** 15+ (or use Docker)
- **Docker** and Docker Compose (recommended for easy setup)

### Installing Docker

If Docker is not installed, you can install it from:
- **macOS**: Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
- **Linux**: Follow [Docker installation guide](https://docs.docker.com/engine/install/)
- **Windows**: Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

After installation, verify Docker is working:
```bash
docker --version
docker compose version
```

**Note**: Modern Docker uses `docker compose` (with space) instead of `docker-compose` (with hyphen). Both commands are used in this README for compatibility.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which handles all dependencies automatically.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HireSmart-AI---Advanced-Job-Portal
   ```

2. **Start backend services**
   ```bash
   docker compose up -d
   # Or if you have older Docker: docker-compose up -d
   ```
   This will:
   - Start PostgreSQL database on port 5432
   - Build and start FastAPI backend on port 8000
   - Run database migrations automatically
   - Seed sample data

3. **Start frontend** (in a new terminal)
   ```bash
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs (Swagger): http://localhost:8000/api/docs
   - API Docs (ReDoc): http://localhost:8000/api/redoc

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file
   cat > .env << EOF
   DATABASE_URL=postgresql://user:password@localhost:5432/hiresmart_db
   SECRET_KEY=your-secret-key-change-this-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   EOF
   ```

5. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb hiresmart_db
   
   # Or using psql
   psql -U postgres -c "CREATE DATABASE hiresmart_db;"
   ```

6. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

7. **Seed sample data** (optional)
   ```bash
   python scripts/seed_data.py
   ```

8. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file** (optional)
   ```bash
   # Create .env.local
   echo "VITE_API_URL=http://localhost:8000" > .env.local
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hiresmart_db

# Security
SECRET_KEY=your-secret-key-change-this-in-production-use-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: OpenAI API for enhanced features
OPENAI_API_KEY=your-openai-api-key-here
```

### Frontend Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

### Docker Compose Configuration

The `docker-compose.yml` file includes default configurations. For production, update the environment variables in the file or use a `.env` file.

## 📡 API Documentation

Once the backend is running, interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user info

#### Jobs
- `GET /api/v1/jobs` - List all jobs (with filters: search, location, job_type)
- `GET /api/v1/jobs/{id}` - Get job details
- `POST /api/v1/jobs` - Create job (Recruiter/Admin only)
- `PUT /api/v1/jobs/{id}` - Update job (Recruiter/Admin only)
- `DELETE /api/v1/jobs/{id}` - Delete job (Recruiter/Admin only)
- `GET /api/v1/jobs/recruiter/my-jobs` - Get my posted jobs (Recruiter)

#### Applications
- `POST /api/v1/applications` - Apply to job (Job Seeker only)
- `GET /api/v1/applications/my-applications` - Get my applications
- `GET /api/v1/applications/job/{job_id}/applicants` - Get applicants for a job (Recruiter)
- `GET /api/v1/applications/{id}` - Get application details
- `PUT /api/v1/applications/{id}` - Update application status (Recruiter/Admin)

#### Profiles
- `GET /api/v1/profiles/me` - Get my parsed profile
- `POST /api/v1/profiles/upload-resume` - Upload and parse resume (PDF)
- `PUT /api/v1/profiles/me` - Update profile

#### Admin
- `GET /api/v1/admin/users` - Get all users (Admin only)
- `DELETE /api/v1/admin/users/{id}` - Delete user (Admin only)
- `GET /api/v1/admin/analytics` - Get system analytics (Admin only)

#### Analytics
- `GET /api/v1/analytics/recruiter/stats` - Get recruiter statistics

## 🗄️ Database Management

The project uses **Alembic** for database migrations.

### Migration Commands

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Check current migration status
alembic current

# View migration history
alembic history

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>
```

### Database Schema

```
users
├── id (UUID, Primary Key)
├── email (String, Unique, Not Null)
├── name (String, Not Null)
├── hashed_password (String, Not Null)
├── role (Enum: JOB_SEEKER, RECRUITER, ADMIN)
├── avatar (String, Optional)
├── resume_text (Text, Optional)
└── created_at (DateTime)

jobs
├── id (UUID, Primary Key)
├── title (String, Not Null)
├── company (String, Not Null)
├── location (String)
├── type (String: Full-time, Part-time, Remote, Contract)
├── description (Text, Not Null)
├── requirements (JSON Array)
├── salary_range (String, Optional)
├── recruiter_id (UUID, Foreign Key -> users.id)
├── posted_at (DateTime)
└── is_active (Boolean)

applications
├── id (UUID, Primary Key)
├── job_id (UUID, Foreign Key -> jobs.id)
├── user_id (UUID, Foreign Key -> users.id)
├── status (String: Pending, Reviewing, Interviewed, Rejected, Accepted)
├── match_score (Integer, 0-100)
├── match_analysis (Text, Optional)
├── applied_at (DateTime)
└── updated_at (DateTime)

parsed_profiles
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key -> users.id, Unique)
├── skills (JSON Array)
├── experience (JSON Array)
├── education (JSON Array)
└── summary (Text, Optional)
```

### Seeding Data

To populate the database with sample data:

```bash
# Using Docker
docker compose exec backend python scripts/seed_data.py
# Or: docker-compose exec backend python scripts/seed_data.py

# Manual setup
cd backend
source venv/bin/activate
python scripts/seed_data.py
```

**Default Test Accounts:**
- **Admin**: `admin@hiresmart.com` / `admin123`
- **Recruiter**: `recruiter1@hiresmart.com` / `recruiter123`
- **Job Seeker**: `jobseeker1@hiresmart.com` / `seeker123`

## 🤖 AI Matching Algorithm

The matching system uses a combination of advanced techniques:

1. **TF-IDF Vectorization**: Converts job requirements and resume text into numerical vectors
2. **Cosine Similarity**: Calculates similarity between job and resume vectors
3. **Skill Matching**: Bonus scoring based on required vs. candidate skills
4. **Weighted Combination**: Final score (0-100%) considers multiple factors

The algorithm analyzes:
- Job description and requirements
- Candidate skills, experience, and education
- Resume summary and full text content

## 🚢 Deployment

### Backend Deployment

#### Using Docker

1. **Build production image**
   ```bash
   cd backend
   docker build -t hiresmart-backend .
   ```

2. **Run container**
   ```bash
   docker run -d \
     -p 8000:8000 \
     -e DATABASE_URL=postgresql://user:pass@host:5432/db \
     -e SECRET_KEY=your-secret-key \
     -e CORS_ORIGINS=https://your-frontend-domain.com \
     hiresmart-backend
   ```

#### Using Cloud Platforms

**Railway/Render/Heroku:**
1. Connect your repository
2. Set environment variables
3. Deploy

**Environment variables required:**
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `ALGORITHM` (optional, defaults to HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (optional, defaults to 30)

### Frontend Deployment

#### Using Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variable**
   - `VITE_API_URL`: Your backend API URL

#### Using Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variable: `VITE_API_URL`

#### Using Docker

1. **Build frontend**
   ```bash
   npm run build
   ```

2. **Serve with nginx** (create `Dockerfile.frontend`)
   ```dockerfile
   FROM nginx:alpine
   COPY dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   ```

### Production Checklist

- [ ] Change `SECRET_KEY` to a strong random string
- [ ] Update `CORS_ORIGINS` with production frontend URL
- [ ] Use production PostgreSQL database
- [ ] Enable HTTPS/SSL
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Review security settings
- [ ] Test all endpoints
- [ ] Load test the application

## 📁 Project Structure

```
HireSmart-AI---Advanced-Job-Portal/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py              # Authentication endpoints
│   │   │       ├── jobs.py              # Job CRUD endpoints
│   │   │       ├── applications.py      # Application endpoints
│   │   │       ├── profiles.py          # Profile/resume endpoints
│   │   │       ├── admin.py             # Admin endpoints
│   │   │       └── analytics.py         # Analytics endpoints
│   │   ├── core/
│   │   │   ├── config.py                # Configuration & settings
│   │   │   ├── database.py              # Database setup & session
│   │   │   └── security.py              # JWT & password hashing
│   │   ├── models/
│   │   │   ├── user.py                  # User model
│   │   │   ├── job.py                   # Job model
│   │   │   ├── application.py           # Application model
│   │   │   └── parsed_profile.py        # ParsedProfile model
│   │   ├── schemas/
│   │   │   ├── user.py                  # User Pydantic schemas
│   │   │   ├── job.py                   # Job schemas
│   │   │   ├── application.py           # Application schemas
│   │   │   └── profile.py               # Profile schemas
│   │   ├── services/
│   │   │   ├── resume_parser.py         # Resume parsing service
│   │   │   └── matching_service.py      # AI matching service
│   │   ├── middleware/
│   │   │   └── logging_middleware.py     # Request logging
│   │   └── main.py                      # FastAPI app entry point
│   ├── alembic/                         # Database migrations
│   │   ├── versions/                    # Migration files
│   │   └── env.py                       # Alembic environment
│   ├── scripts/
│   │   ├── seed_data.py                 # Database seeding
│   │   ├── reset_db.py                  # Database reset utility
│   │   └── view_db.py                   # Database viewer utility
│   ├── requirements.txt                 # Python dependencies
│   ├── Dockerfile                       # Backend Docker image
│   ├── alembic.ini                      # Alembic configuration
│   └── .env.example                      # Environment variables template
├── components/                          # React components
│   ├── Home.tsx                         # Landing page
│   ├── JobBoard.tsx                     # Job listing page
│   ├── Profile.tsx                      # User profile page
│   ├── RecruiterDashboard.tsx          # Recruiter dashboard
│   ├── AdminDashboard.tsx              # Admin dashboard
│   ├── AuthForm.tsx                     # Login/signup form
│   └── Layout.tsx                       # App layout
├── services/                            # Frontend services
│   ├── api.ts                           # API client (Axios)
│   └── storage.ts                       # LocalStorage utilities
├── types.ts                             # TypeScript type definitions
├── App.tsx                              # Main app component
├── index.tsx                            # React entry point
├── docker-compose.yml                   # Docker Compose configuration
├── package.json                         # Frontend dependencies
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite configuration
└── README.md                            # This file
```

## 🐛 Troubleshooting

### Backend Issues

**"uvicorn: command not found"**
- Ensure virtual environment is activated: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

**Database connection error**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env` file
- Ensure database exists: `createdb hiresmart_db`
- If using Docker: `docker compose up -d postgres` (or `docker-compose up -d postgres`)

**Import errors**
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`
- Verify Python version: `python3 --version` (should be 3.11+)

**Migration errors**
- Check database connection
- Verify Alembic configuration in `alembic.ini`
- Try: `alembic downgrade -1` then `alembic upgrade head`

### Frontend Issues

**API connection error**
- Verify backend is running: `curl http://localhost:8000/health`
- Check `VITE_API_URL` in `.env.local`
- Verify CORS settings in backend
- Check browser console for detailed errors

**Build errors**
- Clear cache: `rm -rf node_modules && npm install`
- Verify Node.js version: `node --version` (should be 18+)
- Clear Vite cache: `rm -rf node_modules/.vite`

**Blank page**
- Check browser console for errors
- Verify API is accessible
- Clear browser cache: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

### Docker Issues

**Container won't start**
- Check logs: `docker compose logs backend` (or `docker-compose logs backend`)
- Verify Docker is running: `docker ps`
- Rebuild containers: `docker compose build --no-cache` (or `docker-compose build --no-cache`)

**Database connection in Docker**
- Ensure postgres service is healthy: `docker compose ps` (or `docker-compose ps`)
- Check environment variables in `docker-compose.yml`
- Verify network connectivity between containers

**Docker command not found**
- Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
- Verify installation: `docker --version`
- Modern Docker uses `docker compose` (space), older versions use `docker-compose` (hyphen)

## 🧪 Testing

### Manual Testing Workflow

1. **Register as Job Seeker**
   - Create account
   - Upload resume (PDF)
   - Verify profile is parsed

2. **Browse and Apply**
   - View job listings
   - Apply to a job
   - Check match score

3. **Recruiter Flow**
   - Login as recruiter
   - Post a new job
   - View applicants with match scores
   - View candidate details and resume

4. **Admin Flow**
   - Login as admin
   - View analytics dashboard
   - Manage users and jobs

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for frontend code
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Support

For questions, issues, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, React, and AI/ML technologies**
