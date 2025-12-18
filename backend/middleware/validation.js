const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for member/pin creation (supports both city and coordinates mode)
const validateMember = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name must be less than 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail({ gmail_remove_dots: false }),
  
  body('petName')
    .trim()
    .notEmpty().withMessage('Pet name is required')
    .isLength({ max: 100 }).withMessage('Pet name must be less than 100 characters'),
  
  body('petType')
    .trim()
    .notEmpty().withMessage('Pet type is required')
    .isIn(['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Horse', 'Reptile', 'Other'])
    .withMessage('Invalid pet type'),
  
  // City - optional if using coordinates
  body('city')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('City must be less than 200 characters'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('State must be less than 200 characters'),
  
  // Country - optional if using coordinates
  body('country')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Country must be less than 200 characters'),
  
  // Latitude - optional, required if useCoordinates is true
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  // Longitude - optional, required if useCoordinates is true
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  // Location name - optional
  body('locationName')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Location name must be less than 500 characters'),
  
  // useCoordinates flag
  body('useCoordinates')
    .optional()
    .isBoolean().withMessage('useCoordinates must be a boolean'),
  
  // Custom validation to ensure we have either city/country OR coordinates
  (req, res, next) => {
    const { city, country, latitude, longitude, useCoordinates } = req.body;
    
    if (useCoordinates) {
      // Coordinates mode - need lat and lng
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required when using coordinates mode'
        });
      }
    } else {
      // City mode - need city and country
      if (!city || !city.trim()) {
        return res.status(400).json({
          success: false,
          message: 'City is required'
        });
      }
      if (!country || !country.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Country is required'
        });
      }
    }
    
    next();
  },
  
  handleValidationErrors
];

// Validation rules for webhook (more flexible field names, supports coordinates)
const validateWebhook = [
  body('petName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Pet name must be less than 100 characters'),
  
  body('pet_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Pet name must be less than 100 characters'),
  
  body('petType')
    .optional()
    .trim(),
  
  body('pet_type')
    .optional()
    .trim(),
  
  body('city')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('City must be less than 200 characters'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('State must be less than 200 characters'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Country must be less than 200 characters'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  body('lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  body('lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  body('lon')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  // Custom validation to ensure we have minimum required data
  (req, res, next) => {
    const data = normalizeWebhookData(req.body);
    
    // Check for coordinates
    const latitude = req.body.latitude || req.body.lat;
    const longitude = req.body.longitude || req.body.lng || req.body.lon;
    const hasCoordinates = latitude !== undefined && longitude !== undefined;
    
    if (!data.petName) {
      return res.status(400).json({
        success: false,
        message: 'Pet name is required',
        receivedData: req.body
      });
    }
    
    // Need either coordinates OR city/country
    if (!hasCoordinates && (!data.city || !data.country)) {
      return res.status(400).json({
        success: false,
        message: 'Either (latitude, longitude) or (city, country) is required',
        receivedData: req.body
      });
    }
    
    // Attach normalized data to request
    req.normalizedData = data;
    next();
  }
];

// Validation for subscriber/newsletter signup
const validateSubscriber = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name must be less than 100 characters')
    .escape(),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail({ gmail_remove_dots: false }),
  
  handleValidationErrors
];

/**
 * Normalize webhook data from various sources (GoHighLevel, Make.com, Zapier)
 * Handles different field naming conventions
 */
function normalizeWebhookData(data) {
  // Handle nested data structures
  const flatData = data.data || data.fields || data;
  
  return {
    petName: flatData.petName || flatData.pet_name || flatData['Pet Name'] || flatData['pet-name'] || '',
    petType: flatData.petType || flatData.pet_type || flatData['Pet Type'] || flatData['pet-type'] || 'Other',
    petStatus: flatData.petStatus || flatData.pet_status || flatData['Pet Status'] || flatData['pet-status'] || 'with-you',
    city: flatData.city || flatData.City || flatData['city'] || '',
    state: flatData.state || flatData.State || flatData['state'] || flatData.province || flatData.Province || '',
    country: flatData.country || flatData.Country || flatData['country'] || '',
    email: flatData.email || flatData.Email || flatData['email'] || '',
    source: data.source || 'webhook'
  };
}

module.exports = {
  validateMember,
  validateWebhook,
  validateSubscriber,
  handleValidationErrors,
  normalizeWebhookData
};
