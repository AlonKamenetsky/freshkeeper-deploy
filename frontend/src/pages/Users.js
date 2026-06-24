// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import DataTable from '../components/DataTable';
import './Users.css';

const EMPTY_FORM = { firstName: '', lastName: '', userRole: 'consumer' };

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      if (editId) await updateUser(editId, form);
      else        await createUser(form);
      setSuccess(editId ? 'User updated.' : 'User created.');
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  function handleEdit(user) {
    setForm({ firstName: user.firstName, lastName: user.lastName, userRole: user.userRole });
    setEditId(user.userId);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteUser(id); load(); }
    catch (err) { setError(err.message); }
  }

  const ROLE_COLORS = { admin: 'badge-red', employee: 'badge-gray', consumer: 'badge-green' };

  const columns = [
    { key: 'userId',    label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName',  label: 'Last Name' },
    { key: 'userRole',  label: 'Role', render: v => <span className={`badge ${ROLE_COLORS[v]||'badge-gray'}`}>{v}</span> },
    { key: 'createDate', label: 'Created', render: v => new Date(v).toLocaleDateString() },
    { key: 'userId', label: 'Actions', render: (id, row) => (
      <div style={{display:'flex',gap:8}}>
        <button className="btn btn-outline" style={{fontSize:12,padding:'4px 10px'}} onClick={() => handleEdit(row)}>Edit</button>
        <button className="btn btn-danger"  style={{fontSize:12,padding:'4px 10px'}} onClick={() => handleDelete(id)}>Delete</button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="page-header users-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-sub">Admin panel — manage all users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
          + Add User
        </button>
      </div>

      {error   && <div className="alert alert-error"   style={{marginBottom:16}}>{error}</div>}
      {success && <div className="alert alert-success" style={{marginBottom:16}}>{success}</div>}

      {showForm && (
        <div className="card user-form">
          <h3 style={{marginBottom:16, fontWeight:600}}>{editId ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className={`form-input ${formErrors.firstName?'error':''}`} value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} />
                {formErrors.firstName && <span className="form-error">{formErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className={`form-input ${formErrors.lastName?'error':''}`} value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} />
                {formErrors.lastName && <span className="form-error">{formErrors.lastName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.userRole} onChange={e=>setForm(f=>({...f,userRole:e.target.value}))}>
                  <option value="consumer">Consumer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Add User'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="loading-spinner" /> : (
        <DataTable columns={columns} data={users} emptyMessage="No users found." />
      )}
    </div>
  );
}
