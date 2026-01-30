# Paradise Dental Clinic Management System

## Overview
A comprehensive management system for Paradise Dental Clinic, featuring a React frontend and Node.js backend.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Headless UI
- **Backend**: Node.js, Express, Sequelize (MySQL/MariaDB)
- **Database**: MariaDB

## Prerequisites
- Node.js (v18 or v20 LTS)
- NPM
- XAMPP (for MariaDB) or local MariaDB installation

## Installation

1. **Clone the repository** (if not already done).

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

## Configuration

1. **Database Setup**:
   - Start MariaDB (via XAMPP or service).
   - Create a database (e.g., `paradise_dental_dev` or `paradisedental`).
   - Configure credentials in `backend/.env` (copy from `.env.example`).

2. **Environment Variables**:
   - Frontend: Copy `frontend/.env.example` to `frontend/.env`.
   - Backend: Copy `backend/.env.example` to `backend/.env`.

## Running the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   Runs on `http://localhost:3000`.

2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Runs on `http://localhost:5173`.

## Folder Structure
- `frontend/`: React application.
- `backend/`: Express API.
- `docs/`: Documentation.
