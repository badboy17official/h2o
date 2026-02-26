# MCQ Competition Platform

A complete, production-ready team-based MCQ (Multiple Choice Question) competition platform built with React, Node.js, Express, and PostgreSQL.

## 🎯 Features

### For Teams
- **Team Login**: Secure authentication with Team ID and password
- **Randomized Questions**: Each team gets 20 unique questions from a pool of 50
- **Category Distribution**: 5 questions each from C, Python, Java, and SQL
- **Timer System**: 30-minute countdown with auto-submit
- **Auto-Save**: Answers are saved automatically
- **Progress Tracking**: Visual progress indicator
- **Result Display**: Immediate score display after submission
- **Two Beautiful Themes**: Toggle between Elegant and Cyberpunk themes

### For Admins
- **Excel Upload**: Bulk team creation from Excel files
- **Team Management**: View all teams and their status
- **Live Leaderboard**: Real-time competition rankings
- **Results Export**: Download results as Excel/CSV
- **Team Deletion**: Remove teams when needed

## 🛠 Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Zustand (State Management)
- Axios
- React Router v6

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt (Password Hashing)
- Helmet (Security)
- Rate Limiting

## 📁 Project Structure

```
H2O/
├── backend/
│   ├── config/
│   │   └── database.js           # Database configuration
│   ├── database/
│   │   ├── schema.sql            # Database schema
│   │   └── seed.sql              # 50 MCQ questions
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── validation.js         # Input validation
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── questions.js          # Question routes
│   │   ├── submissions.js        # Submission routes
│   │   └── admin.js              # Admin routes
│   ├── scripts/
│   │   ├── initDatabase.js       # Initialize DB schema
│   │   └── seedQuestions.js      # Seed questions
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js            # API service
│   │   ├── store/
│   │   │   └── store.js          # Zustand state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Setup

```bash
cd H2O
```

### 2. Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mcq_competition;

# Exit psql
\q
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

Update `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcq_competition
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secret_key_here_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Initialize database schema
npm run init-db

# Seed questions (50 MCQs)
npm run seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎮 Usage

### Admin Access

1. Go to `http://localhost:5173`
2. Click "Admin Panel"
3. Login with:
   - Username: `admin`
   - Password: `admin123`

### Creating Teams

**Option 1: Excel Upload**

Create an Excel file with these columns:

| Team ID  | Team Name   | Password |
|----------|-------------|----------|
| TEAM001  | Alpha Team  | alpha123 |
| TEAM002  | Beta Team   | beta456  |
| TEAM003  | Gamma Team  | gamma789 |

Upload via Admin Dashboard → Upload Teams tab

### Team Login

1. Teams visit `http://localhost:5173`
2. Click "Team Login"
3. Enter Team ID and Password
4. Start the quiz

### Quiz Flow

1. **Instructions Page**: Shows quiz rules
2. **Quiz Interface**: 
   - One question per page
   - Timer countdown (30 minutes)
   - Navigation between questions
   - Auto-save answers
   - Question navigator grid
3. **Auto-Submit**: Quiz auto-submits when timer reaches 0
4. **Results Page**: Shows score and statistics

## 🗄 Database Schema

### Tables

- **teams**: Stores team information
- **questions**: 50 MCQ questions (12 C, 12 Python, 13 Java, 13 SQL)
- **team_questions**: Maps randomized questions to teams
- **team_attempts**: Stores team answers
- **results**: Final submission results

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting on login endpoints
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Environment variable protection

## 🎨 Themes

### Elegant Theme
- Soft gradients
- Clean white/gray palette
- Rounded cards
- Smooth transitions
- Professional appearance

### Cyberpunk Theme
- Dark background
- Neon blue/purple glow
- Glassmorphism effects
- Animated hover states
- Futuristic look

## 📊 Question Distribution

- **Total Questions**: 50
- **C Programming**: 12 questions
- **Python**: 12 questions
- **Java**: 13 questions
- **SQL**: 13 questions

Each team receives:
- 20 randomly selected questions
- 5 from each category
- Shuffled order
- Unique combination

## 🚢 Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

### Option 2: Render

1. Create PostgreSQL database on Render
2. Create Web Service for backend
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Create Static Site for frontend
   - Build Command: `npm run build`
   - Publish Directory: `dist`

### Option 3: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Clone and setup
cd /var/www
git clone your-repo
cd H2O/backend

# Setup environment
cp .env.example .env
nano .env

# Initialize database
npm run init-db
npm run seed

# Start with PM2
pm2 start server.js --name mcq-backend

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/mcq
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/H2O/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/team/login` - Team login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Questions
- `GET /api/questions` - Get all questions for team
- `GET /api/questions/:order` - Get specific question

### Submissions
- `POST /api/submissions/answer` - Save answer
- `POST /api/submissions/submit` - Submit quiz
- `GET /api/submissions/status` - Get submission status

### Admin
- `POST /api/admin/upload-teams` - Upload teams from Excel
- `GET /api/admin/teams` - Get all teams
- `GET /api/admin/leaderboard` - Get leaderboard
- `GET /api/admin/export-results` - Export results
- `DELETE /api/admin/teams/:id` - Delete team

## 🐛 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in .env file
```

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

## 📄 License

MIT License - Feel free to use for your competitions!

## 🤝 Contributing

This is a complete working project. Feel free to fork and customize for your needs.

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for hackathons and coding competitions**
# h2o
