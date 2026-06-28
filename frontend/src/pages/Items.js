// src/pages/Items.js
import React, { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem, getCurrentUser } from '../services/api';
import ItemCard from '../components/ItemCard';
import DataTable from '../components/DataTable';
import './Items.css';

const EMPTY_FORM = { name: '', quantity: '', unit: 'units', expirationDate: '', storageType: 'fridge', category: 'other' };

export default function Items() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [filter, setFilter]     = useState('');
  const [view, setView]         = useState('cards'); // 'cards' | 'table'

  const user = getCurrentUser();
  const canEdit = true
  const canDelete = true

  async function load() {
    try {
      setLoading(true);
      const data = await getItems(filter ? { storageType: filter } : {});
      setItems(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.quantity) errs.quantity = 'Quantity is required.';
    else if (isNaN(form.quantity) || Number(form.quantity) < 0) errs.quantity = 'Must be a positive number.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      const body = { ...form, quantity: Number(form.quantity) };
      if (editId) await updateItem(editId, body);
      else        await createItem(body);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  function handleEdit(item) {
    setForm({ name: item.name, quantity: String(item.quantity), unit: item.unit, expirationDate: item.expirationDate || '', storageType: item.storageType, category: item.category });
    setEditId(item.itemId);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteItem(id); load(); }
    catch (err) { setError(err.message); }
  }

  const tableColumns = [
    { key: 'name',           label: 'Name' },
    { key: 'quantity',       label: 'Qty', render: (v, row) => `${v} ${row.unit}` },
    { key: 'category',       label: 'Category' },
    { key: 'storageType',    label: 'Storage' },
    { key: 'expirationDate', label: 'Expires', render: v => v || '—' },
    ...(canEdit || canDelete ? [{
      key: 'itemId', label: 'Actions',
      render: (id, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {canEdit   && <button className="btn btn-outline" style={{fontSize:12,padding:'4px 10px'}} onClick={() => handleEdit(row)}>Edit</button>}
          {canDelete && <button className="btn btn-danger"  style={{fontSize:12,padding:'4px 10px'}} onClick={() => handleDelete(id)}>Delete</button>}
        </div>
      )
    }] : [])
  ];

  return (
    <div>
      <div className="page-header items-header">
        <div>
          <h1 className="page-title">Pantry Inventory</h1>
          <p className="page-sub">Manage your food items</p>
        </div>
        <div className="items-actions">
          <select className="form-input" value={filter} onChange={e => setFilter(e.target.value)} style={{width:'auto'}}>
            <option value="">All locations</option>
            <option value="fridge">❄️ Fridge</option>
            <option value="freezer">🧊 Freezer</option>
            <option value="pantry">🗄️ Pantry</option>
          </select>
          <div className="view-toggle">
            <button className={`btn ${view==='cards' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('cards')}>Cards</button>
            <button className={`btn ${view==='table' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('table')}>Table</button>
          </div>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
              + Add Item
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="card item-form">
          <h3 style={{marginBottom:16, fontWeight:600}}>{editId ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className={`form-input ${formErrors.name?'error':''}`} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Milk" />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className={`form-input ${formErrors.quantity?'error':''}`} type="number" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} placeholder="e.g. 2" />
                {formErrors.quantity && <span className="form-error">{formErrors.quantity}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="units" />
              </div>
              <div className="form-group">
                <label className="form-label">Expiration Date</label>
                <input className="form-input" type="date" value={form.expirationDate} onChange={e=>setForm(f=>({...f,expirationDate:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Storage</label>
                <select className="form-input" value={form.storageType} onChange={e=>setForm(f=>({...f,storageType:e.target.value}))}>
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Add Item'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="loading-spinner" /> : (
        view === 'cards' ? (
          <div className="items-grid">
            {items.map(item => (
              <ItemCard key={item.itemId} item={item}
                onEdit={canEdit ? handleEdit : null}
                onDelete={canDelete ? handleDelete : null}
              />
            ))}
            {items.length === 0 && (
              <div className="empty-state" style={{gridColumn:'1/-1'}}>
                <div className="empty-state-icon">🛒</div>
                <div className="empty-state-text">No items found.</div>
              </div>
            )}
          </div>
        ) : (
          <DataTable columns={tableColumns} data={items} emptyMessage="No items found." />
        )
      )}
    </div>
  );
}
