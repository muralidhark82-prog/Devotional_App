import { useEffect, useRef, useState } from 'react';

export default function OmChantingPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const startAudio = () => {
            if (audio.paused) {
                audio.play().then(() => setPlaying(true)).catch(() => {});
            }
        };

        startAudio();

        const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll', 'pointerdown'];
        const handler = () => {
            startAudio();
            events.forEach((e) => document.removeEventListener(e, handler));
        };
        events.forEach((e) => document.addEventListener(e, handler, { once: true, passive: true }));

        return () => {
            events.forEach((e) => document.removeEventListener(e, handler));
        };
    }, []);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.play().then(() => setPlaying(true)).catch(() => {});
        }
        setMuted((prev) => {
            audio.muted = !prev;
            return !prev;
        });
    };

    return (
        <>
            <audio ref={audioRef} src="/assets/audio/om-chanting.mpeg" loop autoPlay preload="auto" />

            {!playing && (
                <div
                    onClick={() => {
                        const audio = audioRef.current;
                        if (audio) audio.play().then(() => setPlaying(true)).catch(() => {});
                    }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 10000, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px 40px',
                        textAlign: 'center', maxWidth: '340px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🙏</div>
                        <p style={{
                            fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
                            fontWeight: 600, color: '#2d2d2d', marginBottom: '8px',
                        }}>Om Shanti</p>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            Tap anywhere to begin the sacred Om chanting
                        </p>
                    </div>
                </div>
            )}

            {playing && (
                <button
                    onClick={toggle}
                    aria-label={muted ? 'Unmute Om chanting' : 'Mute Om chanting'}
                    title={muted ? 'Unmute Om chanting' : 'Mute Om chanting'}
                    style={{
                        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
                        width: '44px', height: '44px', borderRadius: '50%', border: 'none',
                        background: 'linear-gradient(135deg, #ff6b00, #8b0000)',
                        color: 'white', fontSize: '20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                >
                    {muted ? '🔇' : '🔊'}
                </button>
            )}
        </>
    );
}
