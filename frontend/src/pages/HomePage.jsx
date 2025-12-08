import React from 'react';
import Map from '../components/Map';
import PinForm from '../components/PinForm';
import NewsletterForm from '../components/NewsletterForm';
import { useApp } from '../context/AppContext';
import './HomePage.css';

const HomePage = () => {
  const { memberCount, isConnected } = useApp();

  return (
    <div className="home-page">
      {/* Hero Section */}
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
        
        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span>Explore the map</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section" id="map-section">
        <div className="map-bg-pattern"></div>
        <div className="container">
          <div className="section-header">
            <span className="section-icon">🌍</span>
            <h2 className="section-title">
              You're Not Alone.
            </h2>
            <p className="section-subtitle">
              Every pin is a person, a family, a pet, a heart choosing calm.
            </p>
          </div>
          
          <Map />
          
          <p className="map-caption">
            Each point is a promise of gentleness in a noisy world.
          </p>
        </div>
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
                alt="Serene bunny"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Happy dog in nature"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Relaxed tabby cat"
                loading="lazy"
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Peaceful parrot"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{memberCount.toLocaleString()}+</div>
              <div className="stat-label">Members Worldwide</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Love Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-bg">
          <div className="newsletter-bg-image"></div>
        </div>
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-header">
              <span className="newsletter-icon">🍃</span>
              <span className="newsletter-badge">Take the Next Step</span>
              <h2 className="section-title">
                Get Whispers of the Wild
              </h2>
              <p className="section-subtitle">
                Start your calm journey with gentle guidance delivered to your inbox.
              </p>
            </div>
            
            <div className="newsletter-card">
              <NewsletterForm />
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
              <span className="footer-logo">🌿</span>
              <span className="footer-name">Planet Calm</span>
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
              Restoring peace to pets and their people.
            </p>
            
            <div className="footer-links">
              <a href="#map-section">View Map</a>
              <a href="mailto:hello@planetcalm.com">Contact</a>
              <a href="/privacy">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
