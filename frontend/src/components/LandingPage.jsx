import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      background: 'var(--bg-page)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center',
        maxWidth: '640px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Product name */}
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'var(--text-primary)',
          margin: '0 0 1.25rem',
        }}>
          ReMind
        </h1>

        {/* Single tagline */}
        <p style={{
          fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          margin: '0 0 2.5rem',
          fontWeight: 400,
        }}>
          Pick up exactly where you left off.
          <br />
          <span style={{ color: 'var(--text-muted)' }}>
            Local AI resumption for developers.
          </span>
        </p>

        {/* Single CTA */}
        <button
          onClick={onLaunchApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            color: '#FFFFFF',
            background: 'var(--accent-blue)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.3)';
          }}
        >
          <span>Open Dashboard</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Footer hint */}
      <p style={{
        position: 'absolute',
        bottom: '2rem',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        letterSpacing: '0.01em',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease 0.4s',
      }}>
        100% local &middot; Ollama + Gemma 2 &middot; Zero cloud
      </p>
    </div>
  );
}
