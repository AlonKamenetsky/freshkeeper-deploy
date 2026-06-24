// src/pages/Recipes.js
import React, { useEffect, useState } from 'react';
import { getRecipes, suggestRecipes } from '../services/api';
import DataTable from '../components/DataTable';
import './Recipes.css';

export default function Recipes() {
  const [recipes, setRecipes]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [tagFilter, setTagFilter]   = useState('');
  const [suggestions, setSuggestions]     = useState(null);
  const [suggestInput, setSuggestInput]   = useState('');
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRecipes(tagFilter ? { tags: tagFilter } : {});
        setRecipes(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, [tagFilter]);

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
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Recipes</h1>
        <p className="page-sub">Browse and discover recipes</p>
      </div>

      {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

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
