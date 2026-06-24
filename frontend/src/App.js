// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './services/api';
import Layout      from './components/Layout';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Items       from './pages/Items';
import Recipes     from './pages/Recipes';
import Users       from './pages/Users';
import Settings    from './pages/Settings';
import AiAssistant from './pages/AiAssistant';
import PantryChat  from './components/PantryChat';

function PrivateRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
        } />
        <Route path="/items" element={
          <PrivateRoute><Layout><Items /></Layout></PrivateRoute>
        } />
        <Route path="/recipes" element={
          <PrivateRoute><Layout><Recipes /></Layout></PrivateRoute>
        } />
        <Route path="/ai" element={
          <PrivateRoute><Layout><AiAssistant /></Layout></PrivateRoute>
        } />
        <Route path="/users" element={
          <AdminRoute><Layout><Users /></Layout></AdminRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute><Layout><Settings /></Layout></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <PantryChat />
    </BrowserRouter>
  );
}
