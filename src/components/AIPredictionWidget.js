import React from 'react';
import { Cpu, TrendingUp, AlertOctagon } from 'lucide-react';
import './StatsCard.css';

const AIPredictionWidget = () => {
    return (
        <div className="stats-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(71, 85, 105, 0.05))', border: '1px solid var(--color-primary)' }}>
            <div className="stats-header" style={{ marginBottom: '1rem' }}>
                <h3 className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                    <Cpu size={20} /> AI Yield Engine
                </h3>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--color-primary)', color: 'white', borderRadius: '12px' }}>LIVE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Yield Forecast (30d)</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        94% <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 400 }}>(±2%)</span>
                    </div>
                </div>

                <div>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Failure Probability</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                        Low
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <TrendingUp size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span>Based on current humidity trends, expect <strong>+10% faster growth</strong> for Leafy Greens this week.</span>
                </div>
            </div>
        </div>
    );
};

export default AIPredictionWidget;
