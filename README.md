# AttendX — Smart Code-Based Attendance Management System

<p align="center">
  <img src="AttendX Logo.png" alt="AttendX Logo" width="220" />
</p>

AttendX is a modern, responsive, full-stack college attendance management platform designed to automate and secure student presence tracking in real-time. Built for colleges and universities, it replaces traditional manual roll calls with an automated system.

---

## 🌟 Use & Importance

### Core Use Case
AttendX acts as a unified platform where:
* **Administrators** manage institutional metadata (departments, semesters, sections, subjects, timetables, and student/faculty assignments).
* **Faculty Members** start lectures and display live, rotating attendance codes on classroom screens.
* **Students** log into their portal and submit active codes to mark themselves present.
* **Substitution Workflows** allow faculty to request and approve substitutes, ensuring lectures continue without disrupting data logging.

---

### 🛡️ Why AttendX is Essential (Importance)

1. **Proxy Prevention (Secure 6-Digit Codes)**
   Traditional static QR codes can easily be photographed, shared in group chats, or scanned remotely. AttendX solves this by using **randomly generated 6-digit alphanumeric codes** (e.g., `5e22fe`) that rotate on an administrative timer (defaulting to every 30 seconds). Students must input the code live during the active window.

2. **High Availability Fallback Store**
   To prevent system downtime in case of remote database connectivity (such as Supabase PostgreSQL) dropouts, the backend contains an **automated database fallback mechanism**. If the PostgreSQL database is unreachable, the system gracefully switches to an in-memory mock store, keeping classroom operations running without data blockages.

3. **Real-Time Feedback (WebSockets)**
   As soon as a student inputs the active code, their roll number and name are instantly broadcast to the faculty’s screen via WebSockets (Socket.io). Teachers see live attendance rates and present counts update instantly.

4. **Defaulter & Compliance Alerts**
   The system calculates attendance rates automatically. Students whose attendance falls below the custom institutional threshold (configured in the Admin Settings panel) receive alert notifications on their dashboard indicating the number of lectures they must attend to restore compliance.

---

## 🛠️ Technical Stack

* **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide icons, shadcn/ui.
* **Backend**: Express.js, TypeScript, Socket.io, Node-Postgres.
* **Database**: PostgreSQL (Supabase ready).
* **Deployment**: Docker, Docker Compose.

---

## 🚀 Getting Started

### Local Setup

#### 1. Backend Server
```bash
cd backend
npm install
npm run dev
```
*Exposes the HTTP API and WebSocket server on `http://localhost:5000`.*

#### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Launches the dashboard on `http://localhost:3000`.*

---

### 🐳 Docker Compose Quickstart
Run the entire stack (PostgreSQL database, Express.js API, Next.js dashboard, and socket server) in a containerized environment:

```bash
docker-compose up --build
```
* **Frontend Dashboard**: `http://localhost:3000`
* **API Endpoint**: `http://localhost:5000`
* **Database Port**: `localhost:5432`

---

### 🔑 Seed Login Accounts (Demo)

* **Admin Portal**:
  * Email: `admin@attendx.edu`
  * Password: `admin123`
* **Faculty Portal**:
  * Email: `dr.kumar@attendx.edu`
  * Password: `faculty123`
* **Student Portal**:
  * Email: `rahul.me3a@attendx.edu`
  * Password: `student123`
