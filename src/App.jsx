import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Homestays from './pages/Homestays';
import HomestayDetails from './pages/HomestayDetails';
import Guides from './pages/Guides';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import HostDashboard from './pages/Dashboard/HostDashboard';
import TouristDashboard from './pages/Dashboard/TouristDashboard';
import GuideDashboard from './pages/Dashboard/GuideDashboard';

import Topbar from './components/Topbar';

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/homestays" element={<Homestays />} />
          <Route path="/homestays/:id" element={<HomestayDetails />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/host" element={<HostDashboard />} />
          <Route path="/dashboard/tourist" element={<TouristDashboard />} />
          <Route path="/dashboard/guide" element={<GuideDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
