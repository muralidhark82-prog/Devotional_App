import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, X } from 'lucide-react';
import { authApi } from '../../services/api';
import styles from './AuthPages.module.css';

const registerSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    isProvider: z.boolean().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { isProvider: false },
    });

    const password = watch('password', '');
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
    };

    const onSubmit = async (data: RegisterForm) => {
        if (!data.email && !data.phone) {
            setError('Please provide either email or phone');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authApi.register({
                fullName: data.fullName,
                email: data.email || undefined,
                phone: data.phone ? `+91${data.phone}` : undefined,
                password: data.password,
                role: data.isProvider ? 'PROVIDER' : 'MEMBER',
            });

            if (response.data.success) {
                // Navigate to OTP verification
                navigate('/login'); // TODO: Navigate to OTP verification
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
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
                </div>

                <h1>Create Account</h1>
                <p className={styles.subtitle}>Join our sacred community</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <User className={styles.inputIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="input"
                            {...register('fullName')}
                        />
                        {errors.fullName && (
                            <span className={styles.inputError}>{errors.fullName.message}</span>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <Mail className={styles.inputIcon} size={20} />
                        <input
                            type="email"
                            placeholder="Email (optional)"
                            className="input"
                            {...register('email')}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Phone className={styles.inputIcon} size={20} />
                        <span className={styles.phonePrefix}>+91</span>
                        <input
                            type="tel"
                            placeholder="Phone (optional)"
                            className="input"
                            style={{ paddingLeft: '80px' }}
                            {...register('phone')}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.inputIcon} size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="input"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className={styles.requirements}>
                        <div className={requirements.length ? styles.met : styles.unmet}>
                            {requirements.length ? <Check size={14} /> : <X size={14} />}
                            8+ characters
                        </div>
                        <div className={requirements.uppercase ? styles.met : styles.unmet}>
                            {requirements.uppercase ? <Check size={14} /> : <X size={14} />}
                            1 uppercase letter
                        </div>
                        <div className={requirements.number ? styles.met : styles.unmet}>
                            {requirements.number ? <Check size={14} /> : <X size={14} />}
                            1 number
                        </div>
                    </div>

                    <label className={styles.providerToggle}>
                        <input type="checkbox" {...register('isProvider')} />
                        <span>I am a Service Provider (Poojari, Astrologer, Store)</span>
                    </label>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className={styles.terms}>
                    By signing up, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>
                </p>

                <p className={styles.footer}>
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
