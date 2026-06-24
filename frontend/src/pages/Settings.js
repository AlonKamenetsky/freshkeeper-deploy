// src/pages/Settings.js — saves to DB via PUT /users/me
import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateMe } from '../services/api';
import './Settings.css';

export default function Settings() {
  const user = getCurrentUser();

  const [form, setForm] = useState({
    firstName:       '',
    lastName:        '',
    email:           user?.email || '',
    defaultStorage:  'fridge',
    expiryAlertDays: '3',
    notifications:   true,
  });
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Pre-fill from session
    const parts = (user?.name || '').split(' ');
    setForm(f => ({
      ...f,
      firstName: parts[0] || user?.name || '',
      lastName:  parts.slice(1).join(' ') || '',
      email:     user?.email || '',
    }));
    setLoading(false);
  }, []);

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.email.trim())     errs.email     = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.expiryAlertDays || isNaN(form.expiryAlertDays) || Number(form.expiryAlertDays) < 1)
      errs.expiryAlertDays = 'Must be at least 1 day.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    setError('');
    try {
      await updateMe({ firstName: form.firstName, lastName: form.lastName, email: form.email });
      // update session
      sessionStorage.setItem('userName',  form.firstName);
      sessionStorage.setItem('userEmail', form.email);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your account and preferences</p>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
      {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="settings-sections">

          {/* Profile */}
          <div className="card settings-section">
            <h2 className="settings-section-title">Profile</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
                {formErrors.firstName && <span className="form-error">{formErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={user?.role || ''} disabled
                  style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card settings-section">
            <h2 className="settings-section-title">Preferences</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label">Default Storage View</label>
                <select className="form-input" value={form.defaultStorage}
                  onChange={e => setForm(f => ({ ...f, defaultStorage: e.target.value }))}>
                  <option value="all">All</option>
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Alert (days before)</label>
                <input
                  className={`form-input ${formErrors.expiryAlertDays ? 'error' : ''}`}
                  type="number" min="1" max="30" value={form.expiryAlertDays}
                  onChange={e => setForm(f => ({ ...f, expiryAlertDays: e.target.value }))}
                />
                {formErrors.expiryAlertDays && <span className="form-error">{formErrors.expiryAlertDays}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Notifications</label>
                <div className="toggle-row">
                  <input type="checkbox" id="notif" checked={form.notifications}
                    onChange={e => setForm(f => ({ ...f, notifications: e.target.checked }))} />
                  <label htmlFor="notif" style={{ fontSize: 14, color: 'var(--gray-700)' }}>
                    Send expiry alerts by email
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
