// src/pages/AiAssistant.js
// AI-powered recipe suggestions and food storage tips

import React, { useState, useEffect } from 'react';
import { getItems, aiSuggestRecipe, aiFoodTips } from '../services/api';
import './AiAssistant.css';

export default function AiAssistant() {
  const [items, setItems]           = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [preferences, setPreferences]   = useState('');
  const [suggestions, setSuggestions]   = useState(null);
  const [loadingAI, setLoadingAI]       = useState(false);
  const [aiError, setAiError]           = useState('');

  const [selectedItem, setSelectedItem]   = useState('');
  const [tips, setTips]                   = useState(null);
  const [loadingTips, setLoadingTips]     = useState(false);
  const [tipsError, setTipsError]         = useState('');

  useEffect(() => {
    getItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoadingItems(false));
  }, []);

  async function handleSuggest() {
    if (items.length === 0) return;
    setLoadingAI(true);
    setAiError('');
    setSuggestions(null);
    try {
      const payload = {
        items: items.map(i => ({ name: i.name, category: i.category, expirationDate: i.expirationDate })),
        preferences: preferences.trim() || undefined,
      };
      const data = await aiSuggestRecipe(payload);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleTips() {
    if (!selectedItem) return;
    const item = items.find(i => String(i.itemId) === String(selectedItem));
    if (!item) return;
    setLoadingTips(true);
    setTipsError('');
    setTips(null);
    try {
      const data = await aiFoodTips({ item });
      setTips(data);
    } catch (err) {
      setTipsError(err.message);
    } finally {
      setLoadingTips(false);
    }
  }

  const expiringSoon = items.filter(i => {
    if (!i.expirationDate) return false;
    const days = Math.ceil((new Date(i.expirationDate) - new Date()) / 86400000);
    return days <= 5;
  });

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1 className="page-title">🤖 AI Assistant</h1>
        <p className="page-sub">Powered by Claude — get smart recipe ideas and food storage tips</p>
      </div>

      {/* ── Section 1: Recipe suggestions ──────────────── */}
      <section className="card ai-section">
        <h2 className="ai-section-title">🍳 Recipe Suggestions</h2>
        <p className="ai-section-sub">AI will look at your pantry and suggest what to cook — prioritising items expiring soon.</p>

        {expiringSoon.length > 0 && (
          <div className="alert alert-warning ai-expiry-note">
            ⚠️ {expiringSoon.length} item{expiringSoon.length > 1 ? 's' : ''} expiring within 5 days:
            {' '}{expiringSoon.map(i => i.name).join(', ')}
          </div>
        )}

        <div className="ai-form-row">
          <input
            className="form-input"
            placeholder="Dietary preferences (optional) e.g. vegetarian, no nuts…"
            value={preferences}
            onChange={e => setPreferences(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleSuggest}
            disabled={loadingAI || loadingItems || items.length === 0}
          >
            {loadingAI ? '⏳ Thinking…' : '✨ Suggest Recipes'}
          </button>
        </div>

        {aiError && <div className="alert alert-error">{aiError}</div>}

        {suggestions && (
          <div className="ai-suggestions">
            {suggestions.length === 0
              ? <p className="ai-empty">No suggestions found. Try adding more items to your pantry.</p>
              : suggestions.map((s, i) => (
                <div key={i} className="ai-card card">
                  <div className="ai-card-header">
                    <span className="ai-card-name">{s.name}</span>
                    <span className="ai-badge">{s.difficulty}</span>
                    <span className="ai-badge ai-badge-time">⏱ {s.estimatedTime}</span>
                  </div>
                  <p className="ai-desc">{s.description}</p>
                  <div className="ai-ingredients">
                    <strong>Key ingredients:</strong> {s.keyIngredients.join(', ')}
                  </div>
                  {s.tip && (
                    <div className="ai-tip">💡 {s.tip}</div>
                  )}
                </div>
              ))
            }
          </div>
        )}
      </section>

      {/* ── Section 2: Food storage tips ───────────────── */}
      <section className="card ai-section">
        <h2 className="ai-section-title">📦 Food Storage Tips</h2>
        <p className="ai-section-sub">Select a pantry item and get AI-powered storage and freshness advice.</p>

        <div className="ai-form-row">
          <select
            className="form-input"
            value={selectedItem}
            onChange={e => setSelectedItem(e.target.value)}
          >
            <option value="">— Select an item —</option>
            {items.map(i => (
              <option key={i.itemId} value={i.itemId}>
                {i.name} ({i.storageType})
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleTips}
            disabled={loadingTips || !selectedItem}
          >
            {loadingTips ? '⏳ Loading…' : '💡 Get Tips'}
          </button>
        </div>

        {tipsError && <div className="alert alert-error">{tipsError}</div>}

        {tips && (
          <div className="ai-tips-result">
            <div className="ai-tips-meta">
              <span>Best storage: <strong>{tips.bestStorage}</strong></span>
              <span>{tips.shelfLifeNote}</span>
            </div>
            {tips.tips?.map((t, i) => (
              <div key={i} className="ai-tip-item">
                <span className="ai-tip-title">{t.title}</span>
                <span className="ai-tip-detail">{t.detail}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
