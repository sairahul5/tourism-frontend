import React, { useState, useEffect } from 'react';
import { getContainers, getContainerItems, getHomestayById } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [containers, setContainers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      const { data } = await getContainers();
      const containersWithItems = await Promise.all(
        data.map(async (c) => {
          const itemsRes = await getContainerItems(c.id);
          const items = await Promise.all(
            itemsRes.data.map(async (item) => {
              if (item.type === 'HOMESTAY') {
                try {
                  const hRes = await getHomestayById(item.referenceId);
                  return { ...item, details: hRes.data };
                } catch(e) {
                  return item; 
                }
              }
              return item;
            })
          );
          return { ...c, items };
        })
      );
      setContainers(containersWithItems);
    } catch (e) {
      console.error("Failed to load home containers", e);
    }
  };

  return (
    <div>
      {/* Premium Minimal Hero Section */}
      <div className="hero-section">
        <h1>Find your escape. Book local.</h1>
        <p className="hero-subtitle">
          Discover affordable homestays and authentic local guides in one seamless platform. Engineered for authentic, unforgettable travel experiences.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/homestays" className="btn btn-primary">
            Explore Stays
          </Link>
          <Link to="/guides" className="btn btn-ghost">
            Find Local Guides
          </Link>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 0 }}>
        {/* Value Prop Features Grid */}
        <div className="features-grid">
          <div className="feature-block">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🌍 Authentic Local Stays</h3>
            <p style={{ margin: 0 }}>Skip the generic hotels. Stay in handpicked homes hosted by passionate locals who know the area best.</p>
          </div>
          <div className="feature-block">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🎒 Expert Guide Matching</h3>
            <p style={{ margin: 0 }}>Hire vetted guides on-demand. Browse by hourly rates, expertise, and availability instantly.</p>
          </div>
          <div className="feature-block">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🛡️ Secure & Seamless</h3>
            <p style={{ margin: 0 }}>Your bookings and transactions are protected. Experience world-class UX from search to check-out.</p>
          </div>
        </div>

        {/* Dynamic Containers / Top Stays */}
        {containers.map((container) => (
          <div key={container.id} style={{ marginBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <h2 style={{ margin: 0 }}>{container.title}</h2>
              <Link to="/homestays" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                View All →
              </Link>
            </div>

            <div className="grid">
              {container.items.map((item) => (
                <div 
                  key={item.id} 
                  className="card" 
                  onClick={() => { if(item.type === 'HOMESTAY' && item.details) navigate(`/homestays/${item.details.id}`); }} 
                  style={{ cursor: item.type === 'HOMESTAY' ? 'pointer' : 'default', padding: 0 }}
                >
                  {item.type === 'HOMESTAY' && item.details ? (
                    <>
                      <div className="card-image-wrapper">
                        {item.details.imageUrl ? (
                          <img src={`http://localhost:8080${item.details.imageUrl}`} alt="Homestay" loading="lazy" />
                        ) : (
                          <div style={{ height: '100%', background: '#F9F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Cover Image</div>
                        )}
                      </div>
                      <div className="card-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 className="card-title">{item.details.name}</h3>
                          <span style={{ fontWeight: 600 }}>★ 4.9</span>
                        </div>
                        <p className="card-subtitle">{item.details.district}, {item.details.state}</p>
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            ${item.details.price}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '4px', marginBottom: '3px' }}>
                            / night
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="card-content" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '300px' }}>
                      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Reference ID: {item.referenceId}</p>
                      <p style={{ fontSize: '0.9rem', background: '#F0F0F0', padding: '6px 12px', borderRadius: '4px', display: 'inline-block', margin: '16px auto 0 auto' }}>{item.type}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {container.items.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                  No featured items have been curated here yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
