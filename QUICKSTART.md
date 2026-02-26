# 🚀 QUICKSTART GUIDE

Get the MCQ Competition Platform running in **5 minutes**!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check PostgreSQL (need 14+)
psql --version

# If missing, install from:
# Node.js: https://nodejs.org
# PostgreSQL: https://www.postgresql.org
```

---

## Step 1: Database Setup (1 minute)

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mcq_competition;

# Exit
\q
```

---

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file (use your favorite editor)
nano .env
# or
code .env
```

**Update these in .env:**
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_random_long_string_here
```

```bash
# Initialize database schema
npm run init-db

# Load 50 questions
npm run seed

# Start backend server
npm run dev
```

✅ Backend running at `http://localhost:5000`

---

## Step 3: Frontend Setup (2 minutes)

**Open a new terminal**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running at `http://localhost:5173`

---

## Step 4: Test It! (1 minute)

### Test Admin Access

1. Open browser: `http://localhost:5173`
2. Click **"Admin Panel"**
3. Login:
   - Username: `admin`
   - Password: `admin123`
4. You should see the Admin Dashboard

### Create Test Teams

**Option A: Excel Upload**

1. Create Excel file with columns: `Team ID`, `Team Name`, `Password`
2. Add a row: `TEAM001`, `Test Team`, `test123`
3. Upload via Admin Dashboard → Upload Teams tab

**Option B: Manual Entry**

Run this SQL:
```bash
psql -U postgres -d mcq_competition
```

```sql
INSERT INTO teams (team_id, team_name, password_hash)
VALUES ('TEAM001', 'Test Team', '$2b$10$YourHashedPasswordHere');
```

### Test Team Access

1. Go to `http://localhost:5173`
2. Click **"Team Login"**
3. Login:
   - Team ID: `TEAM001`
   - Password: `test123`
4. Click "Start Quiz"
5. Answer some questions
6. Submit and see results

---

## 🎉 You're Done!

The platform is now running with:
- ✅ Backend API on port 5000
- ✅ Frontend on port 5173
- ✅ PostgreSQL database with 50 questions
- ✅ Admin access working
- ✅ Team login working

---

## Common Issues

### "Database connection failed"
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `backend/.env`

### "Port 5000 already in use"
```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
cd backend && npm install
cd frontend && npm install
```

### Excel upload not working
- Make sure columns are: `Team ID`, `Team Name`, `Password`
- File must be .xlsx or .xls format

---

## Next Steps

### Create More Teams

Use the Excel upload feature:

| Team ID  | Team Name    | Password |
|----------|--------------|----------|
| TEAM001  | Alpha Team   | alpha123 |
| TEAM002  | Beta Team    | beta456  |
| TEAM003  | Gamma Team   | gamma789 |

### Customize Questions

Edit `backend/database/seed.sql` and run:
```bash
cd backend
npm run seed
```

### Deploy to Production

See `DEPLOYMENT.md` for:
- Railway deployment
- Render deployment
- VPS deployment
- Docker deployment

---

## 🎨 Features to Try

1. **Theme Toggle**: Click theme button on any page
2. **Timer**: Start quiz and watch 30-minute countdown
3. **Auto-Save**: Answers save automatically
4. **Leaderboard**: View rankings in admin panel
5. **Export Results**: Download results as Excel

---

## Development Commands

### Backend
```bash
cd backend
npm run dev        # Start dev server
npm start          # Start production server
npm run init-db    # Initialize database
npm run seed       # Seed questions
```

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## File Locations

```
Important files to know:

backend/.env                    ← Database credentials
backend/database/seed.sql       ← Questions to customize
backend/server.js               ← Main server file

frontend/.env                   ← API URL configuration
frontend/src/pages/             ← UI pages
frontend/src/services/api.js    ← API integration
```

---

## Default Ports

- Backend: `5000`
- Frontend: `5173`
- PostgreSQL: `5432`

---

## Admin Features

✅ Upload teams from Excel  
✅ View all teams  
✅ See live leaderboard  
✅ Export results  
✅ Delete teams  

## Team Features

✅ Secure login  
✅ 20 random questions  
✅ 30-minute timer  
✅ Auto-save answers  
✅ Instant results  

---

## Need Help?

1. Check `README.md` for detailed documentation
2. Check `DEPLOYMENT.md` for deployment guides
3. Check `EXCEL_TEMPLATE.md` for upload format
4. Review `PROJECT_SUMMARY.md` for full feature list

---

**Ready to host your competition? Let's go! 🚀**
