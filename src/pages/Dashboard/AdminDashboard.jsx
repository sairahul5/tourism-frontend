import React, { useState, useEffect } from 'react';
import api, { getPendingHomestays, approveHomestay, getPendingGuides, approveGuide } from '../../services/api';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [containers, setContainers] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'HOME_SECTION' });
  const [editingContainerId, setEditingContainerId] = useState(null);
  
  const [pendingHomestays, setPendingHomestays] = useState([]);
  const [pendingGuides, setPendingGuides] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchContainers();
    loadPending();
    loadBookings();
  }, []);

  const fetchUsers = async () => { const { data } = await api.get('/users'); setUsers(data); };
  const fetchContainers = async () => { const { data } = await api.get('/containers'); setContainers(data); };
  const loadPending = async () => {
    const { data: h } = await getPendingHomestays();
    setPendingHomestays(h);
    const { data: g } = await getPendingGuides();
    setPendingGuides(g);
  };
  const loadBookings = async () => {
    const { data } = await api.get('/bookings');
    setBookings(data);
  };

  const onRemoveUser = async (id) => { 
    if(window.confirm('CRITICAL WARNING: Removing this user deletes ALL associated properties, bookings, and profiles permanently! Are you absolutely sure?')) {
        await api.delete(`/users/${id}`); 
        fetchUsers(); 
        loadPending(); 
    }
  };

  const submitContainer = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (editingContainerId) {
        await api.put(`/containers/${editingContainerId}`, form);
    } else {
        await api.post('/containers', { ...form, admin: { id: user.id } });
    }
    setEditingContainerId(null);
    setForm({ title: '', type: 'HOME_SECTION' });
    fetchContainers();
  };

  const handleDeleteContainer = async (c) => {
    const { data: items } = await api.get(`/containers/${c.id}/items`);
    if(window.confirm(`Are you sure you want to delete container: "${c.title}"?\n\nIt currently contains ${items.length} items inside it. This action cannot be undone.`)) {
        await api.delete(`/containers/${c.id}`);
        fetchContainers();
    }
  }

  const onApproveHomestay = async (id) => { await approveHomestay(id); loadPending(); };
  const onApproveGuide = async (id) => { await approveGuide(id); loadPending(); };

  return (
    <div className="container">
      <h2>Admin Control Center</h2>
      <div className="tabs-container" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`tab-btn ${activeTab === 'containers' ? 'active' : ''}`} onClick={() => setActiveTab('containers')}>Containers</button>
        <button className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>Approvals</button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
      </div>

      {activeTab === 'users' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td><span style={{ color: '#137333', fontWeight: 500 }}>{u.status}</span></td>
                  <td>
                    {u.role !== 'ADMIN' && (
                        <button onClick={() => onRemoveUser(u.id)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', borderRadius: '4px' }}>Remove Account</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'containers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Manage Containers</h3>
          </div>
          <form className="filter-bar" onSubmit={submitContainer}>
            <input type="text" placeholder="Container Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ margin: 0 }} />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ margin: 0, width: '200px' }}>
              <option value="HOME_SECTION">Home Section</option>
              <option value="FEATURED">Featured</option>
              <option value="NEARBY">Nearby Attractions</option>
            </select>
            <button type="submit">{editingContainerId ? 'Update Container' : 'Create Container'}</button>
            {editingContainerId && (
                <button type="button" onClick={() => { setEditingContainerId(null); setForm({ title: '', type: 'HOME_SECTION'}); }} style={{ background: '#eee', color: '#333' }}>Cancel</button>
            )}
          </form>
          <div className="grid">
            {containers.map(c => (
              <div key={c.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h2 className="card-title">{c.title}</h2>
                <p className="card-subtitle" style={{ flex: 1 }}>{c.type.replace('_', ' ')}</p>
                
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button 
                    onClick={() => { setForm({ title: c.title, type: c.type }); setEditingContainerId(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ background: '#e3f2fd', color: '#1565c0', padding: '8px', fontSize: '0.85rem', flex: 1, borderRadius: '4px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteContainer(c)}
                    style={{ background: '#ffebee', color: '#c62828', padding: '8px', fontSize: '0.85rem', flex: 1, borderRadius: '4px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div>
          <h3>Pending Homestays</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Host</th><th>Price</th><th>Action</th></tr></thead>
              <tbody>
                {pendingHomestays.length === 0 ? <tr><td colSpan="4">No pending homestays.</td></tr> : pendingHomestays.map(h => (
                  <tr key={h.id}><td>{h.name}</td><td>{h.host.email}</td><td>${h.price}</td>
                    <td>
                        <button onClick={() => onApproveHomestay(h.id)} style={{ padding: '8px 20px', background: '#000', color: '#fff', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>Approve Listing</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <h3 style={{ marginTop: 40 }}>Pending Guides</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Location</th><th>Price/Hr</th><th>Action</th></tr></thead>
              <tbody>
                {pendingGuides.length === 0 ? <tr><td colSpan="4">No pending guides.</td></tr> : pendingGuides.map(g => (
                  <tr key={g.id}><td>{g.name}</td><td>{g.location}</td><td>${g.pricePerHour}</td>
                    <td>
                        <button onClick={() => onApproveGuide(g.id)} style={{ padding: '8px 20px', background: '#000', color: '#fff', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>Approve Guide</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Global Bookings Registry</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Booking Reference ID</th><th>Reservation Date</th><th>Current Status</th></tr></thead>
              <tbody>
                {bookings.length === 0 ? <tr><td colSpan="3" style={{ textAlign: 'center', padding: 40, color: '#888' }}>No bookings exist in the system yet.</td></tr> : bookings.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem' }}>#{b.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{b.date}</td>
                    <td>
                      <span style={{ 
                        background: b.status === 'CONFIRMED' ? '#e6f4ea' : '#fff3e0', 
                        color: b.status === 'CONFIRMED' ? '#137333' : '#e65100', 
                        padding: '6px 12px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600 
                      }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
