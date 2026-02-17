import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, Flame, ShoppingBag, Calendar, User, Bell, LogOut, Users, Menu, X, Landmark, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { notificationApi } from '../services/api';
import styles from './AppLayout.module.css';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, clearAuth } = useAuthStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        clearAuth();
        navigate('/');
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await notificationApi.getAll();
            setNotifications(data.data.notifications);
            setUnreadCount(data.data.unreadCount);
        } catch (err) {
            // silently fail
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // poll every 15s
        return () => clearInterval(interval);
    }, []);

    // Close notification dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        setShowProfileMenu(false);
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            // silently fail
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.read) {
            try {
                await notificationApi.markAsRead(notif.id);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                );
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch (err) {
                // silently fail
            }
        }
        setShowNotifications(false);
    };

    const memberNavItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/book-service', icon: Flame, label: 'Services' },
        { path: '/shop', icon: ShoppingBag, label: 'Pooja Store' },
        { path: '/bookings', icon: Calendar, label: 'My Bookings' },
        { path: '/temple-visits', icon: Landmark, label: 'Temple Visits' },
        { path: '/household', icon: Users, label: 'Household' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    const providerNavItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/service-requests', icon: ClipboardList, label: 'Service Requests' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    const navItems = user?.role === 'PROVIDER' ? providerNavItems : memberNavItems;

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className={styles.container}>
            {showMobileMenu && (
                <div className={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />
            )}

            <aside className={`${styles.sidebar} ${showMobileMenu ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>
                            <video
                                autoPlay loop muted playsInline
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

            <main className={styles.main}>
                <header className={styles.header}>
                    <button className={styles.mobileMenuBtn} onClick={() => setShowMobileMenu(true)}>
                        <Menu size={24} />
                    </button>
                    <div className={styles.mobileLogo}>
                        <span className={styles.logoIcon}>
                            <video
                                autoPlay loop muted playsInline
                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                            >
                                <source src="/assets/videos/Homam.mp4" type="video/mp4" />
                            </video>
                        </span>
                        <span>Swadhrama</span>
                    </div>
                    <div className={styles.headerActions}>
                        <div className={styles.notifWrapper} ref={notifRef}>
                            <button className={styles.iconBtn} onClick={handleBellClick}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className={styles.notifBadge}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className={styles.notifDropdown}>
                                    <div className={styles.notifHeader}>
                                        <span>Notifications</span>
                                        {unreadCount > 0 && (
                                            <button className={styles.markAllRead} onClick={handleMarkAllRead}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.notifList}>
                                        {notifications.length === 0 ? (
                                            <div className={styles.notifEmpty}>No notifications</div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={notif.read ? styles.notifItem : styles.notifItemUnread}
                                                    onClick={() => handleNotificationClick(notif)}
                                                >
                                                    <div className={styles.notifTitle}>{notif.title}</div>
                                                    <div className={styles.notifMessage}>{notif.message}</div>
                                                    <div className={styles.notifTime}>{timeAgo(notif.createdAt)}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.profileWrapper}>
                            <button
                                className={styles.avatar}
                                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
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
