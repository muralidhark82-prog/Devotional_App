import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './TempleVisitsPage.module.css';

const TEMPLES = [
    'Tirumala Tirupati Devasthanam',
    'Meenakshi Amman Temple',
    'Kashi Vishwanath Temple',
    'Jagannath Temple, Puri',
    'Somnath Temple',
    'Ramanathaswamy Temple',
    'Siddhivinayak Temple',
    'Sabarimala Ayyappa Temple',
] as const;

const visitSchema = z.object({
    temple: z.string().min(1, 'Please select a temple'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Preferred time is required'),
    visitors: z.string().min(1, 'Number of visitors is required'),
    notes: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

export default function TempleVisitsPage() {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VisitFormData>({
        resolver: zodResolver(visitSchema),
    });

    const onSubmit = (data: VisitFormData) => {
        console.log('Temple Visit Data:', data);
        setSuccess(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Temple Visits</h1>
                <p className={styles.subtitle}>Book a visit to your favourite temple</p>

                {success ? (
                    <div className={styles.success}>
                        <CheckCircle className={styles.successIcon} />
                        <h2 className={styles.successTitle}>Visit Booked!</h2>
                        <p className={styles.successText}>Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Select Temple</label>
                            <div className={styles.inputWrapper}>
                                <select {...register('temple')} className={styles.select}>
                                    <option value="">Choose a temple...</option>
                                    {TEMPLES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.temple && <p className={styles.error}>{errors.temple.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Visit Date</label>
                            <div className={styles.inputWrapper}>
                                <Calendar className={styles.icon} />
                                <input type="date" {...register('date')} className={styles.input} />
                            </div>
                            {errors.date && <p className={styles.error}>{errors.date.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Preferred Time</label>
                            <div className={styles.inputWrapper}>
                                <Clock className={styles.icon} />
                                <input type="time" {...register('time')} className={styles.input} />
                            </div>
                            {errors.time && <p className={styles.error}>{errors.time.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Number of Visitors</label>
                            <div className={styles.inputWrapper}>
                                <Users className={styles.icon} />
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    placeholder="e.g. 4"
                                    {...register('visitors')}
                                    className={styles.input}
                                />
                            </div>
                            {errors.visitors && <p className={styles.error}>{errors.visitors.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Special Requests (optional)</label>
                            <textarea
                                placeholder="Any special arrangements or notes..."
                                {...register('notes')}
                                className={styles.textarea}
                            />
                        </div>

                        <button type="submit" className={styles.button}>
                            Book Temple Visit
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
