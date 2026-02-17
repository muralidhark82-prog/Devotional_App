import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, Flame, ShoppingBag, Calendar, User, Bell, LogOut, Users, Menu, X, Landmark } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import styles from './AppLayout.module.css';

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, clearAuth } = useAuthStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = async () => {
        clearAuth();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/book-service', icon: Flame, label: 'Services' },
        { path: '/shop', icon: ShoppingBag, label: 'Pooja Store' },
        { path: '/bookings', icon: Calendar, label: 'My Bookings' },
        { path: '/temple-visits', icon: Landmark, label: 'Temple Visits' },
        { path: '/household', icon: Users, label: 'Household' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className={styles.container}>
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${showMobileMenu ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                            >
                                <source src="/assets/videos/Homam.mp4" type="video/mp4" />
                            </video>
                        </span>
                        <span>Swadhrama</span>
                    </div>
                    <button className={styles.closeMobileMenu} onClick={() => setShowMobileMenu(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || 
                            (item.path === '/book-service' && location.pathname.startsWith('/book-service'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={isActive ? styles.navItemActive : styles.navItem}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <Icon size={20} /> {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} /> Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <button className={styles.mobileMenuBtn} onClick={() => setShowMobileMenu(true)}>
                        <Menu size={24} />
                    </button>
                    <div className={styles.mobileLogo}>
                        <span className={styles.logoIcon}>
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                            >
                                <source src="/assets/videos/Homam.mp4" type="video/mp4" />
                            </video>
                        </span>
                        <span>Swadhrama</span>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                        </button>
                        <div className={styles.profileWrapper}>
                            <button 
                                className={styles.avatar}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                {user?.profile?.fullName?.[0] || 'U'}
                            </button>
                            {showProfileMenu && (
                                <div className={styles.profileMenu}>
                                    <div className={styles.profileInfo}>
                                        <span className={styles.profileName}>{user?.profile?.fullName || 'User'}</span>
                                        <span className={styles.profileEmail}>{user?.email}</span>
                                    </div>
                                    <div className={styles.menuDivider} />
                                    <Link to="/profile" className={styles.menuItem} onClick={() => setShowProfileMenu(false)}>
                                        <User size={16} /> Profile
                                    </Link>
                                    <button className={styles.menuItemLogout} onClick={handleLogout}>
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
