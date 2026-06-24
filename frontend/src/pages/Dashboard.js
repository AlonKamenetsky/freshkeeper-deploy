// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { getItems, getRecipes } from '../services/api';
import ItemCard from '../components/ItemCard';
import './Dashboard.css';

export default function Dashboard() {
  const [items, setItems]     = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [itemsData, recipesData] = await Promise.all([getItems(), getRecipes()]);
        setItems(itemsData);
        setRecipes(recipesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const expiringSoon = items.filter(item => {
    if (!item.expirationDate) return false;
    const days = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 3;
  });

  if (loading) return <div className="loading-spinner" />;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Overview of your pantry and recipes</p>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats">
        <div className="stat-card card">
          <span className="stat-number">{items.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-card card">
          <span className="stat-number stat-urgent">{expiringSoon.length}</span>
          <span className="stat-label">Expiring Soon</span>
        </div>
        <div className="stat-card card">
          <span className="stat-number">{recipes.length}</span>
          <span className="stat-label">Recipes</span>
        </div>
        <div className="stat-card card">
          <span className="stat-number">
            {items.filter(i => i.storageType === 'fridge').length}
          </span>
          <span className="stat-label">In Fridge</span>
        </div>
      </div>

      {/* Expiring soon */}
      {expiringSoon.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-title">⚠️ Use these soon</h2>
          <div className="items-grid">
            {expiringSoon.map(item => (
              <ItemCard key={item.itemId} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent items */}
      <section className="dashboard-section">
        <h2 className="section-title">Recent pantry items</h2>
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <div className="empty-state-text">No items yet. Add something to your pantry!</div>
          </div>
        ) : (
          <div className="items-grid">
            {items.slice(0, 3).map(item => (
              <ItemCard key={item.itemId} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Recent recipes */}
      <section className="dashboard-section">
        <h2 className="section-title">Available recipes</h2>
        <div className="recipes-list">
          {recipes.slice(0, 4).map(recipe => (
            <div key={recipe.recipeId} className="recipe-row card">
              <div className="recipe-row-info">
                <span className="recipe-row-name">🍽️ {recipe.name}</span>
                <span className="recipe-row-meta">{recipe.prepTime + recipe.cookTime} min · {recipe.servings} servings</span>
              </div>
              <div className="recipe-tags">
                {recipe.tags?.map(t => <span key={t} className="badge badge-green">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
