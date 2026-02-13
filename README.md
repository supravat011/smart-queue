# SmartQueue

> **Next-generation intelligent queue management system powered by predictive AI**

SmartQueue is a comprehensive, production-ready queue management platform that combines real-time monitoring, predictive analytics, and smart recommendations to optimize physical space utilization and minimize wait times. Built with modern web technologies and advanced algorithms, it delivers a seamless experience for users, administrators, and service providers.

---

## 🌟 Key Features

### 🎯 **Smart Booking System**
- **Real-time slot availability** with live capacity tracking
- **Priority-based queuing** (USER, VIP, SENIOR, ADMIN roles)
- **Predictive wait times** using Weighted Moving Average (WMA) algorithms
- **Smart recommendations** for alternative slots when preferred times are full
- **Instant booking confirmations** with unique reference codes

### 📊 **Predictive Analytics**
- **AI-powered congestion scoring** to identify peak hours
- **Historical data analysis** for accurate wait time predictions
- **Multi-factor slot scoring** based on availability, congestion, and user preferences
- **Peak hour detection** to help users avoid crowded times
- **Confidence metrics** for all predictions

### 🔄 **Real-Time Updates**
- **WebSocket integration** for live queue position tracking
- **Automatic reconnection** with up to 5 retry attempts
- **Multi-channel broadcasting** (queue, slots, admin, user-specific)
- **Instant notifications** for appointment status changes
- **Live slot availability updates** across all users

### 👨‍💼 **Admin Dashboard**
- **System metrics overview** (users, appointments, wait times, system load)
- **Interactive charts** for daily bookings and service performance
- **Service performance analytics** with utilization and cancellation rates
- **CSV export functionality** for detailed reports
- **Bulk slot creation** for efficient scheduling
- **Real-time monitoring** of all system activities

### 🎨 **Modern UI/UX**
- **Immersive dark theme** with fluid gradient animations
- **Glassmorphism effects** on cards and navigation
- **Responsive design** optimized for all devices
- **Smooth micro-interactions** and hover effects
- **Professional typography** (Syne + Space Grotesk)
- **Accessibility-focused** interface design

---

## 🏗️ Architecture

### **Backend (Python + FastAPI)**

```
backend/
├── app/
│   ├── auth/              # JWT authentication & user management
│   ├── services/          # Service CRUD operations
│   ├── slots/             # Slot management & availability
│   ├── appointments/      # Booking logic & queue management
│   ├── prediction/        # WMA algorithms & congestion scoring
│   ├── recommendations/   # Smart slot suggestions
│   ├── admin/             # System metrics & reports
│   ├── analytics/         # Performance analytics & CSV export
│   └── websocket/         # Real-time WebSocket manager
├── core/
│   ├── config.py          # Environment configuration
│   └── security.py        # JWT & bcrypt utilities
├── db/
│   ├── database.py        # SQLite setup with WAL mode
│   └── models.py          # SQLAlchemy models (9 tables)
└── main.py                # FastAPI application entry
```

**Backend Features:**
- **FastAPI** for high-performance async API
- **SQLite** with Write-Ahead Logging (WAL) for concurrency
- **SQLAlchemy ORM** with 9 comprehensive models
- **JWT authentication** with bcrypt password hashing
- **Role-Based Access Control (RBAC)**
- **WebSocket support** for real-time updates
- **Pydantic schemas** for data validation
- **CORS enabled** for frontend integration

### **Frontend (React + TypeScript)**

```
src/
├── components/
│   ├── Layout.tsx              # Header & footer with navigation
│   ├── QueueStatus.tsx         # Real-time queue position tracker
│   └── SlotRecommendations.tsx # Smart alternative slot suggestions
├── pages/
│   ├── LandingPage.tsx         # Hero section & features
│   ├── AuthPages.tsx           # Login & registration
│   ├── UserDashboard.tsx       # User appointment management
│   ├── EnhancedBooking.tsx     # Booking with predictions
│   ├── AdminDashboard.tsx      # Admin control panel
│   ├── AnalyticsPage.tsx       # Detailed analytics
│   └── PredictionsPage.tsx     # Prediction insights
├── services/
│   ├── api.ts                  # API client (45+ endpoints)
│   └── websocket.ts            # WebSocket manager
├── App.tsx                     # Routing & authentication
└── index.css                   # Global styles & animations
```

**Frontend Features:**
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **React Router** for client-side routing
- **Recharts** for interactive data visualization
- **Lucide React** for modern iconography
- **Tailwind CSS** for utility-first styling
- **Custom hooks** for state management

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### **Installation**

#### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd "Smart Queue"
```

#### 2. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

#### 3. **Frontend Setup**
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install
```

### **Running the Application**

#### **Start Backend Server**
```bash
# From project root (with PYTHONPATH set)
$env:PYTHONPATH="d:\Bsc.CT\Smart Queue"; python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Or from backend directory
cd backend
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

#### **Start Frontend Development Server**
```bash
# From project root
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 📡 API Endpoints

### **Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT)
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh access token

### **Services**
- `GET /services` - List all services
- `POST /services` - Create new service (Admin)
- `GET /services/{id}` - Get service details
- `PUT /services/{id}` - Update service (Admin)
- `DELETE /services/{id}` - Delete service (Admin)

### **Slots**
- `GET /slots` - List slots (with filters)
- `POST /slots` - Create slot (Admin)
- `GET /slots/{id}` - Get slot details
- `GET /slots/availability` - Check availability
- `PUT /slots/{id}` - Update slot (Admin)

