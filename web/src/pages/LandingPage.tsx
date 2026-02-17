import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, Users, Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import styles from './LandingPage.module.css';

export default function LandingPage() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
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
                <nav className={styles.nav}>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">Sign In</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero */}
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    <span className="gradient-text">Sacred Services</span>
                    <br />
                    At Your Doorstep
                </h1>
                <p className={styles.heroSubtitle}>
                    Connect with verified Poojaris, book home rituals, and get authentic religious items delivered to your home.
                </p>
                <div className={styles.heroCta}>
                    <Link to={isAuthenticated ? "/dashboard" : "/login"} className="btn btn-primary">
                        Start Your Journey <ArrowRight size={20} />
                    </Link>
                    <Link to="#services" className="btn btn-secondary">
                        Explore Services
                    </Link>
                </div>
            </section>

            {/* Services */}
            <section id="services" className={styles.services}>
                <h2>Our Services</h2>
                <div className={styles.serviceGrid}>
                    <Link to="/book-service?type=HomamYagam" className={styles.serviceCard} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className={styles.serviceIcon} style={{ background: '#fff0e6' }}>
                            <Flame color="#ff6b00" size={32} />
                        </div>
                        <h3>Homam & Yagam</h3>
                        <p>Sacred fire rituals performed by experienced poojaris for prosperity and well-being.</p>
                    </Link>
                    <Link to="/book-service?type=HomePooja" className={styles.serviceCard} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className={styles.serviceIcon} style={{ background: '#f5e6e6' }}>
                            <Star color="#8b0000" size={32} />
                        </div>
                        <h3>Home Pooja</h3>
                        <p>Book verified priests for Satyanarayan, Griha Pravesh, and other home ceremonies.</p>
                    </Link>
                    <Link to="/book-service?type=PoojaSamagri" className={styles.serviceCard} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className={styles.serviceIcon} style={{ background: '#e6f5e6' }}>
                            <ShoppingBag color="#28a745" size={32} />
                        </div>
                        <h3>Pooja Samagri</h3>
                        <p>Authentic pooja items, idols, and sacred materials delivered to your doorstep.</p>
                    </Link>
                    <Link to="/household" className={styles.serviceCard} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className={styles.serviceIcon} style={{ background: '#e6e6f5' }}>
                            <Users color="#6b00ff" size={32} />
                        </div>
                        <h3>Family Connect</h3>
                        <p>Create your household and book services together as a family.</p>
                    </Link>
                </div>
            </section>

            {/* Stats */}
            <section className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>500+</span>
                    <span className={styles.statLabel}>Verified Poojaris</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>10,000+</span>
                    <span className={styles.statLabel}>Happy Families</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>50+</span>
                    <span className={styles.statLabel}>Cities Served</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>4.9</span>
                    <span className={styles.statLabel}>Average Rating</span>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerBrand}>
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
                        <span>Swadhrama Parirakshna</span>
                    </div>
                    <p>Protecting Sacred Duty</p>
                </div>
                <div className={styles.footerLinks}>
                    <a href="#">About</a>
                    <a href="#">Services</a>
                    <a href="#">Contact</a>
                    <a href="#">Privacy</a>
                </div>
                <p className={styles.copyright}>© 2024 Swadhrama Parirakshna. All rights reserved.</p>
            </footer>
        </div>
    );
}
