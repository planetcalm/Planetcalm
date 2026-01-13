import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useApp } from '../context/AppContext';
import { MAP_CONFIG } from '../utils/mapStyle';
import './Map.css';

// Set Mapbox token
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Pet emoji icons for markers
const PET_ICONS = {
  Dog: '🐕',
  Cat: '🐱',
  Bird: '🐦',
  Fish: '🐠',
  Rabbit: '🐰',
  Hamster: '🐹',
  Horse: '🐴',
  Reptile: '🦎',
  Other: '🐾'
};

// Vibrant colors for each pet type
const PET_COLORS = {
  Dog: '#FF6B6B',      // Coral Red
  Cat: '#4ECDC4',      // Teal
  Bird: '#FFE66D',     // Sunny Yellow
  Fish: '#4D96FF',     // Ocean Blue
  Rabbit: '#FF9FF3',   // Pink
  Hamster: '#FFA502',  // Orange
  Horse: '#A55EEA',    // Purple
  Reptile: '#26DE81',  // Green
  Other: '#747D8C'     // Gray
};

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  
  const { members, newlyAddedMember, memberCount } = useApp();

  // Scroll to form function
  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token is missing. Please add REACT_APP_MAPBOX_TOKEN to your .env file.');
      return;
    }

    if (map.current) return;

    // Use a colorful map style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Colorful streets style
      center: [MAP_CONFIG.initialViewState.longitude, MAP_CONFIG.initialViewState.latitude],
      zoom: MAP_CONFIG.initialViewState.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      dragRotate: MAP_CONFIG.dragRotate,
      touchPitch: false,
      pitchWithRotate: false,
      antialias: MAP_CONFIG.antialias,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add colorful water
      if (map.current.getLayer('water')) {
        map.current.setPaintProperty('water', 'fill-color', '#74b9ff');
      }
      
      // Make land more colorful
      if (map.current.getLayer('land')) {
        map.current.setPaintProperty('land', 'background-color', '#dfe6e9');
      }
    });

    return () => {
      // Clean up markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when members change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Track which markers to keep
    const currentMemberIds = new Set();

    // Add/update markers for each member
    members.forEach(member => {
      const id = member.properties.id;
      currentMemberIds.add(id);
      
      // Skip if marker already exists
      if (markersRef.current[id]) return;
      
      const coords = member.geometry.coordinates;
      const { petName, petType, petStatus, location } = member.properties;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      const rainbowClass = petStatus === 'in-heart' ? 'has-rainbow' : '';
      el.innerHTML = `
        <div class="marker-container ${rainbowClass}" style="--marker-color: ${PET_COLORS[petType] || PET_COLORS.Other}">
          <div class="marker-icon">${PET_ICONS[petType] || PET_ICONS.Other}</div>
          <div class="marker-pulse"></div>
          ${petStatus === 'in-heart' ? '<div class="marker-rainbow">🌈</div>' : ''}
        </div>
      `;
      
      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25, 
        className: 'pet-popup',
        closeButton: true,
        maxWidth: '250px'
      }).setHTML(`
        <div class="popup-content">
          <div class="popup-icon" style="background: ${PET_COLORS[petType] || PET_COLORS.Other}">
            ${PET_ICONS[petType] || PET_ICONS.Other}
          </div>
          <div class="popup-name">${petName}</div>
          <div class="popup-badge" style="background: ${PET_COLORS[petType] || PET_COLORS.Other}20; color: ${PET_COLORS[petType] || PET_COLORS.Other}">
            ${petType}
          </div>
          <div class="popup-location">📍 ${location}</div>
        </div>
      `);
      
      // Create and add marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current);
      
      markersRef.current[id] = marker;
    });

    // Remove markers that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!currentMemberIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [members, mapLoaded]);

  // Fly to new member with animation
  useEffect(() => {
    if (!newlyAddedMember || !mapLoaded || !map.current) return;

    const coords = newlyAddedMember.coordinates?.coordinates;
    if (coords) {
      map.current.flyTo({
        center: coords,
        zoom: 8,
        duration: 2000,
        essential: true
      });

      // Add special animation to new marker
      const id = newlyAddedMember._id;
      setTimeout(() => {
        const marker = markersRef.current[id];
        if (marker) {
          const el = marker.getElement();
          el.classList.add('new-marker');
          setTimeout(() => el.classList.remove('new-marker'), 3000);
        }
      }, 500);
    }
  }, [newlyAddedMember, mapLoaded]);

  // Error state
  if (mapError) {
    return (
      <div className="map-container">
        <div className="map-error">
          <div className="error-icon">🗺️</div>
          <h3>Map Configuration Required</h3>
          <p>{mapError}</p>
          <div className="error-instructions">
            <p><strong>To fix this:</strong></p>
            <ol>
              <li>Get a free token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer">mapbox.com</a></li>
              <li>Create a <code>.env</code> file in the frontend folder</li>
              <li>Add: <code>REACT_APP_MAPBOX_TOKEN=pk.your_token_here</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      
      {/* Member counter overlay */}
      <div className="map-counter">
        <div className="counter-icon">🐾</div>
        <div className="counter-number">{memberCount.toLocaleString()}</div>
        <div className="counter-label">pets on the map</div>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-title">Pet Types</div>
        <div className="legend-items">
          {Object.entries(PET_ICONS).slice(0, 6).map(([type, icon]) => (
            <div 
              key={type} 
              className="legend-item clickable"
              onClick={scrollToForm}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && scrollToForm()}
              title="Click to add your pet"
            >
              <span className="legend-icon" style={{ background: PET_COLORS[type] }}>{icon}</span>
              <span className="legend-label">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New member notification */}
      {newlyAddedMember && (
        <div className="new-member-toast show">
          <span className="toast-emoji">{PET_ICONS[newlyAddedMember.petType] || '🐾'}</span>
          <div className="toast-content">
            <span className="toast-title">Welcome!</span>
            <span className="toast-text">
              {newlyAddedMember.petName} just joined!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
