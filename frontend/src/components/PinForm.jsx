import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SocialShare from './SocialShare';
import './PinForm.css';

const PET_TYPES = [
  'Dog',
  'Cat',
  'Bird',
  'Fish',
  'Rabbit',
  'Hamster',
  'Horse',
  'Reptile',
  'Other'
];

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'India',
  'Brazil',
  'Japan',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'South Africa',
  'New Zealand',
  'Pakistan',
  'Other'
];

const PinForm = ({ onSuccess }) => {
  const { addMember } = useApp();
  
  // Location mode: 'city' | 'coordinates' | 'gps'
  const [locationMode, setLocationMode] = useState('city');
  
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    petName: '',
    petType: '',
    petStatus: 'with-you', // 'with-you' or 'in-heart'
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
    locationName: '' // For display when using coordinates/GPS
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Handle location mode change
  const handleModeChange = (mode) => {
    setLocationMode(mode);
    setError(null);
    // Clear location-specific fields when switching modes
    if (mode === 'city') {
      setFormData(prev => ({ ...prev, latitude: '', longitude: '', locationName: '' }));
    } else if (mode === 'coordinates') {
      setFormData(prev => ({ ...prev, city: '', state: '', country: '' }));
    }
  };

  // Get current location using GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to reverse geocode to get location name
        let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        
        try {
          // Use Mapbox reverse geocoding (or you can use a free API)
          const token = process.env.REACT_APP_MAPBOX_TOKEN;
          if (token) {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=place,locality`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              locationName = data.features[0].place_name;
            }
          }
        } catch (err) {
          console.log('Reverse geocoding failed, using coordinates');
        }

        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          locationName: locationName,
          city: '',
          state: '',
          country: ''
        }));
        
        setLocationMode('gps');
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access or enter manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please try again or enter manually.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('Unable to get location. Please enter manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic validation - personal info
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      setIsSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      setIsSubmitting(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Basic validation - pet info
    if (!formData.petName.trim()) {
      setError('Please enter your pet\'s name');
      setIsSubmitting(false);
      return;
    }
    if (!formData.petType) {
      setError('Please select your pet type');
      setIsSubmitting(false);
      return;
    }

    // Location validation based on mode
    if (locationMode === 'city') {
      if (!formData.city.trim()) {
        setError('Please enter your city');
        setIsSubmitting(false);
        return;
      }
      if (!formData.country) {
        setError('Please select your country');
        setIsSubmitting(false);
        return;
      }
    } else if (locationMode === 'coordinates' || locationMode === 'gps') {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid latitude and longitude');
        setIsSubmitting(false);
        return;
      }
      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90');
        setIsSubmitting(false);
        return;
      }
      if (lng < -180 || lng > 180) {
        setError('Longitude must be between -180 and 180');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare data based on location mode
      const submitData = {
        firstName: formData.firstName,
        email: formData.email,
        petName: formData.petName,
        petType: formData.petType,
        petStatus: formData.petStatus,
      };

      if (locationMode === 'city') {
        submitData.city = formData.city;
        submitData.state = formData.state;
        submitData.country = formData.country;
      } else {
        // For coordinates/GPS mode, send lat/lng directly
        submitData.latitude = parseFloat(formData.latitude);
        submitData.longitude = parseFloat(formData.longitude);
        submitData.locationName = formData.locationName || `${formData.latitude}, ${formData.longitude}`;
        submitData.useCoordinates = true;
      }

      const result = await addMember(submitData);
      
      if (result.success) {
        setSuccess(true);
        setFormData({
          firstName: '',
          email: '',
          petName: '',
          petType: '',
          petStatus: 'with-you',
          city: '',
          state: '',
          country: '',
          latitude: '',
          longitude: '',
          locationName: ''
        });
        setLocationMode('city');
        onSuccess?.();
        
        // Scroll to map
        setTimeout(() => {
          document.getElementById('map-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 500);
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="form-success">
        <div className="success-icon">🌍</div>
        <h3>Your Pin Has Been Placed!</h3>
        <p>Welcome to the movement. Scroll up to see your pin on the map!</p>
        
        <div className="success-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setSuccess(false)}
          >
            📍 Add Another Pin
          </button>
        </div>

        <div className="success-divider">
          <span>Spread the Word</span>
        </div>
        
        <SocialShare 
          title="Share Planet Calm with others"
          className="compact"
        />
      </div>
    );
  }

  return (
    <form className="pin-form" onSubmit={handleSubmit}>
      {/* Pet Info Section */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="petName" className="form-label">
            Pet's Name
          </label>
          <input
            type="text"
            id="petName"
            name="petName"
            className="form-input"
            placeholder="Luna, Max, Whiskers..."
            value={formData.petName}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="petType" className="form-label">
            Pet Type
          </label>
          <select
            id="petType"
            name="petType"
            className="form-select"
            value={formData.petType}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select pet type</option>
            {PET_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pet Status Section */}
      <div className="pet-status-section">
        <label className="form-label pet-status-label">
          Is your pet...
        </label>
        <div className="pet-status-options">
          <label className={`pet-status-option ${formData.petStatus === 'with-you' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="petStatus"
              value="with-you"
              checked={formData.petStatus === 'with-you'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="status-icon">🐾</span>
            <span className="status-text">With you</span>
          </label>
          
          <label className={`pet-status-option ${formData.petStatus === 'in-heart' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="petStatus"
              value="in-heart"
              checked={formData.petStatus === 'in-heart'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="status-icon">🌈</span>
            <span className="status-text">With you in your heart</span>
          </label>
        </div>
      </div>

      {/* Location Mode Selector */}
      <div className="location-section">
        <div className="location-header">
          <span className="form-label">📍 Location</span>
          <div className="location-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${locationMode === 'city' ? 'active' : ''}`}
              onClick={() => handleModeChange('city')}
              disabled={isSubmitting}
            >
              City
            </button>
            <button
              type="button"
              className={`mode-btn ${locationMode === 'coordinates' ? 'active' : ''}`}
              onClick={() => handleModeChange('coordinates')}
              disabled={isSubmitting}
            >
              Coordinates
            </button>
          </div>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          className="gps-button"
          onClick={getCurrentLocation}
          disabled={isSubmitting || isGettingLocation}
        >
          {isGettingLocation ? (
            <>
              <span className="spinner-small"></span>
              Getting location...
            </>
          ) : (
            <>
              <span className="gps-icon">📍</span>
              Use My Current Location
            </>
          )}
        </button>

        {/* GPS Success Display */}
        {locationMode === 'gps' && formData.latitude && (
          <div className="gps-success">
            <span className="gps-success-icon">✓</span>
            <div className="gps-success-info">
              <span className="gps-success-label">Location detected:</span>
              <span className="gps-success-value">{formData.locationName}</span>
            </div>
            <button 
              type="button" 
              className="gps-clear"
              onClick={() => handleModeChange('city')}
            >
              ✕
            </button>
          </div>
        )}

        {/* City/Country Fields */}
        {locationMode === 'city' && (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input"
                placeholder="Your city"
                value={formData.city}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">
                State / Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-input"
                placeholder="Optional"
                value={formData.state}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <select
                id="country"
                name="country"
                className="form-select"
                value={formData.country}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Manual Coordinates Fields */}
        {locationMode === 'coordinates' && (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="latitude" className="form-label">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                className="form-input"
                placeholder="e.g., 40.7128"
                value={formData.latitude}
                onChange={handleChange}
                disabled={isSubmitting}
                step="any"
                min="-90"
                max="90"
              />
              <span className="form-hint">-90 to 90</span>
            </div>

            <div className="form-group">
              <label htmlFor="longitude" className="form-label">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                className="form-input"
                placeholder="e.g., -74.0060"
                value={formData.longitude}
                onChange={handleChange}
                disabled={isSubmitting}
                step="any"
                min="-180"
                max="180"
              />
              <span className="form-hint">-180 to 180</span>
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="locationName" className="form-label">
                Location Name (optional)
              </label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                className="form-input"
                placeholder="e.g., New York City, USA"
                value={formData.locationName}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="off"
              />
              <span className="form-hint">Display name for your pin</span>
            </div>
          </div>
        )}
      </div>

      {/* Personal Info Section - After Pet and Location */}
      <div className="personal-info-section">
        <h3 className="passport-heading">
          Where should we send your pet's passport for Planet Calm?
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              Your Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-input"
              placeholder="Your Name"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary btn-large btn-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner"></span>
            Placing Your Pin...
          </>
        ) : (
          '📍 Place My Pin'
        )}
      </button>
    </form>
  );
};

export default PinForm;
