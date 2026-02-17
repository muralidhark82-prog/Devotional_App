import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Check, X, CheckCircle, ClipboardList, Loader } from 'lucide-react';
import { serviceRequestApi } from '../../services/api';
import styles from './ServiceRequestsPage.module.css';

type RequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'WITHDRAWN';

interface ServiceRequest {
    id: string;
    serviceType: string;
    date: string;
    time: string;
    location: string | null;
    notes: string | null;
    status: RequestStatus;
    member: {
        profile: { fullName: string } | null;
    };
}

const SERVICE_LABELS: Record<string, string> = {
    HomamYagam: 'Homam & Yagam',
    HomePooja: 'Home Pooja',
    PoojaSamagri: 'Pooja Samagri',
    FamilyConnect: 'Family Connect',
};

const statusBadgeClass: Record<string, string> = {
    PENDING: styles.badgePending,
    ACCEPTED: styles.badgeAccepted,
    DECLINED: styles.badgeDeclined,
    COMPLETED: styles.badgeCompleted,
    WITHDRAWN: styles.badgeDeclined,
};

export default function ServiceRequestsPage() {
    const [activeTab, setActiveTab] = useState<'all' | RequestStatus>('all');
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const { data } = await serviceRequestApi.getAll();
            setRequests(data.data);
        } catch (err) {
            console.error('Failed to fetch service requests', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (id: string) => {
        setActionLoading(id);
        try {
            await serviceRequestApi.accept(id);
            await fetchRequests();
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to accept');
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (id: string) => {
        setActionLoading(id);
        try {
            await serviceRequestApi.complete(id);
            await fetchRequests();
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to complete');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredRequests = activeTab === 'all'
        ? requests
        : requests.filter((r) => r.status === activeTab);

    const tabs: { key: 'all' | RequestStatus; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'ACCEPTED', label: 'Accepted' },
        { key: 'COMPLETED', label: 'Completed' },
    ];

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <Loader size={32} className="spin" />
                    <p>Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Service Requests</h1>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={activeTab === tab.key ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.requestList}>
                {filteredRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ClipboardList size={48} />
                        <p>No service requests found</p>
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <div key={request.id} className={styles.requestCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.serviceName}>
                                    {SERVICE_LABELS[request.serviceType] || request.serviceType}
                                </span>
                                <span className={statusBadgeClass[request.status] || styles.badge}>
                                    {request.status}
                                </span>
                            </div>

                            <div className={styles.cardDetails}>
                                <div className={styles.detail}>
                                    <User size={16} />
                                    <span>{request.member?.profile?.fullName || 'Unknown'}</span>
                                </div>
                                <div className={styles.detail}>
                                    <Calendar size={16} />
                                    <span>
                                        {new Date(request.date).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })} at {request.time}
                                    </span>
                                </div>
                                {request.location && (
                                    <div className={styles.detail}>
                                        <MapPin size={16} />
                                        <span>{request.location}</span>
                                    </div>
                                )}
                            </div>

                            {request.notes && (
                                <div className={styles.notes}>{request.notes}</div>
                            )}

                            <div className={styles.cardActions}>
                                {request.status === 'PENDING' && (
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={() => handleAccept(request.id)}
                                        disabled={actionLoading === request.id}
                                    >
                                        <Check size={16} />
                                        {actionLoading === request.id ? 'Accepting...' : 'Accept'}
                                    </button>
                                )}
                                {request.status === 'ACCEPTED' && (
                                    <button
                                        className={styles.completeBtn}
                                        onClick={() => handleComplete(request.id)}
                                        disabled={actionLoading === request.id}
                                    >
                                        <CheckCircle size={16} />
                                        {actionLoading === request.id ? 'Completing...' : 'Mark Completed'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
