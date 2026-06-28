// src/pages/Recipes.js
import React, { useEffect, useState } from 'react';
import { getRecipes, suggestRecipes, createRecipe, deleteRecipe, getCurrentUser } from '../services/api';
import DataTable from '../components/DataTable';
import './Recipes.css';

const EMPTY_FORM = { name: '', prepTime: '', cookTime: '', servings: '', tags: '', ingredients: '', instructions: '' };

export default function Recipes() {
  const [recipes, setRecipes]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [tagFilter, setTagFilter]         = useState('');
  const [suggestions, setSuggestions]     = useState(null);
  const [suggestInput, setSuggestInput]   = useState('');
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);

  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';

  async function load() {
    try {
      setLoading(true);
      const data = await getRecipes(tagFilter ? { tags: tagFilter } : {});
      setRecipes(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [tagFilter]);

  async function handleSuggest(e) {
    e.preventDefault();
    if (!suggestInput.trim()) return;
    setSuggestLoading(true);
    try {
      const ingredients = suggestInput.split(',').map(s => s.trim()).filter(Boolean);
      const result = await suggestRecipes({ ingredients });
      setSuggestions(result.suggestions);
    } catch (err) { setError(err.message); }
    finally { setSuggestLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Recipe name is required.'); return; }
    setSaving(true);
    try {
      const body = {
        name:         form.name.trim(),
        prepTime:     parseInt(form.prepTime) || 0,
        cookTime:     parseInt(form.cookTime) || 0,
        servings:     parseInt(form.servings) || 1,
        tags:         form.tags.split(',').map(s => s.trim()).filter(Boolean),
        ingredients:  form.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        instructions: form.instructions.trim(),
      };
      await createRecipe(body);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setError('');
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this recipe?')) return;
    try { await deleteRecipe(id); load(); }
    catch (err) { setError(err.message); }
  }

  const columns = [
    { key: 'name',     label: 'Recipe' },
    { key: 'prepTime', label: 'Prep', render: v => `${v} min` },
    { key: 'cookTime', label: 'Cook', render: v => `${v} min` },
    { key: 'servings', label: 'Servings' },
    { key: 'tags',     label: 'Tags', render: tags => (
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {tags?.map(t => <span key={t} className="badge badge-green">{t}</span>)}
          </div>
      )},
    { key: 'ingredients', label: 'Ingredients', render: arr => arr?.length + ' items' },
    ...(isAdmin ? [{
      key: 'recipeId', label: 'Actions',
      render: (id) => (
          <button className="btn btn-danger" style={{fontSize:12,padding:'4px 10px'}} onClick={() => handleDelete(id)}>
            Delete
          </button>
      )
    }] : [])
  ];

  return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Recipes</h1>
            <p className="page-sub">Browse and discover recipes</p>
          </div>
          {isAdmin && (
              <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}>
                + Add Recipe
              </button>
          )}
        </div>

        {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

        {/* Add Recipe Form */}
        {isAdmin && showForm && (
            <div className="card item-form">
              <h3 style={{marginBottom:16, fontWeight:600}}>Add New Recipe</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Pasta Carbonara" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prep Time (min)</label>
                    <input className="form-input" type="number" value={form.prepTime} onChange={e => setForm(f => ({...f, prepTime: e.target.value}))} placeholder="e.g. 10" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cook Time (min)</label>
                    <input className="form-input" type="number" value={form.cookTime} onChange={e => setForm(f => ({...f, cookTime: e.target.value}))} placeholder="e.g. 20" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Servings</label>
                    <input className="form-input" type="number" value={form.servings} onChange={e => setForm(f => ({...f, servings: e.target.value}))} placeholder="e.g. 4" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input className="form-input" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="e.g. vegetarian, quick" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ingredients (comma separated)</label>
                    <input className="form-input" value={form.ingredients} onChange={e => setForm(f => ({...f, ingredients: e.target.value}))} placeholder="e.g. eggs, pasta, cream" />
                  </div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}>
                    <label className="form-label">Instructions</label>
                    <textarea className="form-input" rows={4} value={form.instructions} onChange={e => setForm(f => ({...f, instructions: e.target.value}))} placeholder="Step by step instructions..." />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Recipe'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
        )}

        {/* AI Suggest box */}
        <div className="card suggest-box">
          <h3 className="suggest-title">🤖 Find recipes by ingredients</h3>
          <p className="suggest-sub">Enter what you have and we'll suggest matching recipes</p>
          <form onSubmit={handleSuggest} className="suggest-form">
            <input
                className="form-input"
                value={suggestInput}
                onChange={e => setSuggestInput(e.target.value)}
                placeholder="eggs, spinach, milk, pasta..."
                style={{flex:1}}
            />
            <button className="btn btn-primary" type="submit" disabled={suggestLoading}>
              {suggestLoading ? 'Searching…' : 'Suggest'}
            </button>
          </form>

          {suggestions !== null && (
              <div className="suggest-results">
                {suggestions.length === 0 ? (
                    <p className="suggest-none">No matching recipes found for those ingredients.</p>
                ) : suggestions.map(s => (
                    <div key={s.recipeId} className="suggest-result-row">
                      <div className="suggest-result-info">
                        <span className="suggest-result-name">{s.name}</span>
                        <span className="suggest-result-meta">
                    Match: <strong>{s.matchScore}%</strong>
                          {s.missingIngredients.length > 0 && ` · Missing: ${s.missingIngredients.join(', ')}`}
                  </span>
                      </div>
                      <span className={`badge ${s.matchScore >= 80 ? 'badge-green' : 'badge-gray'}`}>{s.matchScore}%</span>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* Filter */}
        <div className="recipes-filter">
          <select className="form-input" value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={{width:'auto'}}>
            <option value="">All recipes</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-free</option>
            <option value="high-protein">High protein</option>
            <option value="quick">Quick</option>
          </select>
        </div>

        {loading ? <div className="loading-spinner" /> : (
            <DataTable columns={columns} data={recipes} emptyMessage="No recipes found." />
        )}
      </div>
  );
}