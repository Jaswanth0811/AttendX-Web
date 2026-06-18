# Deploying AttendX to Supabase & Production

This guide outlines the step-by-step process of deploying the **AttendX** database to **Supabase (PostgreSQL)**, connecting the Express backend, and hosting the application services in production.

---

## 🛠️ Step 1: Provision Supabase PostgreSQL Database

Supabase provides a hosted PostgreSQL database that we will connect to using standard connection URLs.

1. **Sign Up / Log In**: Go to [supabase.com](https://supabase.com) and log in.
2. **Create Project**:
   * Click **New Project** and select your organization.
   * Enter a project name (e.g., `AttendX`).
   * Choose a secure **Database Password** (save this password safely; you will need it for the connection string).
   * Choose the hosting region closest to your users.
   * Click **Create new project** and wait a few minutes for provisioning to complete.

---

## 🗄️ Step 2: Seed the Database Schema

Once your project is active, you need to execute the database schemas to build table structures and default system values.

1. **Open SQL Editor**: In the left sidebar of your Supabase dashboard, click the **SQL Editor** tab (represented by a query terminal icon `SQL`).
2. **Create New Query**: Click **New query** to open a blank editor.
3. **Copy Schema SQL**:
   * Open [database/schema.sql](database/schema.sql) in your repository editor.
   * Copy the entire text contents.
   * Paste it into the Supabase SQL editor window.
4. **Execute**: Click **Run** in the bottom right corner of the SQL editor.
   * Verify that the logs report success and that all core tables (`users`, `attendance_sessions`, `student_profiles`, `faculty_profiles`, etc.) are created.
5. **(Optional) Seed Demo Data**:
   * Open [database/seed.sql](database/seed.sql), copy its contents, paste them into a new query window, and click **Run**. This inserts sample departments, semesters, sections, subjects, and timetables for direct testing.

---

## 🔌 Step 3: Connect Express Backend to Supabase

The Express backend connects to your database using the `DATABASE_URL` environment variable.

1. **Retrieve Connection String**:
   * In the Supabase sidebar, click the gear icon to go to **Project Settings** > **Database**.
   * Scroll down to the **Connection string** section.
   * Copy the **URI** format.
   * Replace `[YOUR-PASSWORD]` in the string with the actual Database Password you chose in Step 1.
   * *Example URI*: `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`

2. **Configure Environment Variables**:
   * Create or update the `.env` file inside your backend directory (`backend/.env`):
     ```env
     PORT=5000
     JWT_SECRET=your_super_secret_jwt_key_here
     DATABASE_URL=postgresql://postgres.yourprojectref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   * When you launch the backend with `npm run dev` or inside Docker, the terminal log will print:
     `Database: Connected to PostgreSQL successfully.`
     (indicating the backend has successfully bypassed fallback memory mode and is reading/writing to your active Supabase instance).

---

## 🌐 Step 4: Host Backend & Frontend Services

Supabase hosts the database, but you need platforms to run your server and website logic.

### Option A: Deploying using Render (Recommended & Free Tier)

#### 1. Deploy the Backend (API & Socket Server)
1. Log into [render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository `AttendX-Web`.
3. Set the configurations:
   * **Name**: `attendx-backend`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
4. In the **Environment Variables** tab, add:
   * `DATABASE_URL` = *(Your Supabase connection URI)*
   * `JWT_SECRET` = *(Generate a random 32-character key)*
   * `PORT` = `10000` (Render's default)
5. Create the web service. Note the deployed URL (e.g., `https://attendx-backend.onrender.com`).

#### 2. Deploy the Next.js Frontend
1. Create a Render **Web Service** or use **Vercel** (Vercel is highly recommended for hosting Next.js apps).
2. For Vercel:
   * Connect your GitHub repo, select the `frontend` folder as the root directory.
   * In Environment variables, set:
     * `NEXT_PUBLIC_API_URL` = `https://attendx-backend.onrender.com` (Your backend Render URL)
   * Deploy!

---

### Option B: Deploying using Docker (Self-Hosted VPS)

If you host the application on your own virtual private server (e.g. DigitalOcean, AWS EC2):

1. **Install Docker** and Docker Compose on the host machine.
2. Update the `docker-compose.yml` file to point `backend` to Supabase:
   * Remove the `db` service container.
   * Change `DATABASE_URL` environment key in the `backend` environment block to point to your Supabase connection string.
3. Run the deployment daemon:
   ```bash
   docker-compose up -d --build
   ```
