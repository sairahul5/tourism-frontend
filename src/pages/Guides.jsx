import React, { useState, useEffect } from 'react';
import { getGuides, createGuideBooking } from '../services/api';

function Guides() {
    const [guides, setGuides] = useState([]);
    const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '' });
    const [bookingForm, setBookingForm] = useState(null);
    const [utr, setUtr] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFiltered();
    }, []);

    const fetchFiltered = async () => {
        const params = {};
        if (filters.location) params.location = filters.location;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        const { data } = await getGuides(params);
        setGuides(data);
    };

    const handleBook = async () => {
        if (!bookingForm.date || !bookingForm.hours) {
            alert("Please enter date and hours");
            return;
        }
        if (paymentMethod === 'UPI' && !utr) {
            alert("Please provide the UTR number for UPI payments");
            return;
        }
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            await createGuideBooking({
                date: bookingForm.date,
                hours: bookingForm.hours,
                utrNumber: paymentMethod === 'UPI' ? utr : 'CASH',
                guide: { id: bookingForm.guideId },
                user: { id: user.id }
            });
            alert("Guide Requested! Payment must be verified by the admin.");
            setBookingForm(null);
            setUtr('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to book guide.";
            alert(`🚨 ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 5%' }}>
            
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 16 }}>Find your Local Expert.</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Experience the city through the eyes of a professional.</p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 60, flexWrap: 'wrap', justifyContent: 'center' }}>
                <input type="text" placeholder="Location" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} style={{ width: 'auto', margin: 0 }} />
                <input type="number" placeholder="Min Price/Hr" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} style={{ width: 'auto', margin: 0 }} />
                <input type="number" placeholder="Max Price/Hr" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} style={{ width: 'auto', margin: 0 }} />
                <button onClick={fetchFiltered} className="btn-primary" style={{ padding: '10px 20px', margin: 0 }}>Search</button>
            </div>

            {/* Profile Card Avatar Directory */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
                {guides.map(guide => (
                    <div className="card" key={guide.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', textAlign: 'center', borderRadius: '24px', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease' }}>
                        
                        <div style={{ width: 140, height: 140, borderRadius: '50%', margin: '0 auto 24px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', border: '4px solid #FFF' }}>
                            {guide.imageUrl ? (
                                <img src={`http://localhost:8080${guide.imageUrl}`} alt="Guide Profile" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.9rem', fontWeight: 600 }}>NO PHOTO</div>
                            )}
                        </div>
                        
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>{guide.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: 20 }}>📍 {guide.location}</p>
                        
                        <div style={{ background: '#FAFAFA', padding: '12px 24px', borderRadius: '100px', marginBottom: 24, display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginRight: 4 }}>${guide.pricePerHour}</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ hr</span>
                        </div>

                        <p style={{ marginBottom: 32, fontSize: '0.9rem' }}>
                            <span style={{ padding: '6px 14px', borderRadius: 20, background: guide.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: guide.available ? '#059669' : '#DC2626', fontWeight: 600 }}>
                                {guide.available ? '🟢 Online & Ready' : '🔴 Currently Booked'}
                            </span>
                        </p>
                        
                        {guide.available ? (
                            <button className="btn btn-primary" onClick={() => {
                                const user = JSON.parse(localStorage.getItem('user'));
                                if (!user) {
                                    alert("Account login is required to book a local guide. Please login or register first.");
                                    window.location.href = '/login';
                                } else {
                                    setBookingForm({ guideId: guide.id, date: '', hours: 1 });
                                }
                            }} style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: '1.05rem' }}>
                                Hire Guide
                            </button>
                        ) : (
                            <button className="btn" disabled style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: '1.05rem', background: '#F0F0F0', color: '#A0A0A0', cursor: 'not-allowed', border: 'none' }}>
                                Unavailable
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Apple-Style Glassmorphic Payment Modal Overlay */}
            {bookingForm && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    backdropFilter: 'blur(24px)', 
                    WebkitBackdropFilter: 'blur(24px)',
                    zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: 20,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{ 
                        background: 'var(--surface-color)', 
                        padding: '40px', 
                        borderRadius: '32px', 
                        width: '100%', 
                        maxWidth: '480px', 
                        boxShadow: '0 32px 80px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>Finalize Booking</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Secure your personal guide locally.</p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ background: '#FAFAFA', padding: '12px 16px', borderRadius: 16, border: '1px solid var(--border-light)' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Service Date</label>
                                <input type="date" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, margin: 0, fontSize: '1.1rem', fontWeight: 600, outline: 'none' }} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div style={{ background: '#FAFAFA', padding: '12px 16px', borderRadius: 16, border: '1px solid var(--border-light)' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Block Hours</label>
                                <input type="number" min="1" max="12" value={bookingForm.hours} onChange={e => setBookingForm({...bookingForm, hours: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, margin: 0, fontSize: '1.1rem', fontWeight: 600, outline: 'none' }} />
                            </div>
                        </div>
                        
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Select Payment Network</h3>
                        
                        {/* Interactive Premium Payment Component */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div 
                                onClick={() => setPaymentMethod('UPI')}
                                style={{ padding: '20px 10px', border: paymentMethod === 'UPI' ? '2px solid var(--text-main)' : '2px solid var(--border-light)', borderRadius: 20, cursor: 'pointer', background: paymentMethod === 'UPI' ? '#FAFAFA' : '#FFF', textAlign: 'center', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }}
                            >
                                {paymentMethod === 'UPI' && <div style={{ position: 'absolute', top: 12, right: 12, width: 12, height: 12, background: 'var(--text-main)', borderRadius: '50%' }} />}
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>📱</span>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: paymentMethod === 'UPI' ? 'var(--text-main)' : 'var(--text-muted)' }}>UPI Transfer</span>
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('CASH')}
                                style={{ padding: '20px 10px', border: paymentMethod === 'CASH' ? '2px solid var(--text-main)' : '2px solid var(--border-light)', borderRadius: 20, cursor: 'pointer', background: paymentMethod === 'CASH' ? '#FAFAFA' : '#FFF', textAlign: 'center', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }}
                            >
                                {paymentMethod === 'CASH' && <div style={{ position: 'absolute', top: 12, right: 12, width: 12, height: 12, background: 'var(--text-main)', borderRadius: '50%' }} />}
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>💵</span>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: paymentMethod === 'CASH' ? 'var(--text-main)' : 'var(--text-muted)' }}>Cash on Arrival</span>
                            </div>
                        </div>

                        {/* Smooth Transitioning Drawer for the UPI Scanner */}
                        <div style={{ 
                            overflow: 'hidden', 
                            transition: 'max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, margin 0.5s ease', 
                            maxHeight: paymentMethod === 'UPI' ? '600px' : '0px', 
                            opacity: paymentMethod === 'UPI' ? 1 : 0,
                            marginBottom: paymentMethod === 'UPI' ? 32 : 0
                        }}>
                            <div style={{ background: '#F5F5F7', padding: '32px 24px', borderRadius: 24, textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 500 }}>Scan QR to securely authorize funds.</p>
                                <div style={{ background: '#FFF', padding: 16, display: 'inline-block', borderRadius: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=guide${bookingForm.guideId}@upi&pn=Guide`} alt="UPI Target" style={{ display: 'block' }} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        placeholder="ENTER 12-DIGIT UTR" 
                                        value={utr} 
                                        onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))} 
                                        style={{ width: '100%', background: '#FFF', border: '1px solid var(--border-light)', borderRadius: 16, textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', padding: '16px', margin: 0, outline: 'none', transition: 'box-shadow 0.2s ease' }} 
                                        onFocus={e => e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.05)'}
                                        onBlur={e => e.target.style.boxShadow = 'none'}
                                    />
                                    {utr.length === 12 && (
                                        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#10B981' }}>✔️</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                            <button className="btn btn-primary" onClick={handleBook} disabled={loading} style={{ flex: 2, padding: '18px', fontSize: '1.1rem', borderRadius: 16 }}>
                                {loading ? 'Processing...' : 'Authorize Request'}
                            </button>
                            <button className="btn" onClick={() => setBookingForm(null)} style={{ flex: 1, padding: '18px', fontSize: '1.1rem', borderRadius: 16, background: '#F0F0F0', border: 'none', color: '#555', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Guides;
