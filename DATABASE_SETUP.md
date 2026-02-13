# Database Setup Guide

## MySQL Database Setup

### Local Development

1. **Install MySQL**
   - Download and install MySQL from https://dev.mysql.com/downloads/
   - Or use Docker: `docker run --name smartqueue-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=smartqueue -p 3306:3306 -d mysql:8.0`

2. **Create Database**
   ```sql
   CREATE DATABASE smartqueue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Update Environment Variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Update `DATABASE_URL` with your MySQL credentials:
     ```
     DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/smartqueue
     ```

4. **Run Migrations**
   ```bash
   cd backend
   python seed.py
   ```

### Production (Render)

1. **Create MySQL Database on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "MySQL" (or use external MySQL service)
   - Copy the connection string

2. **Set Environment Variable**
   - Go to your backend service → Environment tab
   - Set `DATABASE_URL` to your MySQL connection string
   - Format: `mysql+pymysql://username:password@host:port/database_name`

### Alternative: PostgreSQL

If you prefer PostgreSQL instead of MySQL:

1. Update `DATABASE_URL` in your `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/smartqueue
   ```

2. The application automatically detects and supports both MySQL and PostgreSQL.

## Default Credentials

After running the seed script, you can login with:

**Admin Account:**
- Email: `admin@smartqueue.com`
- Password: `admin123`

**Demo User:**
- Email: `demo@smartqueue.com`
- Password: `demo123`

## Troubleshooting

### Connection Issues
- Ensure MySQL server is running
- Check firewall settings
- Verify credentials in DATABASE_URL

### Migration Issues
- Drop and recreate the database if needed
- Run seed script again: `python backend/seed.py`
