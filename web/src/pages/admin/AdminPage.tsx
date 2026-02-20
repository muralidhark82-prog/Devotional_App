import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api';
import styles from './AdminPage.module.css';

interface UserRow {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    fullName: string;
    createdAt: string;
    lastLoginAt: string | null;
}

interface Stats {
    totalUsers: number;
    members: number;
    providers: number;
    activeUsers: number;
    pendingUsers: number;
    totalRequests: number;
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const params: any = {};
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.status = statusFilter;
            if (search) params.search = search;

            const [usersRes, statsRes] = await Promise.all([
                adminApi.getUsers(params),
                adminApi.getStats(),
            ]);
            setUsers(usersRes.data.data.users);
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Failed to load admin data', err);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, statusFilter, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleStatusChange = async (id: string, status: string) => {
        await adminApi.updateUserStatus(id, status);
        fetchData();
    };

    const handleRoleChange = async (id: string, role: string) => {
        await adminApi.updateUserRole(id, role);
        fetchData();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await adminApi.deleteUser(deleteTarget.id);
        setDeleteTarget(null);
        fetchData();
    };

    const statusBadge = (s: string) => {
        const cls = s === 'ACTIVE' ? styles.badgeActive : s === 'PENDING' ? styles.badgePending : styles.badgeSuspended;
        return <span className={`${styles.badge} ${cls}`}>{s}</span>;
    };

    const roleBadge = (r: string) => {
        const cls = r === 'ADMIN' ? styles.badgeAdmin : r === 'PROVIDER' ? styles.badgeProvider : styles.badgeMember;
        return <span className={`${styles.badge} ${cls}`}>{r}</span>;
    };

    if (loading) return <div className={styles.page}>Loading...</div>;

    return (
        <div className={styles.page}>
            <h2 style={{ marginBottom: 24 }}>Admin Dashboard</h2>

            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}><div className={styles.statValue}>{stats.totalUsers}</div><div className={styles.statLabel}>Total Users</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{stats.members}</div><div className={styles.statLabel}>Members</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{stats.providers}</div><div className={styles.statLabel}>Providers</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{stats.activeUsers}</div><div className={styles.statLabel}>Active</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{stats.pendingUsers}</div><div className={styles.statLabel}>Pending</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{stats.totalRequests}</div><div className={styles.statLabel}>Service Requests</div></div>
                </div>
            )}

            <div className={styles.toolbar}>
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="MEMBER">Member</option>
                    <option value="PROVIDER">Provider</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>

            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email / Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.fullName || '—'}</td>
                                <td>{u.email || u.phone || '—'}</td>
                                <td>{roleBadge(u.role)}</td>
                                <td>{statusBadge(u.status)}</td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <select
                                            value={u.status}
                                            onChange={(e) => handleStatusChange(u.id, e.target.value)}
                                            aria-label={`Change status for ${u.fullName}`}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="SUSPENDED">Suspend</option>
                                            <option value="PENDING">Pending</option>
                                        </select>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            aria-label={`Change role for ${u.fullName}`}
                                        >
                                            <option value="MEMBER">Member</option>
                                            <option value="PROVIDER">Provider</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => setDeleteTarget(u)}
                                            aria-label={`Delete ${u.fullName}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {deleteTarget && (
                <div className={styles.confirmOverlay}>
                    <div className={styles.confirmDialog}>
                        <h3>Delete User</h3>
                        <p>Are you sure you want to delete <strong>{deleteTarget.fullName || deleteTarget.email}</strong>? This cannot be undone.</p>
                        <div className={styles.confirmActions}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className={styles.dangerBtn} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
