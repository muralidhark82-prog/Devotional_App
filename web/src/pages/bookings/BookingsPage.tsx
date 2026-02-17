import { useState } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import styles from './BookingsPage.module.css';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
    id: string;
    serviceType: string;
    serviceName: string;
    date: string;
    time: string;
    status: BookingStatus;
    provider?: {
        name: string;
        phone: string;
    };
    address: string;
}

const mockBookings: Booking[] = [
    {
        id: '1',
        serviceType: 'HomamYagam',
        serviceName: 'Ganapathi Homam',
        date: '2026-02-15',
        time: '09:00 AM',
        status: 'upcoming',
        provider: { name: 'Pandit Sharma', phone: '+91 98765 43210' },
        address: '123 Temple Street, Hyderabad',
    },
    {
        id: '2',
        serviceType: 'HomePooja',
        serviceName: 'Satyanarayan Pooja',
        date: '2026-02-20',
        time: '10:30 AM',
        status: 'upcoming',
        provider: { name: 'Acharya Joshi', phone: '+91 98765 43211' },
        address: '123 Temple Street, Hyderabad',
    },
    {
        id: '3',
        serviceType: 'HomePooja',
        serviceName: 'Griha Pravesh Pooja',
        date: '2026-01-25',
        time: '08:00 AM',
        status: 'completed',
        provider: { name: 'Pandit Verma', phone: '+91 98765 43212' },
        address: '456 New Colony, Hyderabad',
    },
    {
        id: '4',
        serviceType: 'HomamYagam',
        serviceName: 'Navagraha Homam',
        date: '2026-01-10',
        time: '06:00 AM',
        status: 'cancelled',
        address: '123 Temple Street, Hyderabad',
    },
];

const statusConfig = {
    upcoming: { label: 'Upcoming', color: '#ff6b00', icon: Clock },
    completed: { label: 'Completed', color: '#28a745', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: '#dc3545', icon: AlertCircle },
};

export default function BookingsPage() {
    const [filter, setFilter] = useState<'all' | BookingStatus>('all');

    const filteredBookings = filter === 'all' 
        ? mockBookings 
        : mockBookings.filter(b => b.status === filter);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Bookings</h1>
                <p className={styles.subtitle}>View and manage your bookings</p>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filters}>
                {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
                    <button
                        key={status}
                        className={`${styles.filterBtn} ${filter === status ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status === 'all' ? 'All' : statusConfig[status].label}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className={styles.bookingsList}>
                {filteredBookings.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Calendar size={48} />
                        <h3>No bookings found</h3>
                        <p>You don't have any {filter !== 'all' ? filter : ''} bookings yet.</p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const StatusIcon = statusConfig[booking.status].icon;
                        return (
                            <div key={booking.id} className={styles.bookingCard}>
                                <div className={styles.bookingHeader}>
                                    <div className={styles.serviceInfo}>
                                        <span className={styles.serviceType}>{booking.serviceType.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <h3>{booking.serviceName}</h3>
                                    </div>
                                    <div 
                                        className={styles.statusBadge}
                                        style={{ background: `${statusConfig[booking.status].color}15`, color: statusConfig[booking.status].color }}
                                    >
                                        <StatusIcon size={14} />
                                        {statusConfig[booking.status].label}
                                    </div>
                                </div>

                                <div className={styles.bookingDetails}>
                                    <div className={styles.detailItem}>
                                        <Calendar size={16} />
                                        <span>{formatDate(booking.date)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <Clock size={16} />
                                        <span>{booking.time}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <MapPin size={16} />
                                        <span>{booking.address}</span>
                                    </div>
                                    {booking.provider && (
                                        <div className={styles.detailItem}>
                                            <User size={16} />
                                            <span>{booking.provider.name}</span>
                                        </div>
                                    )}
                                </div>

                                {booking.status === 'upcoming' && (
                                    <div className={styles.bookingActions}>
                                        <button className={styles.rescheduleBtn}>Reschedule</button>
                                        <button className={styles.cancelBtn}>Cancel</button>
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
