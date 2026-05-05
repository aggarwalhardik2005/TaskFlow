import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiFolder, FiCheckSquare, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard', show: true },
    { to: '/projects', icon: <FiFolder />, label: 'Projects', show: true },
    { to: '/tasks', icon: <FiCheckSquare />, label: 'My Tasks', show: true },
    { to: '/team', icon: <FiUsers />, label: 'Team Management', show: isAdmin },
    { to: '/profile', icon: <FiUser />, label: 'Profile', show: true },
  ];

  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">T</div>
          <span className="sidebar-title">TaskFlow</span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section-title">Menu</span>
          {navItems.filter(item => item.show).map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <span className="icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
          <span className="nav-section-title" style={{ marginTop: 'auto' }}>Account</span>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <span className="icon"><FiLogOut /></span>Logout
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isAdmin && <FiShield size={10} />}
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
