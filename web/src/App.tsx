import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import HouseholdPage from './pages/household/HouseholdPage';
import BookServicePage from './pages/BookServicePage';
import BookingsPage from './pages/bookings/BookingsPage';
import TempleVisitsPage from './pages/temple-visits/TempleVisitsPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with sidebar layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/household" element={<HouseholdPage />} />
                <Route path="/book-service" element={<BookServicePage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/temple-visits" element={<TempleVisitsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    );
}

export default App;
