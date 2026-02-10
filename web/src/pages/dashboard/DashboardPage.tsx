import { useAuthStore } from '../../stores/authStore';
import MemberDashboard from './MemberDashboard';
import ProviderDashboardPage from './ProviderDashboardPage';

export default function DashboardPage() {
    const { user } = useAuthStore();

    // Route to appropriate dashboard based on role
    if (user?.role === 'PROVIDER') {
        return <ProviderDashboardPage />;
    }

    return <MemberDashboard />;
}
