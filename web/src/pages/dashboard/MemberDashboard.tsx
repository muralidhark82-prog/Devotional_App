import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './DashboardPage.module.css';

export default function MemberDashboard() {
    const { user } = useAuthStore();

    return (
        <>
            {/* Welcome Banner */}
            <div className={styles.welcomeBanner}>
                <div>
                    <h2>Welcome back, {user?.profile?.fullName?.split(' ')[0] || 'User'}! 🙏</h2>
                    <p>What devotional service do you need today?</p>
                </div>
            </div>

            {/* Quick Actions */}
            <section className={styles.section}>
                <h3>Quick Services</h3>
                <div className={styles.quickActions}>
                    <Link to="/book-service?type=HomamYagam" className={styles.actionCard} style={{ background: '#fff0e6', textDecoration: 'none', color: 'inherit' }}>
                        <Flame color="#ff6b00" size={32} />
                        <span>Homam & Yagam</span>
                    </Link>
                    <Link to="/book-service?type=HomePooja" className={styles.actionCard} style={{ background: '#f5e6e6', textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ fontSize: 24 }}>🕉️</span>
                        <span>Home Pooja</span>
                    </Link>
                    <Link to="/book-service?type=PoojaSamagri" className={styles.actionCard} style={{ background: '#e6f5e6', textDecoration: 'none', color: 'inherit' }}>
                        <ShoppingBag color="#28a745" size={32} />
                        <span>Pooja Samagri</span>
                    </Link>
                    <Link to="/household" className={styles.actionCard} style={{ background: '#e6e6f5', textDecoration: 'none', color: 'inherit' }}>
                        <Users color="#6b00ff" size={32} />
                        <span>Family Connect</span>
                    </Link>
                </div>
            </section>

            {/* Upcoming Events */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Upcoming Events</h3>
                    <Link to="/bookings">See All</Link>
                </div>
                <div className={styles.eventCard}>
                    <div className={styles.eventIcon}>🎉</div>
                    <div className={styles.eventInfo}>
                        <h4>Ganesh Chaturthi</h4>
                        <p>Sep 7, 2024 • Home Pooja</p>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                        View
                    </button>
                </div>
            </section>

            {/* Recent Activity */}
            <section className={styles.section}>
                <h3>Recent Activity</h3>
                <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div>
                            <p className={styles.activityText}>Booked Satyanarayan Pooja</p>
                            <span className={styles.activityTime}>2 days ago</span>
                        </div>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div>
                            <p className={styles.activityText}>Joined Sharma Household</p>
                            <span className={styles.activityTime}>1 week ago</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
