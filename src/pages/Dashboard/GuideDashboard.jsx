import React, { useState, useEffect } from 'react';
import api, { uploadFile, updateGuide, API_BASE_URL } from '../../services/api';

function GuideDashboard() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', location: '', pricePerHour: 0, workHours: '', dailyLimitHours: 8, imageUrl: '' });
  const [bookings, setBookings] = useState([]);
  const [uploading, setUploading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  // Edit Mode States
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await api.get(`/guides/user/${user.id}`);
      setProfile(data);
      if(data && data.id) {
        setEditForm({ ...data, dailyLimitHours: data.dailyLimitHours || 8 });
        const { data: bData } = await api.get(`/guide-bookings/guide/${data.id}`);
        setBookings(bData);
      }
    } catch(err) {
      console.log("Profile not found");
    }
  };

  const handleFileChange = async (e, isEdit = false) => {
    if(!e.target.files[0]) return;
    setUploading(true);
    try {
      const res = await uploadFile(e.target.files[0]);
      if (isEdit) {
        setEditForm({ ...editForm, imageUrl: res.data.url });
      } else {
        setForm({ ...form, imageUrl: res.data.url });
      }
    } catch(err) { alert("Upload failed"); }
    setUploading(false);
  };

  const createProfile = async (e) => {
    e.preventDefault();
    await api.post('/guides', { ...form, available: true, user: { id: user.id } });
    loadData();
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    await updateGuide(profile.id, editForm);
    setEditMode(false);
    loadData();
  };

  const toggleAvailability = async () => {
    await api.put(`/guides/${profile.id}/availability?available=${!profile.available}`);
    loadData();
  };

  const deleteAccount = async () => {
    if(window.confirm('WARNING: Deleting your Guide account will permanently delete your public profile and clear ALL scheduled bookings! Are you 100% sure?')) {
        await api.delete(`/users/${user.id}`);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("WARNING: Cancelling this booked shift is permanent. Are you absolutely sure?")) {
        try {
            await api.delete(`/guide-bookings/${id}?reason=`);
            loadData();
        } catch(err) {
            console.error(err);
            alert("🚨 Error: The backend failed to delete this booking. Have you restarted your Java Server so it maps the new changes?");
        }
    }
  };

  return (
    <div className="container">
      <h2>Guide Central</h2>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: 30 }}>
        
        <div style={{ flex: 1, minWidth: 350 }}>
          {!profile ? (
            <div className="card" style={{ padding: 40 }}>
              <h3 style={{ marginBottom: 20 }}>Setup Your Work Profile</h3>
              <form onSubmit={createProfile} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <input type="text" placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} required />
                <input type="text" placeholder="Contact Info" onChange={e => setForm({...form, contact: e.target.value})} required />
                <input type="text" placeholder="Operating Location (District/City)" onChange={e => setForm({...form, location: e.target.value})} required />
                
                <div style={{ display: 'flex', gap: 15 }}>
                  <input type="number" placeholder="Price Per Hour ($)" onChange={e => setForm({...form, pricePerHour: e.target.value})} required style={{ flex: 1 }} />
                  <input type="number" placeholder="Total Max Hours/Day (e.g. 8)" onChange={e => setForm({...form, dailyLimitHours: e.target.value})} required style={{ flex: 1 }} min="1" max="24" />
                </div>
                
                <input type="text" placeholder="Work Timings (e.g. 9AM - 5PM)" onChange={e => setForm({...form, workHours: e.target.value})} required />
                
                <div style={{ padding: 15, background: '#fafafa', border: '1px dashed #ccc', borderRadius: 8 }}>
                  <label style={{ display: 'block', marginBottom: 10, fontWeight: 500 }}>Profile Picture:</label>
                  <input type="file" onChange={(e) => handleFileChange(e, false)} accept="image/*" style={{ border: 'none', padding: 0 }} />
                  {uploading && <span style={{ color: 'var(--accent)' }}> Uploading securely...</span>}
                </div>
                
                <button type="submit" disabled={uploading} style={{ marginTop: 10, padding: 14 }}>Submit Profile</button>
              </form>
            </div>
          ) : (
            <>
              {editMode ? (
                <div className="card" style={{ padding: 40 }}>
                  <h3 style={{ marginBottom: 20 }}>Edit Professional Profile</h3>
                  <form onSubmit={submitEdit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div><label>Full Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required /></div>
                    <div><label>Contact Info</label><input type="text" value={editForm.contact} onChange={e => setEditForm({...editForm, contact: e.target.value})} required /></div>
                    <div><label>Operating Location</label><input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} required /></div>
                    
                    <div style={{ display: 'flex', gap: 15 }}>
                      <div style={{ flex: 1 }}><label>Price ($/Hr)</label><input type="number" value={editForm.pricePerHour} onChange={e => setEditForm({...editForm, pricePerHour: e.target.value})} required /></div>
                      <div style={{ flex: 1 }}><label>Max Daily Booking Limit (Hrs)</label><input type="number" value={editForm.dailyLimitHours} onChange={e => setEditForm({...editForm, dailyLimitHours: e.target.value})} min="1" max="24" required /></div>
                    </div>
                    
                    <div><label>Work Timings (Shift Text)</label><input type="text" value={editForm.workHours} onChange={e => setEditForm({...editForm, workHours: e.target.value})} required /></div>
                    
                    <div style={{ padding: 15, background: '#fafafa', border: '1px dashed #ccc', borderRadius: 8 }}>
                      <label style={{ display: 'block', marginBottom: 10, fontWeight: 500 }}>Update Profile Picture:</label>
                      <input type="file" onChange={(e) => handleFileChange(e, true)} accept="image/*" style={{ border: 'none', padding: 0 }} />
                      {uploading && <span style={{ color: 'var(--accent)' }}> Uploading securely...</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button type="button" onClick={() => { setEditMode(false); setEditForm(profile); }} style={{ background: '#f5f5f5', color: '#333', border: '1px solid #ddd', flex: 1, padding: 14 }}>Cancel</button>
                      <button type="submit" disabled={uploading} style={{ flex: 2, padding: 14 }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card" style={{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {profile.imageUrl ? (
                    <img src={`${API_BASE_URL}${profile.imageUrl}`} alt="Profile" style={{ height: 250, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 250, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#888' }}>No Photo</div>
                  )}
                  <div style={{ padding: 30, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{profile.name}</h3>
                        <p style={{ color: '#666', marginTop: 4 }}>{profile.location}</p>
                      </div>
                      <span style={{ background: profile.approved ? '#e6f4ea' : '#fff3e0', color: profile.approved ? '#137333' : '#e65100', padding: '6px 12px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600 }}>
                        {profile.approved ? 'Publicly Listed' : 'Pending Verification'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', marginTop: 25, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Price Rating</p>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>${profile.pricePerHour}/hr</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Shift Capacity</p>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{profile.dailyLimitHours || 8} Hrs/Day</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Timings</p>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{profile.workHours}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: 30, paddingTop: 30, borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>Duty Status Signal</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: profile.available ? '#00e676' : '#ff1744', boxShadow: `0 0 8px ${profile.available ? '#00e676' : '#ff1744'}` }}></span>
                          <span style={{ fontWeight: 600, letterSpacing: 1 }}>{profile.available ? 'ON DUTY' : 'OFF DUTY'}</span>
                        </div>
                      </div>
                      <button onClick={toggleAvailability} style={{ background: profile.available ? '#fff' : '#000', color: profile.available ? '#000' : '#fff', border: '2px solid #000', padding: '10px 20px', borderRadius: 50, fontWeight: 600 }}>
                        {profile.available ? 'Clock Out' : 'Clock In'}
                      </button>
                    </div>

                    <button onClick={() => setEditMode(true)} style={{ width: '100%', marginTop: 20, background: '#f5f5f5', color: '#333', padding: 12 }}>Edit Profile Settings</button>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #ffcdd2', padding: 30, background: '#fffafa', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#c62828', marginBottom: 15, fontWeight: 600 }}>Danger Zone</p>
                    <button onClick={deleteAccount} style={{ background: '#ffebee', color: '#c62828', width: '100%', padding: '12px', border: '1px solid #ffcdd2' }}>Delete My Guide Account</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {profile && (
          <div className="card" style={{ flex: 2, minWidth: 400, padding: 30, height: 'fit-content' }}>
            <h3 style={{ margin: 0, marginBottom: 20 }}>Your Shift Bookings Timeline</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Customer ID</th><th>Shift Date</th><th>Duration</th><th>Revenue</th><th>Payment</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#888' }}>No shifts have been booked yet. Rest easy!</td></tr> : bookings.map(b => (
                    <tr key={b.id} style={{ opacity: b.status === 'CANCELLED' ? 0.6 : 1, background: b.status === 'CANCELLED' ? '#fafafa' : 'transparent' }}>
                      <td><span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem' }}>#{b.user.id}</span></td>
                      <td style={{ fontWeight: 500, textDecoration: b.status === 'CANCELLED' ? 'line-through' : 'none' }}>{b.date}</td>
                      <td>{b.hours} Hrs</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>${b.hours * profile.pricePerHour}</td>
                      <td>
                        {b.status === 'CANCELLED' ? (
                          <span style={{ background: '#ffebee', color: '#c62828', padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600 }}>CANCELLED</span>
                        ) : b.paymentStatus === 'PENDING' ? (
                          <span style={{ background: '#fff3e0', color: '#e65100', padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600 }}>PENDING</span>
                        ) : (
                          <span style={{ color: '#137333', fontWeight: 600 }}>PAID ({b.utrNumber})</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {b.status === 'CANCELLED' ? (
                           <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>Cancelled.</span>
                        ) : (
                          <button onClick={() => cancelBooking(b.id)} style={{ background: '#ffebee', color: '#c62828', padding: '6px 12px', borderRadius: 4, fontSize: '0.85rem', width: '100%', minWidth: '80px' }}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default GuideDashboard;
