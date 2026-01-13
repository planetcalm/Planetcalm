import React, { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import { initAffiliateTracking } from './utils/affiliateTracking';
import './styles/App.css';

function App() {
  // Initialize affiliate tracking on app mount
  useEffect(() => {
    initAffiliateTracking();
  }, []);

  return (
    <AppProvider>
      <div className="app">
        <HomePage />
      </div>
    </AppProvider>
  );
}

export default App;
