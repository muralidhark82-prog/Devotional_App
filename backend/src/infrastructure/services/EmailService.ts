import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export class EmailService {
    static async sendOtp(to: string, otp: string, purpose: string): Promise<boolean> {
        const subject = purpose === 'REGISTRATION'
            ? 'Swadhrama - Verify Your Email'
            : purpose === 'PASSWORD_RESET'
                ? 'Swadhrama - Reset Your Password'
                : 'Swadhrama - Your Login OTP';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff8f0; border-radius: 12px;">
                <h2 style="color: #e65100; text-align: center;">🙏 Swadhrama Parirakshna</h2>
                <p style="text-align: center; color: #555;">Your verification code is:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e65100; background: #fff; padding: 12px 24px; border-radius: 8px; border: 2px dashed #e65100;">
                        ${otp}
                    </span>
                </div>
                <p style="text-align: center; color: #888; font-size: 14px;">
                    This code expires in 5 minutes. Do not share it with anyone.
                </p>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: `"Swadhrama" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`[EMAIL] OTP sent to ${to}`);
            return true;
        } catch (error) {
            console.error(`[EMAIL] Failed to send OTP to ${to}:`, error);
            return false;
        }
    }
}
