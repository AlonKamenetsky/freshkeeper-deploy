// src/components/Navbar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/api';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/dashboard', label: '🏠 Dashboard' },
  { to: '/items',     label: '🥦 Pantry'    },
  { to: '/recipes',   label: '🍽️ Recipes'   },
  { to: '/ai',        label: '🤖 AI'         },
  { to: '/users',     label: '👥 Users', adminOnly: true },
  { to: '/settings',  label: '⚙️ Settings'  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const user     = getCurrentUser();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">🥗 FreshKeeper</span>
      <ul className="navbar-links">
        {NAV_LINKS.filter(l => !l.adminOnly || user?.role === 'admin').map(l => (
          <li key={l.to}>
            <NavLink to={l.to} className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="navbar-user">
        <span className="navbar-role">{user?.role}</span>
        <button className="btn btn-secondary navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
