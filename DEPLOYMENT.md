# Deployment Guide - MCQ Competition Platform

Complete deployment instructions for various hosting platforms.

## Table of Contents
- [Railway Deployment](#railway-deployment)
- [Render Deployment](#render-deployment)
- [VPS Deployment](#vps-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)

---

## Railway Deployment

### 1. Deploy Database

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Add PostgreSQL
railway add --plugin postgresql
```

### 2. Deploy Backend

```bash
cd backend

# Create Railway service
railway init

# Set environment variables
railway variables set JWT_SECRET="your-secret-key"
railway variables set ADMIN_USERNAME="admin"
railway variables set ADMIN_PASSWORD="admin123"
railway variables set NODE_ENV="production"

# Deploy
railway up

# Initialize database (one-time)
railway run npm run init-db
railway run npm run seed

# Get backend URL
railway domain
```

### 3. Deploy Frontend

```bash
cd ../frontend

# Update .env with backend URL
echo "VITE_API_URL=https://your-backend.railway.app/api" > .env

# Create Railway service
railway init

# Deploy
railway up
```

---

## Render Deployment

### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "PostgreSQL"
3. Name: `mcq-competition-db`
4. Plan: Free
5. Create Database
6. Copy the **Internal Database URL**

### 2. Deploy Backend

1. Click "New" → "Web Service"
2. Connect your Git repository
3. Settings:
   - **Name**: mcq-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Add Environment Variables:
   ```
   DB_HOST=<from database internal url>
   DB_PORT=5432
   DB_NAME=<from database internal url>
   DB_USER=<from database internal url>
   DB_PASSWORD=<from database internal url>
   JWT_SECRET=your-random-secret-key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

5. Deploy

6. Run one-time commands via Shell:
   ```bash
   npm run init-db
   npm run seed
   ```

### 3. Deploy Frontend

1. Click "New" → "Static Site"
2. Connect your Git repository
3. Settings:
   - **Name**: mcq-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist

4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

5. Deploy

---

## VPS Deployment (Ubuntu 22.04)

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### 2. Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mcq_competition;
CREATE USER mcq_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE mcq_competition TO mcq_user;
\q
```

### 3. Clone and Setup Application

```bash
# Create directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone <your-repo-url> H2O
sudo chown -R $USER:$USER H2O

# Setup backend
cd H2O/backend
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcq_competition
DB_USER=mcq_user
DB_PASSWORD=your-secure-password
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://your-domain.com
EOF

# Initialize database
npm run init-db
npm run seed

# Start with PM2
pm2 start server.js --name mcq-backend
pm2 save
pm2 startup
```

### 4. Build Frontend

```bash
cd /var/www/H2O/frontend

# Create .env file
echo "VITE_API_URL=http://your-domain.com/api" > .env

# Install and build
npm install
npm run build
```

### 5. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/mcq-competition
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/H2O/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mcq-competition /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is automatic with certbot
```

### 7. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Docker Deployment

### 1. Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### 2. Create Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: mcq_competition
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mcq-network

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: mcq_competition
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_USERNAME: ${ADMIN_USERNAME}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      NODE_ENV: production
      FRONTEND_URL: http://localhost
    depends_on:
      - postgres
    networks:
      - mcq-network

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:5000/api
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - mcq-network

volumes:
  postgres_data:

networks:
  mcq-network:
    driver: bridge
```

### 4. Deploy with Docker Compose

```bash
# Create .env file
cat > .env << EOF
DB_PASSWORD=your-secure-password
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF

# Build and start
docker-compose up -d

# Initialize database (one-time)
docker-compose exec backend npm run init-db
docker-compose exec backend npm run seed

# View logs
docker-compose logs -f
```

---

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcq_competition
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_random_secret_key_min_32_chars

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## Post-Deployment Checklist

- [ ] Database initialized and seeded
- [ ] Backend server running
- [ ] Frontend deployed and accessible
- [ ] Admin login works
- [ ] Team upload works
- [ ] Quiz flow works end-to-end
- [ ] SSL certificate installed (production)
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Monitoring setup

---

## Monitoring & Maintenance

### PM2 Commands

```bash
# View logs
pm2 logs mcq-backend

# Restart
pm2 restart mcq-backend

# Status
pm2 status

# Monitor
pm2 monit
```

### Database Backup

```bash
# Backup
pg_dump -U postgres mcq_competition > backup.sql

# Restore
psql -U postgres mcq_competition < backup.sql
```

### Update Application

```bash
# Pull latest code
cd /var/www/H2O
git pull

# Update backend
cd backend
npm install
pm2 restart mcq-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs mcq-backend

# Check database connection
psql -U postgres -d mcq_competition

# Verify environment variables
cat .env
```

### Frontend shows API errors
- Check CORS settings in backend
- Verify API URL in frontend .env
- Check Nginx proxy configuration

### Database connection fails
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials
- Verify network connectivity

---

**Need help?** Create an issue in the repository with deployment details.
