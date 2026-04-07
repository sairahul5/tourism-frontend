import React, { useState, useEffect } from 'react';
import api, { uploadFile, getBookingsByHost, updateBookingStatus } from '../../services/api';

function HostDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('listings');
  const [homestays, setHomestays] = useState([]);
  
  const [form, setForm] = useState({ name: '', contactNumber: '', email: '', state: '', district: '', price: 0, rooms: 1, description: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [profileEditing, setProfileEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email, password: '' });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => { fetchHomestays(); }, []);
  
  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchHomestays = async () => { const { data } = await api.get(`/homestays/host/${user.id}`); setHomestays(data); };
  
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
        const { data } = await getBookingsByHost(user.id);
        setBookings(data);
    } catch (e) {
        console.error("Failed to load bookings");
    }
    setLoadingBookings(false);
  };

  const handleFileChange = async (e) => {
    if(!e.target.files[0]) return;
    setUploading(true);
    try {
      const res = await uploadFile(e.target.files[0]);
      setForm({ ...form, imageUrl: res.data.url });
    } catch(err) { alert("Upload failed"); }
    setUploading(false);
  };

  const submitHomestay = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/homestays/${editingId}`, { ...form, host: { id: user.id } });
    } else {
      await api.post('/homestays', { ...form, host: { id: user.id } });
    }
    setActiveTab('listings');
    setEditingId(null);
    setForm({ name: '', contactNumber: '', email: '', state: '', district: '', price: 0, rooms: 1, description: '', imageUrl: '' });
    fetchHomestays();
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put(`/users/${user.id}`, profileForm);
    localStorage.setItem('user', JSON.stringify(data));
    setProfileEditing(false);
    window.location.reload();
  };

  const deleteAccount = async () => {
    if(window.confirm('WARNING: Deleting your Host account will permanently delete ALL your uploaded properties and cancel ALL bookings associated with them! Are you 100% sure?')) {
        await api.delete(`/users/${user.id}`);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Host Dashboard</h2>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => { setActiveTab('listings'); setEditingId(null); setForm({ name: '', contactNumber: '', email: '', state: '', district: '', price: 0, rooms: 1, description: '', imageUrl: '' }); }}>My Listings</button>
        <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>{editingId ? 'Edit Homestay' : 'Add New Homestay'}</button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setProfileEditing(false); setProfileForm({ name: user.name, email: user.email, password: '' }); }}>My Profile</button>
      </div>

      {activeTab === 'listings' && (
        <div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {homestays.map(h => (
              <div key={h.id} className="card" style={{ padding: '0px' }}>
                {h.imageUrl ? (
                  <img src={`http://localhost:8080${h.imageUrl}`} alt="Homestay" style={{ height: 160 }} />
                ) : (
                  <div style={{ height: 160, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                )}
                <div className="card-content" style={{ padding: 20 }}>
                  <h2 className="card-title" style={{ fontSize: '1.2rem' }}>{h.name}</h2>
                  <p className="card-subtitle" style={{ marginBottom: 8 }}>{h.district}, {h.state}</p>
                  <h3 style={{ fontSize: '1.1rem' }}>${h.price} / nt</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                    <div style={{ padding: '5px 10px', display: 'inline-block', borderRadius: '4px', background: h.approved ? '#e6f4ea' : '#fff3e0', color: h.approved ? '#137333' : '#e65100', fontSize: '0.85rem', fontWeight: 600 }}>
                      {h.approved ? 'Live Publicly' : 'Pending Review'}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button 
                        onClick={() => {
                          setForm(h);
                          setEditingId(h.id);
                          setActiveTab('add');
                        }}
                        style={{ background: '#e3f2fd', color: '#1565c0', padding: '6px 12px', fontSize: '0.85rem', margin: 0 }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={async () => {
                          if(window.confirm('Are you sure you want to delete this homestay? This cannot be undone.')) {
                            await api.delete(`/homestays/${h.id}`);
                            fetchHomestays();
                          }
                        }}
                        style={{ background: '#ffebee', color: '#c62828', padding: '6px 12px', fontSize: '0.85rem', margin: 0 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {homestays.length === 0 && <p style={{ gridColumn: '1 / -1', color: '#888' }}>You have not listed any properties yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div style={{ maxWidth: 600 }}>
          <form className="card" style={{ padding: 40 }} onSubmit={submitHomestay}>
            <h3 style={{ marginBottom: 30 }}>{editingId ? 'Edit Property Listing' : 'Create a New Property Listing'}</h3>
            <input type="text" placeholder="Homestay Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
            <div style={{ display: 'flex', gap: 20 }}>
              <input type="text" placeholder="Contact Mobile" value={form.contactNumber || ''} onChange={e => setForm({...form, contactNumber: e.target.value})} />
              <input type="email" placeholder="Contact Email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <input type="text" placeholder="State" value={form.state || ''} onChange={e => setForm({...form, state: e.target.value})} />
              <input type="text" placeholder="District" value={form.district || ''} onChange={e => setForm({...form, district: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <input type="number" placeholder="Price/night ($)" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} required />
              <input type="number" placeholder="Available Rooms" value={form.rooms || ''} onChange={e => setForm({...form, rooms: e.target.value})} required />
            </div>
            <textarea placeholder="Property Description & Amenities" rows={4} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
            
            <div style={{ margin: '20px 0', padding: 20, background: '#fafafa', border: '1px dashed #ccc', borderRadius: 8 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 500 }}>Upload Cover Image:</label>
              <input type="file" onChange={handleFileChange} accept="image/*" style={{ margin: 0, padding: 0, border: 'none', background: 'transparent' }} />
              {uploading && <span style={{ color: 'var(--accent)' }}> Uploading securely...</span>}
            </div>
            
            <div style={{ display: 'flex', gap: 15, marginTop: 20 }}>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setForm({ name: '', contactNumber: '', email: '', state: '', district: '', price: 0, rooms: 1, description: '', imageUrl: '' }); setActiveTab('listings'); }} 
                  style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '16px 24px', fontSize: '1.1rem', flex: 1 }}
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={uploading} style={{ flex: 2, padding: '16px', fontSize: '1.1rem' }}>
                {editingId ? 'Update Listing (Requires Re-approval)' : 'Submit Listing for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card" style={{ padding: 40 }}>
            <h3 style={{ marginBottom: 30 }}>Incoming Bookings</h3>
            {loadingBookings ? <p>Loading data securely...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Guest Name</th>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Homestay</th>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Rooms</th>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Expected Payout</th>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px 8px', fontWeight: 500 }}>{b.user.name}</td>
                      <td style={{ padding: '16px 8px' }}>{b.homestay.name}</td>
                      <td style={{ padding: '16px 8px' }}>{b.date}</td>
                      <td style={{ padding: '16px 8px', fontWeight: 600 }}>{b.roomsBooked}</td>
                      <td style={{ padding: '16px 8px', fontWeight: 600, color: 'var(--text-main)' }}>${b.homestay.price * b.roomsBooked}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: b.status === 'CONFIRMED' ? '#e6f4ea' : b.status === 'CANCELLED' ? '#ffebee' : '#f5f5f5', color: b.status === 'CONFIRMED' ? '#137333' : b.status === 'CANCELLED' ? '#c62828' : '#333' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        {b.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-primary" onClick={async () => { await updateBookingStatus(b.id, 'CONFIRMED'); fetchBookings(); }} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Confirm</button>
                                <button className="btn btn-ghost" onClick={async () => { 
                                  if(window.confirm('Are you certain you want to reject this booking?')) {
                                    await updateBookingStatus(b.id, 'CANCELLED'); fetchBookings(); 
                                  }
                                }} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Reject</button>
                            </div>
                        )}
                        {b.status !== 'PENDING' && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Resolved</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p style={{ marginTop: 20, color: '#888' }}>You have no bookings recorded against your properties yet.</p>}
            </div>
            )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ padding: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h3 style={{ margin: 0 }}>Host Profile Overview</h3>
              {!profileEditing && (
                <button onClick={() => setProfileEditing(true)} style={{ background: 'var(--surface-color)', color: 'var(--accent)', border: '1px solid #ddd', padding: '8px 16px' }}>Edit Profile</button>
              )}
            </div>

            {profileEditing ? (
              <form onSubmit={submitProfile}>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>Full Name</label>
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                </div>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>Email Address</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                </div>
                <div style={{ marginBottom: 25 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>New Password (leave blank to keep current)</label>
                  <input type="password" placeholder="••••••••" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: 15 }}>
                  <button type="button" onClick={() => setProfileEditing(false)} style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '12px 24px', flex: 1 }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', flex: 1 }}>Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Full Name</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>{user.name}</p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Registered Email</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>{user.email}</p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Account Status</p>
                  <p style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, background: user.status === 'ACTIVE' ? '#e6f4ea' : '#ffebee', color: user.status === 'ACTIVE' ? '#137333' : '#c62828', fontWeight: 600, fontSize: '0.9rem' }}>{user.status}</p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Platform Role</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>{user.role}</p>
                </div>
                <div style={{ borderTop: '1px solid #eaeaea', paddingTop: 20, marginTop: 20 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Total Properties Managed</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700 }}>{homestays.length}</p>
                </div>

                <div style={{ borderTop: '1px solid #ffcdd2', paddingTop: 20, marginTop: 40 }}>
                  <p style={{ fontSize: '0.9rem', color: '#c62828', marginBottom: 15 }}>Danger Zone</p>
                  <button onClick={deleteAccount} style={{ background: '#ffebee', color: '#c62828', width: '100%', padding: '12px' }}>Delete My Account</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HostDashboard;
