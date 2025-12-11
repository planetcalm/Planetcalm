import React from 'react';
import Map from '../components/Map';
import PinForm from '../components/PinForm';
import { useApp } from '../context/AppContext';
import './HomePage.css';

const HomePage = () => {
  const { memberCount, isConnected } = useApp();

  return (
    <div className="home-page">
      {/* Logo Header */}
      <header className="site-header">
        <div className="container">
          <img src="/logo.jpeg" alt="Planet Calm" className="site-logo" />
        </div>
      </header>

      {/* Map Section */}
      <section className="map-section map-section-compact" id="map-section">
        <div className="map-bg-pattern"></div>
        <div className="container">
          <Map />
          
          <p className="map-caption">
            Each point is a promise of gentleness in a noisy world.
          </p>
        </div>
      </section>

      {/* Join Form Section - Hero Style */}
      <section className="hero-section">
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
              <img src="/logo.jpeg" alt="Planet Calm" className="footer-logo-img" />
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
