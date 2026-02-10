import { useState } from 'react';
import { Bell, Calendar, CheckCircle, Clock, MapPin, User, X, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './ProviderDashboardPage.module.css';

interface BookingRequest {
    id: string;
    memberName: string;
    memberPhone: string;
    serviceType: string;
    serviceName: string;
    requestedDate: string;
    requestedTime: string;
    address: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

interface ScheduledService {
    id: string;
    memberName: string;
    serviceType: string;
    serviceName: string;
    date: string;
    time: string;
    address: string;
}

const mockRequests: BookingRequest[] = [
    {
        id: '1',
        memberName: 'Ramesh Kumar',
        memberPhone: '+91 98765 43210',
        serviceType: 'HomamYagam',
        serviceName: 'Ganapathi Homam',
        requestedDate: '2026-02-20',
        requestedTime: '09:00 AM',
        address: '123 Temple Street, Hyderabad, Telangana',
        status: 'pending',
        createdAt: '2026-02-10T10:30:00',
    },
    {
        id: '2',
        memberName: 'Sunita Sharma',
        memberPhone: '+91 98765 43211',
        serviceType: 'HomePooja',
        serviceName: 'Satyanarayan Pooja',
        requestedDate: '2026-02-22',
        requestedTime: '10:30 AM',
        address: '456 New Colony, Hyderabad, Telangana',
        status: 'pending',
        createdAt: '2026-02-10T11:00:00',
    },
];

const mockScheduled: ScheduledService[] = [
    {
        id: '3',
        memberName: 'Priya Reddy',
        serviceType: 'HomePooja',
        serviceName: 'Griha Pravesh Pooja',
        date: '2026-02-15',
        time: '08:00 AM',
        address: '789 Lake View, Hyderabad',
    },
];

export default function ProviderDashboardPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<BookingRequest[]>(mockRequests);
    const [scheduled, setScheduled] = useState<ScheduledService[]>(mockScheduled);
    const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const handleAccept = (requestId: string) => {
        const request = requests.find(r => r.id === requestId);
        if (request) {
            // Add to scheduled
            setScheduled([...scheduled, {
                id: request.id,
                memberName: request.memberName,
                serviceType: request.serviceType,
                serviceName: request.serviceName,
                date: request.requestedDate,
                time: request.requestedTime,
                address: request.address,
            }]);
            // Update request status
            setRequests(requests.map(r => 
                r.id === requestId ? { ...r, status: 'accepted' as const } : r
            ));
            setSelectedRequest(null);
        }
    };

    const handleReject = (requestId: string) => {
        setRequests(requests.map(r => 
            r.id === requestId ? { ...r, status: 'rejected' as const } : r
        ));
        setSelectedRequest(null);
    };

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
        <>
            {/* Welcome Banner */}
            <div className={styles.welcomeBanner}>
                <div>
                    <h2>Welcome back, {user?.profile?.fullName?.split(' ')[0] || 'Provider'}! 🙏</h2>
                    <p>You have {pendingCount} pending service {pendingCount === 1 ? 'request' : 'requests'}</p>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff0e6' }}>
                        <Clock color="#ff6b00" size={24} />
                    </div>
                    <div>
                        <div className={styles.statValue}>{pendingCount}</div>
                        <div className={styles.statLabel}>Pending Requests</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e6f5e6' }}>
                        <CheckCircle color="#28a745" size={24} />
                    </div>
                    <div>
                        <div className={styles.statValue}>{scheduled.length}</div>
                        <div className={styles.statLabel}>Scheduled Services</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e6e6f5' }}>
                        <Calendar color="#6b00ff" size={24} />
                    </div>
                    <div>
                        <div className={styles.statValue}>12</div>
                        <div className={styles.statLabel}>Completed This Month</div>
                    </div>
                </div>
            </div>

            {/* Pending Requests */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Pending Requests</h3>
                    <span className={styles.badge}>{pendingCount}</span>
                </div>
                <div className={styles.requestsList}>
                    {requests.filter(r => r.status === 'pending').length === 0 ? (
                        <div className={styles.emptyState}>
                            <Bell size={32} />
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        requests.filter(r => r.status === 'pending').map((request) => (
                            <div key={request.id} className={styles.requestCard}>
                                <div className={styles.requestHeader}>
                                    <div>
                                        <span className={styles.serviceType}>{request.serviceType.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <h4>{request.serviceName}</h4>
                                    </div>
                                    <span className={styles.newBadge}>New</span>
                                </div>
                                <div className={styles.requestDetails}>
                                    <div className={styles.detailItem}>
                                        <User size={16} />
                                        <span>{request.memberName}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <Calendar size={16} />
                                        <span>{formatDate(request.requestedDate)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <Clock size={16} />
                                        <span>{request.requestedTime}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <MapPin size={16} />
                                        <span>{request.address}</span>
                                    </div>
                                </div>
                                <div className={styles.requestActions}>
                                    <button 
                                        className={styles.viewBtn}
                                        onClick={() => setSelectedRequest(request)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Scheduled Services */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Scheduled Services</h3>
                </div>
                <div className={styles.scheduledList}>
                    {scheduled.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Calendar size={32} />
                            <p>No scheduled services</p>
                        </div>
                    ) : (
                        scheduled.map((service) => (
                            <div key={service.id} className={styles.scheduledCard}>
                                <div className={styles.scheduledIcon}>
                                    <Calendar size={20} />
                                </div>
                                <div className={styles.scheduledInfo}>
                                    <h4>{service.serviceName}</h4>
                                    <p>{service.memberName}</p>
                                    <div className={styles.scheduledMeta}>
                                        <span>{formatDate(service.date)} • {service.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className={styles.modalOverlay} onClick={() => setSelectedRequest(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Service Request Details</h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedRequest(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.modalSection}>
                                <label>Service</label>
                                <p className={styles.modalValue}>{selectedRequest.serviceName}</p>
                            </div>
                            <div className={styles.modalSection}>
                                <label>Member</label>
                                <p className={styles.modalValue}>{selectedRequest.memberName}</p>
                                <p className={styles.modalSubValue}>{selectedRequest.memberPhone}</p>
                            </div>
                            <div className={styles.modalSection}>
                                <label>Date & Time</label>
                                <p className={styles.modalValue}>
                                    {formatDate(selectedRequest.requestedDate)} at {selectedRequest.requestedTime}
                                </p>
                            </div>
                            <div className={styles.modalSection}>
                                <label>Address</label>
                                <p className={styles.modalValue}>{selectedRequest.address}</p>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.acceptBtn}
                                onClick={() => handleAccept(selectedRequest.id)}
                            >
                                <Check size={18} /> Accept
                            </button>
                            <button 
                                className={styles.rescheduleBtn}
                                onClick={() => alert('Reschedule feature coming soon')}
                            >
                                <Calendar size={18} /> Reschedule
                            </button>
                            <button 
                                className={styles.rejectBtn}
                                onClick={() => handleReject(selectedRequest.id)}
                            >
                                <X size={18} /> Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
