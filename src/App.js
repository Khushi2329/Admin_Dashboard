// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import BookTable from './components/BookTable';
import Login from './components/Login';

function App() {
  const [auth, setAuth] = useState(false);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Book Dashboard</h1>
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<Login setAuth={setAuth} />} />
            <Route path="/dashboard" element={auth ? <BookTable /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
