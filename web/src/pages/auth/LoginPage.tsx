import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import styles from './AuthPages.module.css';

const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(data);
            if (response.data.success) {
                const { accessToken, refreshToken, user } = response.data.data;
                setAuth(user, accessToken, refreshToken);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Login failed');
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

                <h1>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to your account</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail className={styles.inputIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Email or Phone"
                            className="input"
                            {...register('identifier')}
                        />
                        {errors.identifier && (
                            <span className={styles.inputError}>{errors.identifier.message}</span>
                        )}
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
                        {errors.password && (
                            <span className={styles.inputError}>{errors.password.message}</span>
                        )}
                    </div>

                    <div className={styles.formOptions}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>or continue with</span>
                </div>

                <div className={styles.socialButtons}>
                    <button className={styles.socialBtn}>
                        <span style={{ fontWeight: 'bold' }}>G</span> Google
                    </button>
                    <button className={styles.socialBtn}>
                        Apple
                    </button>
                </div>

                <p className={styles.footer}>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
