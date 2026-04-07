import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getHomestayById } from '../services/api';

function HomestayDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homestay, setHomestay] = useState(null);
  const [rooms, setRooms] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await getHomestayById(id);
      setHomestay(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async () => {
    if(!user) {
      alert("Account login is required to book a homestay. Please login or register first.");
      navigate('/login');
      return;
    }
    
    if(!bookingDate) {
      alert("Please select a valid check-in date.");
      return;
    }
    
    try {
      await api.post('/bookings', {
        user: { id: user.id },
        homestay: { id: homestay.id },
        date: bookingDate,
        roomsBooked: rooms
      });
      alert('Booking Requested Successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Failed to finalize booking.";
      alert(`🚨 ${errorMsg}`);
    }
  };

  if (!homestay) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 100, color: 'var(--text-muted)' }}>
      <h2>Loading...</h2>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 5%' }}>
      {/* Title Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ marginBottom: 10, fontSize: '2.5rem' }}>{homestay.name}</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {homestay.district}, {homestay.state}
        </p>
      </div>

      {/* Main Image Banner */}
      <div style={{ width: '100%', height: '400px', backgroundColor: '#F0F0F0', borderRadius: '16px', overflow: 'hidden', marginBottom: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {homestay.imageUrl ? (
          <img src={`http://localhost:8080${homestay.imageUrl}`} alt="Homestay" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '1.2rem' }}>
            No Property Photos Available
          </div>
        )}
      </div>

      {/* Split Content Area */}
      <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Column (Content) */}
        <div style={{ flex: '1 1 60%', minWidth: '320px' }}>
          <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid var(--border-light)' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 20 }}>About this homestay</h2>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {homestay.description || "Tucked away in a beautiful serene environment, this homestay offers a true local experience. Our doors are open to wanderers and families alike seeking comfort, authenticity, and peace."}
            </p>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Contact Host</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ padding: 20, border: '1px solid var(--border-light)', borderRadius: 12 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 5 }}>Phone Number</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{homestay.contactNumber || 'N/A'}</p>
              </div>
              <div style={{ padding: 20, border: '1px solid var(--border-light)', borderRadius: 12 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 5 }}>Email Address</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{homestay.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Booking Widget) */}
        <div style={{ flex: '1 1 35%', position: 'sticky', top: 120, minWidth: '320px' }}>
          <div style={{ 
            background: 'var(--surface-color)', 
            border: '1px solid rgba(0,0,0,0.08)', 
            borderRadius: '16px', 
            padding: '24px 32px', 
            boxShadow: 'var(--shadow-md)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 30 }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>${homestay.price}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8, marginBottom: 6 }}>/ night</span>
            </div>

            <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', background: '#FAFAFA' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: 8 }}>
                  Check-in Date
                </label>
                <input 
                  type="date" 
                  value={bookingDate} 
                  onChange={e => setBookingDate(e.target.value)} 
                  style={{ width: '100%', border: 'none', background: 'transparent', padding: 0, fontSize: '1.1rem', fontWeight: 500, margin: 0, boxShadow: 'none' }} 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', background: '#FAFAFA' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: 8 }}>
                  Required Rooms
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max={homestay.rooms} 
                  value={rooms} 
                  onChange={e => setRooms(e.target.value)} 
                  style={{ width: '100%', border: 'none', background: 'transparent', padding: 0, fontSize: '1.1rem', fontWeight: 500, margin: 0, boxShadow: 'none' }} 
                />
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>Availability</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{homestay.rooms} left</span>
              </div>
            </div>

            <button onClick={handleBook} className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}>
              Reserve Instantly
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 16 }}>
              You won't be charged yet.
            </p>

            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem' }}>
              <span>Total cost</span>
              <span>${homestay.price * rooms}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomestayDetails;
