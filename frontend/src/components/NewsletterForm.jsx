import React, { useState } from 'react';
import { subscriberAPI } from '../utils/api';
import './NewsletterForm.css';

const NewsletterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: ''
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

    // Basic validation
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

    try {
      const result = await subscriberAPI.subscribe(formData);
      
      if (result.success) {
        setSuccess(true);
        setFormData({ firstName: '', email: '' });
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
      <div className="newsletter-success">
        <div className="success-leaf">🍃</div>
        <h3>Your First Whisper Is On Its Way…</h3>
        <p>
          This isn't a newsletter. This is guidance. Gentle reminders. 
          Stories from animals and the earth. A breathing space in your inbox.
        </p>
        <p className="success-note">
          Check your email (and drag us to Primary)
        </p>
      </div>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-inputs">
        <div className="form-group">
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="given-name"
          />
        </div>

        <div className="form-group">
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

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner"></span>
          ) : (
            'Get Whispers'
          )}
        </button>
      </div>

      {error && (
        <div className="form-error-inline">
          {error}
        </div>
      )}
    </form>
  );
};

export default NewsletterForm;
