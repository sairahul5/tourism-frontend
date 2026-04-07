import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Topbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Forces topbar to refresh automatically on page changes
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Tourism</Link>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/homestays">Homestays</Link>
        <Link to="/guides">Guides</Link>
        {user ? (
          <>
            {user.role === 'ADMIN' && <Link to="/dashboard/admin">Admin Panel</Link>}
            {user.role === 'HOST' && <Link to="/dashboard/host">Host Portal</Link>}
            {user.role === 'GUIDE' && <Link to="/dashboard/guide">Guide Hub</Link>}
            {user.role === 'TOURIST' && <Link to="/dashboard/tourist">My Account</Link>}
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register"><button className="btn btn-primary">Signup</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Topbar;
