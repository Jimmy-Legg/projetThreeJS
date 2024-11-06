import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import DreamsDonutsPage from './DreamsDonutsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/DreamsDonutsPage" element={<DreamsDonutsPage />} />
      </Routes>
    </Router>
  );
}

export default App;