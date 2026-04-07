import React, { useState, useEffect } from 'react';
import { getHomestays } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Homestays() {
  const [homestays, setHomestays] = useState([]);
  const [filters, setFilters] = useState({ state: '', district: '', minPrice: '', maxPrice: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiltered();
  }, []);

  const fetchFiltered = async () => {
    const params = {};
    if (filters.state) params.state = filters.state;
    if (filters.district) params.district = filters.district;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    const { data } = await getHomestays(params);
    setHomestays(data);
  };

  return (
    <div className="container">
      <h1>Explore Homestays</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 30, flexWrap: 'wrap' }}>
        <input type="text" placeholder="State" value={filters.state} onChange={e => setFilters({...filters, state: e.target.value})} style={{ width: 'auto' }} />
        <input type="text" placeholder="District" value={filters.district} onChange={e => setFilters({...filters, district: e.target.value})} style={{ width: 'auto' }} />
        <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} style={{ width: 'auto' }} />
        <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} style={{ width: 'auto' }} />
        <button onClick={fetchFiltered}>Search</button>
      </div>

      <div className="grid">
        {homestays.map(homestay => (
          <div className="card" key={homestay.id} onClick={() => navigate(`/homestays/${homestay.id}`)} style={{ cursor: 'pointer' }}>
            {homestay.imageUrl ? (
              <img src={`http://localhost:8080${homestay.imageUrl}`} alt="Homestay" />
            ) : (
              <div style={{ height: 240, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
            )}
            <div className="card-content">
              <h2 className="card-title">{homestay.name}</h2>
              <p className="card-subtitle">{homestay.district}, {homestay.state}</p>
              <h3>${homestay.price} / night</h3>
              <p>{homestay.rooms} Rooms Available</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homestays;
