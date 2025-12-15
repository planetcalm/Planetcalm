import React from 'react';
import Map from '../components/Map';
import PinForm from '../components/PinForm';
import { useApp } from '../context/AppContext';
import './HomePage.css';

const HomePage = () => {
  const { memberCount, isConnected, newlyAddedMember } = useApp();

  const scrollToForm = (e) => {
    e.preventDefault();
    document.getElementById('form-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="home-page">
      {/* Logo Header */}
      <header className="site-header">
        <div className="container">
          <a href="https://planetcalm.co" target="_blank" rel="noopener noreferrer" className="site-logo-link">
            <img src="/logo.png" alt="Planet Calm" className="site-logo" />
          </a>
        </div>
      </header>

      {/* Map Section */}
      <section className="map-section map-section-compact" id="map-section">
        <div className="map-bg-pattern"></div>
        
        {/* Floating CTA on Map - Show only if no new member */}
        {!newlyAddedMember && (
          <div className="map-cta-overlay">
            <a href="#form-section" onClick={scrollToForm} className="map-cta-button-float">
              <span className="cta-icon">📍</span>
              <span className="cta-text">Add Your Pet to the Map</span>
            </a>
          </div>
        )}
        
        {/* Success Banner - Show after adding pet */}
        {newlyAddedMember && (
          <div className="map-success-banner">
            <div className="success-banner-content">
              <span className="success-banner-icon">🎉</span>
              <div className="success-banner-text">
                <strong>Pin Added!</strong>
                <span>Your pet is now on the map</span>
              </div>
            </div>
            <div className="success-banner-actions">
              <button onClick={scrollToForm} className="banner-btn banner-btn-primary">
                Add Another Pet
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Planet Calm',
                      text: 'I just added my pet to Planet Calm! Join the movement 🐾',
                      url: window.location.href
                    });
                  } else {
                    scrollToForm();
                  }
                }} 
                className="banner-btn banner-btn-secondary"
              >
                Share Map
              </button>
            </div>
          </div>
        )}
        
        <div className="container">
          <Map />
          
          <p className="map-caption">
            Each point is a promise of gentleness in a noisy world.
          </p>
        </div>
      </section>

      {/* Join Form Section - Hero Style */}
      <section className="hero-section" id="form-section">
        <div className="hero-background">
          <div className="hero-bg-image"></div>
          <div className="hero-gradient"></div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-icon">🐾</span>
              <span>Join {memberCount.toLocaleString()}+ pet lovers worldwide</span>
            </div>
            
            <h1 className="hero-title">
              A Calm-First World<br />
              <span className="hero-title-accent">Begins With Us.</span>
            </h1>
            
            <p className="hero-subtitle">
              Add your pin to the map and join the movement that's restoring 
              peace to pets and their people.
            </p>
            
            <div className="hero-form-card">
              <PinForm />
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hero-decoration hero-decoration-1"></div>
        <div className="hero-decoration hero-decoration-2"></div>
        <div className="hero-decoration hero-decoration-3"></div>
        <div className="hero-decoration hero-decoration-4"></div>
      </section>

      {/* Pet Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Calm Community</h2>
            <p className="section-subtitle">
              Pets around the world embracing peace and tranquility
            </p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Peaceful golden retriever"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Calm cat"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Serene hamster"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="/images/horse.jpg" 
                alt="Majestic horse running in field"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="/images/birds.jpg" 
                alt="Colorful lovebirds pair"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="/images/fish.jpg" 
                alt="Beautiful tropical angelfish"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-bg-pattern"></div>
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src="/logo.png" alt="Planet Calm" className="footer-logo-img" />
            </div>
            
            <div className="footer-stats">
              <span className="footer-stat">
                {memberCount.toLocaleString()} hearts and counting
              </span>
              {isConnected && (
                <span className="connection-indicator" title="Real-time updates active">
                  <span className="pulse-dot"></span>
                  Live
                </span>
              )}
            </div>
            
            <p className="footer-tagline">
              Calm Changes Everything.
            </p>
            
            <div className="footer-links">
              <a href="#map-section">View Map</a>
              <a href="#form-section">Join</a>
              <a href="mailto:hello@planetcalm.com">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
