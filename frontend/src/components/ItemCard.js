// src/components/ItemCard.js
import React from 'react';
import './ItemCard.css';

const STORAGE_ICONS = { fridge: '❄️', freezer: '🧊', pantry: '🗄️' };
const CATEGORY_ICONS = { dairy: '🥛', meat: '🥩', vegetables: '🥦', fruits: '🍎', grains: '🌾', other: '📦' };

function getDaysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ItemCard({ item, onEdit, onDelete }) {
  const days = getDaysUntilExpiry(item.expirationDate);
  const isExpiringSoon = days !== null && days <= 3;
  const isExpired = days !== null && days < 0;

  function getExpiryBadge() {
    if (!item.expirationDate) return null;
    if (isExpired) return <span className="badge badge-red">Expired</span>;
    if (isExpiringSoon) return <span className="badge badge-red">Expires in {days}d</span>;
    return <span className="badge badge-green">Expires in {days}d</span>;
  }

  return (
    <div className={`item-card card ${isExpiringSoon || isExpired ? 'item-card--urgent' : ''}`}>
      <div className="item-card-header">
        <span className="item-card-icon">{CATEGORY_ICONS[item.category] || '📦'}</span>
        <div className="item-card-title">
          <span className="item-card-name">{item.name}</span>
          <span className="item-card-storage">
            {STORAGE_ICONS[item.storageType]} {item.storageType}
          </span>
        </div>
        {getExpiryBadge()}
      </div>

      <div className="item-card-body">
        <div className="item-card-stat">
          <span className="item-card-stat-label">Quantity</span>
          <span className="item-card-stat-value">{item.quantity} {item.unit}</span>
        </div>
        <div className="item-card-stat">
          <span className="item-card-stat-label">Category</span>
          <span className="item-card-stat-value">{item.category}</span>
        </div>
        {item.expirationDate && (
          <div className="item-card-stat">
            <span className="item-card-stat-label">Expires</span>
            <span className="item-card-stat-value">{item.expirationDate}</span>
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="item-card-actions">
          {onEdit && <button className="btn btn-outline" onClick={() => onEdit(item)}>Edit</button>}
          {onDelete && <button className="btn btn-danger" onClick={() => onDelete(item.itemId)}>Delete</button>}
        </div>
      )}
    </div>
  );
}
