import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAffiliateId } from '../utils/affiliateTracking';
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
  
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    petName: '',
    petType: '',
    petStatus: 'with-you', // 'with-you' or 'in-heart'
    city: '',
    state: '',
    country: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Location validation
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

    try {
      // Prepare data with affiliate ID
      console.log('');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║        📤 FORM SUBMISSION: STARTING                   ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      
      console.log('🔍 Retrieving affiliate ID for submission...');
      const affiliateId = getAffiliateId();
      console.log('📊 Retrieved am_id:', affiliateId || '(none)');
      
      const submitData = {
        firstName: formData.firstName,
        email: formData.email,
        petName: formData.petName,
        petType: formData.petType,
        petStatus: formData.petStatus,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        am_id: affiliateId || '' // Include affiliate ID if available
      };

      console.log('');
      console.log('=== COMPLETE SUBMISSION PAYLOAD ===');
      console.log(JSON.stringify(submitData, null, 2));
      console.log('===================================');
      console.log('');
      
      if (affiliateId) {
        console.log('✅ Form includes affiliate ID:', affiliateId);
      } else {
        console.log('⚠️ No affiliate ID - form will submit with empty am_id');
      }
      
      console.log('🚀 Sending to backend...');

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
          country: ''
        });
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

      {/* Location Section */}
      <div className="location-section">
        <div className="location-header">
          <span className="form-label">📍 Location</span>
        </div>

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
