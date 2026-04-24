import React from 'react';

export const CoverageMap = () => {
    return (
        <div className="glass reveal" style={{ 
            marginTop: '4rem', 
            padding: '4rem 3rem', 
            borderRadius: '40px', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: '800' }}>Sectores de Cobertura</h2>

            <div style={{ 
                maxWidth: '900px', 
                margin: '0 auto',
                borderRadius: '24px', 
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.3)'
            }}>
                <img 
                    src="/mapaCdJuarez.png" 
                    alt="Mapa de Cobertura" 
                    style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block' 
                    }} 
                />
            </div>
        </div>
    );
};
