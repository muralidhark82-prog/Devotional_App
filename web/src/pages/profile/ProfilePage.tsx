import { useState } from 'react';
import { User, Mail, Phone, Calendar, Save, Edit2, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.profile?.fullName || '',
        displayName: user?.profile?.displayName || '',
        dateOfBirth: user?.profile?.dateOfBirth || '',
        placeOfBirth: user?.profile?.placeOfBirth || '',
        timeOfBirth: user?.profile?.timeOfBirth || '',
        gotra: user?.profile?.gotra || '',
        nakshatra: user?.profile?.nakshatra || '',
        rashi: user?.profile?.rashi || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: API call to update profile
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    const handleCancel = () => {
        setFormData({
            fullName: user?.profile?.fullName || '',
            displayName: user?.profile?.displayName || '',
            dateOfBirth: user?.profile?.dateOfBirth || '',
            placeOfBirth: user?.profile?.placeOfBirth || '',
            timeOfBirth: user?.profile?.timeOfBirth || '',
            gotra: user?.profile?.gotra || '',
            nakshatra: user?.profile?.nakshatra || '',
            rashi: user?.profile?.rashi || '',
        });
        setIsEditing(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Profile</h1>
                {!isEditing ? (
                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                        <Edit2 size={18} /> Edit Profile
                    </button>
                ) : (
                    <div className={styles.editActions}>
                        <button className={styles.cancelBtn} onClick={handleCancel}>
                            <X size={18} /> Cancel
                        </button>
                        <button 
                            className={styles.saveBtn} 
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                        {user?.profile?.fullName?.[0] || 'U'}
                    </div>
                    <div className={styles.avatarInfo}>
                        <h2>{user?.profile?.fullName || 'User'}</h2>
                        <span className={styles.role}>{user?.role}</span>
                    </div>
                </div>

                {/* Account Information */}
                <div className={styles.section}>
                    <h3>Account Information</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <Mail size={18} />
                            <div>
                                <label>Email</label>
                                <p>{user?.email}</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Phone size={18} />
                            <div>
                                <label>Phone</label>
                                <p>{user?.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className={styles.section}>
                    <h3>Personal Information</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Full Name *</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p className={styles.value}>{formData.fullName || 'Not provided'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Enter display name"
                                />
                            ) : (
                                <p className={styles.value}>{formData.displayName || 'Not provided'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Date of Birth</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            ) : (
                                <p className={styles.value}>
                                    {formData.dateOfBirth 
                                        ? new Date(formData.dateOfBirth).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })
                                        : 'Not provided'
                                    }
                                </p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Place of Birth</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="placeOfBirth"
                                    value={formData.placeOfBirth}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Enter your place of birth"
                                />
                            ) : (
                                <p className={styles.value}>{formData.placeOfBirth || 'Not provided'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Time of Birth</label>
                            {isEditing ? (
                                <input
                                    type="time"
                                    name="timeOfBirth"
                                    value={formData.timeOfBirth}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            ) : (
                                <p className={styles.value}>{formData.timeOfBirth || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Astrological Information */}
                <div className={styles.section}>
                    <h3>Astrological Information</h3>
                    <p className={styles.sectionDesc}>This helps us provide personalized pooja timings</p>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Gotra</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="gotra"
                                    value={formData.gotra}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Enter your gotra"
                                />
                            ) : (
                                <p className={styles.value}>{formData.gotra || 'Not provided'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nakshatra (Birth Star)</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="nakshatra"
                                    value={formData.nakshatra}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Enter your nakshatra"
                                />
                            ) : (
                                <p className={styles.value}>{formData.nakshatra || 'Not provided'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Rashi (Zodiac Sign)</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="rashi"
                                    value={formData.rashi}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Enter your rashi"
                                />
                            ) : (
                                <p className={styles.value}>{formData.rashi || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
