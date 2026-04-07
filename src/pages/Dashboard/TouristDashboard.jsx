import React, { useState, useEffect } from 'react';
import api, { getGuideBookingsByUser, updateBookingStatus, deleteGuideBooking, updateUser } from '../../services/api';

function TouristDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [homestayBookings, setHomestayBookings] = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '', password: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const [homestayRes, guideRes] = await Promise.all([
        api.get(`/bookings/user/${user.id}`),
        getGuideBookingsByUser(user.id)
      ]);
      setHomestayBookings(homestayRes.data);
      setGuideBookings(guideRes.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  const handleCancelHomestay = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this homestay booking?")) return;
    try {
      await updateBookingStatus(id, 'CANCELLED');
      alert('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel homestay booking.');
    }
  };

  const handleCancelGuide = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this guide booking?")) return;
    try {
      await deleteGuideBooking(id, 'Cancelled by tourist');
      alert('Guide booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel guide booking.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateUser(user.id, profileForm);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      alert('Profile updated successfully!');
      setProfileForm({ ...profileForm, password: '' });
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="container">
      <h1>Tourist Dashboard</h1>
      
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Profile</button>
        <button className={`tab-btn ${activeTab === 'homestays' ? 'active' : ''}`} onClick={() => setActiveTab('homestays')}>Homestay Bookings</button>
        <button className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => setActiveTab('guides')}>Guide Bookings</button>
      </div>

      {activeTab === 'profile' && (
        <div style={{ maxWidth: 500 }}>
          <h2>Edit Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <label>Name</label>
            <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
            <label>Email</label>
            <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
            <label>New Password (leave blank to keep current)</label>
            <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} />
            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === 'homestays' && (
        <div>
          <h2>Homestay Bookings</h2>
          {homestayBookings.length === 0 ? <p>No homestay bookings found.</p> : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Homestay</th>
                    <th>Date</th>
                    <th>Rooms</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {homestayBookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.homestay?.name || 'N/A'}</td>
                      <td>{b.date}</td>
                      <td>{b.roomsBooked}</td>
                      <td><strong>{b.status}</strong></td>
                      <td>
                        {b.status !== 'CANCELLED' && (
                          <button onClick={() => handleCancelHomestay(b.id)} style={{ background: '#e74c3c', padding: '8px 16px' }}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'guides' && (
        <div>
          <h2>Guide Bookings</h2>
          {guideBookings.length === 0 ? <p>No guide bookings found.</p> : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Guide</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guideBookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.guide?.name || 'N/A'}</td>
                      <td>{b.date}</td>
                      <td>{b.hours}</td>
                      <td><strong>{b.status}</strong></td>
                      <td>
                        {b.status !== 'CANCELLED' && (
                          <button onClick={() => handleCancelGuide(b.id)} style={{ background: '#e74c3c', padding: '8px 16px' }}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TouristDashboard;
