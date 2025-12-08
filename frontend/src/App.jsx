import React from 'react';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import './styles/App.css';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <HomePage />
      </div>
    </AppProvider>
  );
}

export default App;
