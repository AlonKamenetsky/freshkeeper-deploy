// src/services/api.js — FreshKeeper Final

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function getRole()   { return sessionStorage.getItem('userRole') || 'consumer'; }
function getUserId() { return sessionStorage.getItem('userId')   || ''; }

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-user-role':  getRole(),
    'x-user-id':    getUserId(),
  };
}

async function request(method, path, body = null) {
  const options = { method, headers: getHeaders() };
  if (body) options.body = JSON.stringify(body);
  const res  = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Request failed');
  return data.data;
}

// ── Auth ───────────────────────────────────────────────────
export async function login(email, password) {
  const res  = await fetch(`${BASE_URL}/users/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Login failed');
  sessionStorage.setItem('userRole', data.data.userRole);
  sessionStorage.setItem('userEmail', data.data.email);
  sessionStorage.setItem('userName',  data.data.firstName);
  sessionStorage.setItem('userId',    data.data.userId);
  return data.data;
}

export async function register(firstName, lastName, email, password) {
  const res  = await fetch(`${BASE_URL}/users/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ firstName, lastName, email, password }),
  });
  const data = await res.json();
  if (!data.success) {
    // pass field-level errors through
    const err = new Error(data.error?.message || 'Registration failed');
    err.details = data.error?.details || {};
    throw err;
  }
  // auto-login after register
  sessionStorage.setItem('userRole',  data.data.userRole);
  sessionStorage.setItem('userEmail', data.data.email);
  sessionStorage.setItem('userName',  data.data.firstName);
  sessionStorage.setItem('userId',    data.data.userId);
  return data.data;
}

export function logout() {
  ['userRole', 'userEmail', 'userName', 'userId'].forEach(k => sessionStorage.removeItem(k));
}

export function getCurrentUser() {
  const email = sessionStorage.getItem('userEmail');
  const role  = sessionStorage.getItem('userRole');
  const name  = sessionStorage.getItem('userName');
  const id    = sessionStorage.getItem('userId');
  if (!email) return null;
  return { email, role, name, id };
}

export const updateMe = (body) => request('PUT', '/users/me', body);

// ── Users ──────────────────────────────────────────────────
export const getUsers    = ()      => request('GET',    '/users');
export const getUserById = (id)    => request('GET',    `/users/${id}`);
export const createUser  = (body)  => request('POST',   '/users', body);
export const updateUser  = (id, b) => request('PUT',    `/users/${id}`, b);
export const deleteUser  = (id)    => request('DELETE', `/users/${id}`);

// ── Items ──────────────────────────────────────────────────
export const getItems = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/items${qs ? '?' + qs : ''}`);
};
export const getItemById  = (id)    => request('GET',    `/items/${id}`);
export const createItem   = (body)  => request('POST',   '/items', body);
export const updateItem   = (id, b) => request('PUT',    `/items/${id}`, b);
export const deleteItem   = (id)    => request('DELETE', `/items/${id}`);

// ── Recipes ────────────────────────────────────────────────
export const getRecipes = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/recipes${qs ? '?' + qs : ''}`);
};
export const getRecipeById     = (id)    => request('GET',    `/recipes/${id}`);
export const createRecipe      = (body)  => request('POST',   '/recipes', body);
export const updateRecipe      = (id, b) => request('PUT',    `/recipes/${id}`, b);
export const deleteRecipe      = (id)    => request('DELETE', `/recipes/${id}`);
export const suggestRecipes    = (body)  => request('POST',   '/recipes/suggest', body);
export const predictExpiration = (body)  => request('POST',   '/recipes/predict-expiration', body);

// ── AI ─────────────────────────────────────────────────────
export const aiSuggestRecipe = (body) => request('POST', '/ai/suggest-recipe', body);
export const aiFoodTips      = (body) => request('POST', '/ai/food-tips',       body);
