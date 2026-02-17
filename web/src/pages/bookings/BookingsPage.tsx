import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Loader, ClipboardList } from 'lucide-react';
import { serviceRequestApi } from '../../services/api';
import styles from './BookingsPage.module.css';

const SERVICE_LABELS: Record<string, string> = {
    HomamYagam: 'Homam & Yagam',
    HomePooja: 'Home Pooja',
    PoojaSamagri: 'Pooja Samagri',
    FamilyConnect: 'Family Connect',
};

type FilterStatus = 'all' | 'PENDING' | 'ACCEPTED' | 'COMPLETED';

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    PENDING: { label: 'Pending', color: '#ff6b00', icon: Clock },
    ACCEPTED: { label: 'Accepted', color: '#007bff', icon: User },
    COMPLETED: { label: 'Completed', color: '#28a745', icon: CheckCircle },
    DECLINED: { label: 'Declined', color: '#dc3545', icon: AlertCircle },
    WITHDRAWN: { label: 'Withdrawn', color: '#6c757d', icon: AlertCircle },
};

interface ServiceRequest {
    id: string;
    serviceType: string;
    date: string;
    time: string;
    location: string | null;
    notes: string | null;
    status: string;
    provider: {
        profile: { fullName: string } | null;
        email: string | null;
        phone: string | null;
    } | null;
}

export default function BookingsPage() {
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await serviceRequestApi.getAll();
                setRequests(data.data);
            } catch (err) {
                console.error('Failed to fetch bookings', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter((r) => r.status === filter);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        });

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <Loader size={32} />
                    <p>Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Bookings</h1>
                <p className={styles.subtitle}>View your service requests and their status</p>
            </div>

            <div className={styles.filters}>
                {([
                    { key: 'all', label: 'All' },
                    { key: 'PENDING', label: 'Pending' },
                    { key: 'ACCEPTED', label: 'Accepted' },
                    { key: 'COMPLETED', label: 'Completed' },
                ] as { key: FilterStatus; label: string }[]).map((tab) => (
                    <button
                        key={tab.key}
                        className={`${styles.filterBtn} ${filter === tab.key ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.bookingsList}>
                {filteredRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ClipboardList size={48} />
                        <h3>No bookings found</h3>
                        <p>You don't have any {filter !== 'all' ? filter.toLowerCase() : ''} bookings yet.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => {
                        const cfg = statusConfig[req.status] || statusConfig.PENDING;
                        const StatusIcon = cfg.icon;
                        return (
                            <div key={req.id} className={styles.bookingCard}>
                                <div className={styles.bookingHeader}>
                                    <div className={styles.serviceInfo}>
                                        <span className={styles.serviceType}>
                                            {req.serviceType.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <h3>{SERVICE_LABELS[req.serviceType] || req.serviceType}</h3>
                                    </div>
                                    <div
                                        className={styles.statusBadge}
                                        style={{ background: `${cfg.color}15`, color: cfg.color }}
                                    >
                                        <StatusIcon size={14} />
                                        {cfg.label}
                                    </div>
                                </div>

                                <div className={styles.bookingDetails}>
                                    <div className={styles.detailItem}>
                                        <Calendar size={16} />
                                        <span>{formatDate(req.date)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <Clock size={16} />
                                        <span>{req.time}</span>
                                    </div>
                                    {req.location && (
                                        <div className={styles.detailItem}>
                                            <MapPin size={16} />
                                            <span>{req.location}</span>
                                        </div>
                                    )}
                                    {req.provider && (
                                        <div className={styles.detailItem}>
                                            <User size={16} />
                                            <span>{req.provider.profile?.fullName || 'Assigned Provider'}</span>
                                        </div>
                                    )}
                                </div>

                                {req.notes && (
                                    <div className={styles.bookingActions}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            {req.notes}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
