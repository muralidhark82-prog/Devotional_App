import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './BookServicePage.module.css';

// Service types matching the new naming convention
const SERVICE_TYPES = ['HomamYagam', 'HomePooja', 'PoojaSamagri', 'FamilyConnect'] as const;

// Define the schema for the booking form
const bookingSchema = z.object({
    serviceType: z.enum(SERVICE_TYPES),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookServicePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceTypeParam = searchParams.get('type');
    const [success, setSuccess] = useState(false);

    // Validate if the param is a valid service type, otherwise default to HomamYagam
    const defaultServiceType =
        serviceTypeParam && SERVICE_TYPES.includes(serviceTypeParam as typeof SERVICE_TYPES[number])
            ? (serviceTypeParam as typeof SERVICE_TYPES[number])
            : 'HomamYagam';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            serviceType: defaultServiceType,
        },
    });

    const onSubmit = (data: BookingFormData) => {
        console.log('Booking Data:', data);
        setSuccess(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Schedule a Service</h1>

                {success ? (
                    <div className={styles.success}>
                        <CheckCircle className={styles.successIcon} />
                        <h2 className={styles.successTitle}>Booking Confirmed!</h2>
                        <p className={styles.successText}>Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                        {/* Service Type */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Select Service</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    {...register('serviceType')}
                                    className={styles.select}
                                >
                                    <option value="HomamYagam">Homam & Yagam</option>
                                    <option value="HomePooja">Home Pooja</option>
                                    <option value="PoojaSamagri">Pooja Samagri</option>
                                    <option value="FamilyConnect">Family Connect</option>
                                </select>
                            </div>
                            {errors.serviceType && (
                                <p className={styles.error}>{errors.serviceType.message}</p>
                            )}
                        </div>

                        {/* Date */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date</label>
                            <div className={styles.inputWrapper}>
                                <Calendar className={styles.icon} />
                                <input
                                    type="date"
                                    {...register('date')}
                                    className={styles.input}
                                />
                            </div>
                            {errors.date && (
                                <p className={styles.error}>{errors.date.message}</p>
                            )}
                        </div>

                        {/* Time */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Time</label>
                            <div className={styles.inputWrapper}>
                                <Clock className={styles.icon} />
                                <input
                                    type="time"
                                    {...register('time')}
                                    className={styles.input}
                                />
                            </div>
                            {errors.time && (
                                <p className={styles.error}>{errors.time.message}</p>
                            )}
                        </div>

                        <button type="submit" className={styles.button}>
                            Schedule Service
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
