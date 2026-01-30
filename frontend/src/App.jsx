import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import LoginPage from './pages/LoginPage';
import StaffDashboard from './pages/StaffDashboard';
import QueueDashboard from './pages/QueueDashboard';
import PatientsPage from './pages/PatientsPage';
import CalendarPage from './pages/CalendarPage';
import PatientDashboard from './pages/PatientDashboard';
import TreatmentChartingPage from './pages/TreatmentChartingPage';
import BillingPage from './pages/BillingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ReportsPage from './pages/ReportsPage';
import ExpensesPage from './pages/ExpensesPage';
import AdminToolsPage from './pages/AdminToolsPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import DentistAppointmentsPage from './pages/DentistAppointmentsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* ... existing routes ... */}
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={<Navigate to={(() => {
            try {
              const u = JSON.parse(localStorage.getItem('user'));
              return u && u.role ? `/dashboard/${u.role}` : '/login';
            } catch { return '/login'; }
          })()} replace />}
        />
        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'dentist', 'admin', 'manager']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/queue"
          element={
            <ProtectedRoute allowedRoles={['staff', 'dentist', 'admin', 'manager']}>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patients"
          element={
            <ProtectedRoute allowedRoles={['staff', 'dentist', 'admin', 'manager']}>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'dentist', 'staff']}>
              <QueueDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/appointment-schedule"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'dentist', 'staff']}>
              <QueueDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/treatments"
          element={
            <ProtectedRoute allowedRoles={['staff', 'dentist', 'manager', 'admin']}>
              <TreatmentChartingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/billing"
          element={
            <ProtectedRoute allowedRoles={['staff', 'manager', 'admin', 'dentist']}>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/expenses"
          element={
            <ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
              <AdminToolsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/services"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin', 'manager', 'dentist']}>
              <ServiceManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/dentist"
          element={
            <ProtectedRoute allowedRoles={['dentist', 'manager', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/my-appointments"
          element={
            <ProtectedRoute allowedRoles={['dentist']}>
              <DentistAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={['patient', 'admin']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;