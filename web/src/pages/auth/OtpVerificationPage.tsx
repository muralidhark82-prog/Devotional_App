import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import styles from './AuthPages.module.css';

export default function OtpVerificationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const contact = searchParams.get('contact') || '';
    const purpose = searchParams.get('purpose') || 'registration';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { setAuth } = useAuthStore();

    useEffect(() => {
        if (!contact) {
            navigate('/register');
            return;
        }
        const interval = setInterval(() => {
            setResendTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [contact, navigate]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join('');
        if (otpCode.length < 6) return;

        setLoading(true);
        setError('');

        try {
            const response = await authApi.verifyOtp({ contact, otp: otpCode, purpose });
            if (response.data.success) {
                const { user, accessToken, refreshToken } = response.data.data;
                setAuth(user, accessToken, refreshToken);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        try {
            await authApi.sendOtp({ contact, purpose });
            setResendTimer(30);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to resend OTP');
        }
    };

    const maskedContact = contact.includes('@')
        ? `${contact.slice(0, 2)}****@${contact.split('@')[1]}`
        : `${contact.slice(0, 3)}****${contact.slice(-4)}`;

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, color: '#666' }}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className={styles.logo}>
                    <span className={styles.logoIcon}><Mail size={32} /></span>
                </div>

                <h1>Verify Your Email</h1>
                <p className={styles.subtitle}>We sent a 6-digit code to <br /><strong>{maskedContact}</strong></p>

                {error && <div className={styles.error}>{error}</div>}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '24px 0' }}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            style={{
                                width: 48, height: 56, textAlign: 'center', fontSize: 24,
                                fontWeight: 'bold', borderRadius: 8, border: '2px solid #ddd',
                                outline: 'none', transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#e65100'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
                            aria-label={`Digit ${i + 1}`}
                        />
                    ))}
                </div>

                <button
                    className="btn btn-primary btn-full"
                    onClick={() => handleVerify()}
                    disabled={loading || otp.join('').length < 6}
                >
                    {loading ? 'Verifying...' : 'Verify'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem' }}>
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendTimer > 0}
                        style={{
                            background: 'none', border: 'none', cursor: resendTimer > 0 ? 'default' : 'pointer',
                            color: resendTimer > 0 ? '#999' : '#e65100', fontWeight: 600,
                        }}
                    >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                    </button>
                </p>
            </div>
        </div>
    );
}
