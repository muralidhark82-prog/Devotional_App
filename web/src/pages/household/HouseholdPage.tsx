import { Home, MapPin, UserPlus, MoreVertical, LogOut, Repeat } from 'lucide-react';
import styles from './HouseholdPage.module.css';

export default function HouseholdPage() {
    const household = {
        name: 'Sharma Family',
        address: '123 Temple Street, Hyderabad, Telangana - 500001',
        members: [
            { id: '1', name: 'Ramesh Sharma', role: 'HEAD', isHead: true },
            { id: '2', name: 'Sunita Sharma', role: 'ADULT' },
            { id: '3', name: 'Priya Sharma', role: 'ADULT' },
            { id: '4', name: 'Arjun Sharma', role: 'CHILD' },
        ],
        invites: [
            { id: '1', contact: '+91 98765 43210', role: 'ADULT' },
        ],
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>My Household</h1>
                <button className={styles.editBtn}>Edit</button>
            </div>

            {/* Household Card */}
            <div className={styles.householdCard}>
                <div className={styles.householdHeader}>
                    <div className={styles.householdIcon}>
                        <Home size={24} />
                    </div>
                    <div className={styles.householdInfo}>
                        <h2>{household.name}</h2>
                        <span>{household.members.length} members</span>
                    </div>
                </div>
                <div className={styles.address}>
                    <MapPin size={16} />
                    <span>{household.address}</span>
                </div>
            </div>

            {/* Members */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Members</h3>
                    <button className={styles.inviteBtn}>
                        <UserPlus size={16} /> Invite
                    </button>
                </div>

                <div className={styles.memberList}>
                    {household.members.map((member) => (
                        <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberAvatar}>
                                {member.name[0]}
                            </div>
                            <div className={styles.memberInfo}>
                                <div className={styles.memberName}>
                                    {member.name}
                                    {member.isHead && <span className={styles.headBadge}>HEAD</span>}
                                </div>
                                <span className={styles.memberRole}>{member.role}</span>
                            </div>
                            {!member.isHead && (
                                <button className={styles.moreBtn}>
                                    <MoreVertical size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Pending Invites */}
            {household.invites.length > 0 && (
                <section className={styles.section}>
                    <h3>Pending Invites</h3>
                    <div className={styles.inviteList}>
                        {household.invites.map((invite) => (
                            <div key={invite.id} className={styles.inviteCard}>
                                <div className={styles.inviteIcon}>📧</div>
                                <div className={styles.inviteInfo}>
                                    <div>{invite.contact}</div>
                                    <span>Invited as {invite.role}</span>
                                </div>
                                <button className={styles.cancelInvite}>×</button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Actions */}
            <section className={styles.actions}>
                <button className={styles.actionBtn}>
                    <Repeat size={18} /> Transfer Head Role
                </button>
                <button className={styles.leaveBtn}>
                    <LogOut size={18} /> Leave Household
                </button>
            </section>
        </>
    );
}