### **Appointments**
- `POST /appointments/book` - Book appointment
- `GET /appointments/my-bookings` - User's appointments
- `GET /appointments/{id}` - Get appointment details
- `DELETE /appointments/{id}/cancel` - Cancel appointment
- `GET /appointments/{id}/queue-status` - Get queue position

### **Predictions**
- `GET /predictions/slot/{id}` - Get slot wait time prediction
- `GET /predictions/peak-hours` - Get peak hours analysis

### **Recommendations**
- `GET /recommendations/alternative-slots` - Get alternative slot suggestions
- `GET /recommendations/best-times` - Get best booking times

### **Admin**
- `GET /admin/metrics` - System metrics dashboard
- `GET /admin/slot-utilization` - Slot utilization report
- `POST /admin/bulk-create-slots` - Bulk create slots

### **Analytics**
- `GET /analytics/overview` - Analytics overview
- `GET /analytics/service-performance` - Service performance metrics
- `GET /analytics/daily-stats` - Daily statistics
- `GET /analytics/export/service-performance` - Export CSV
- `GET /analytics/export/daily-stats` - Export CSV

### **WebSocket Channels**
- `WS /ws/queue` - Queue updates broadcast
- `WS /ws/slots` - Slot availability updates
- `WS /ws/admin` - Admin metrics updates
- `WS /ws/user/{user_id}` - User-specific notifications

---

## 🗄️ Database Schema

**9 SQLAlchemy Models:**
1. **User** - User accounts with roles and priorities
2. **Service** - Available services (e.g., consultation, testing)
3. **Slot** - Time slots with capacity and status
4. **Appointment** - User bookings with queue positions
5. **LoadHistory** - Historical load data for predictions
6. **PeakHour** - Peak hour analysis results
7. **Recommendation** - Cached slot recommendations
8. **SystemMetric** - System performance metrics
9. **AuditLog** - Activity tracking and logging

---

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Bcrypt password hashing** for secure storage
- **Role-Based Access Control (RBAC)** with 4 user levels
- **CORS configuration** for secure cross-origin requests
- **Environment variable management** for sensitive data
- **SQL injection protection** via SQLAlchemy ORM
- **Input validation** with Pydantic schemas

---

## 🎯 User Roles & Permissions

| Role | Priority Weight | Permissions |
|------|----------------|-------------|
| **USER** | 1.0 | Book appointments, view own bookings, cancel bookings |
| **VIP** | 1.5 | All USER permissions + priority queue placement |
| **SENIOR** | 2.0 | All VIP permissions + higher priority |
| **ADMIN** | 3.0 | All permissions + system management, analytics, bulk operations |

---

## 📊 Prediction Algorithms

### **Weighted Moving Average (WMA)**
- Assigns higher weights to recent data points
- Calculates predicted wait times based on historical patterns
- Confidence scoring based on data availability

### **Congestion Scoring**
- Analyzes current queue size vs. capacity
- Factors in historical load percentages
- Provides 0-100% congestion indicators

### **Peak Hour Detection**
- Identifies recurring high-traffic periods
- Analyzes booking patterns across days/weeks
- Helps users avoid crowded times

### **Multi-Factor Slot Scoring**
- **Availability**: Remaining capacity
- **Congestion**: Current and predicted load
- **Time Match**: Proximity to preferred time
- **Priority Bonus**: User role considerations
- **Historical Performance**: Past wait times

---

## 🎨 Design System

### **Color Palette**
- **Background**: `#030303` (Deep black)
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Text**: `#ffffff` / `#9ca3af` (White / Gray)

### **Typography**
- **Display**: Syne (Bold, 700-800 weight)
- **Body**: Space Grotesk (Regular, 400-600 weight)
- **Mono**: Space Grotesk (For data/metrics)

### **Effects**
- Glassmorphism with `backdrop-blur`
- Gradient animations
- Smooth transitions (300ms)
- Hover state transformations

---

## 📈 Performance Optimizations

- **SQLite WAL mode** for concurrent reads/writes
- **Connection pooling** with StaticPool
- **Async/await** throughout backend
- **WebSocket auto-reconnect** with exponential backoff
- **Lazy loading** for frontend routes
- **Optimized bundle size** with Vite
- **Debounced API calls** for search/filter

---

## 🧪 Testing

### **Backend Testing**
```bash
# Run tests
pytest

# With coverage
pytest --cov=app
```

### **Frontend Testing**
```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

---

## 📦 Deployment

### **Backend Deployment**
```bash
# Build production image
docker build -t smartqueue-backend .

# Run container
docker run -p 8000:8000 smartqueue-backend
```

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🛠️ Technology Stack

### **Backend**
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Python-Jose (JWT)
- Passlib (Bcrypt)
- Uvicorn
- WebSockets

### **Frontend**
- React 18
- TypeScript
- Vite
- React Router DOM
- Recharts
- Lucide React
- Tailwind CSS

---

## 📝 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=sqlite:///./smartqueue.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Debug
DEBUG=True
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **FastAPI** for the excellent async framework
- **React** team for the powerful UI library
- **Tailwind CSS** for the utility-first approach
- **Recharts** for beautiful data visualization

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub**: [SmartQueue Repository]
- **Twitter**: [@smartqueue]
- **LinkedIn**: [SmartQueue]

---

**Built with ❤️ for optimizing physical spaces and reducing wait times**

*SMARTQUEUE V2.0 // 2024*
