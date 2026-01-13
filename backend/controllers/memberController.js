const Member = require('../models/Member');
const { geocodeLocation } = require('../config/geocoding');
const { emitNewMember, emitMemberCount } = require('../config/socket');
const { normalizeWebhookData } = require('../middleware/validation');
const axios = require('axios');

// GoHighLevel Webhook URL
const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/g97HoHwEZJV52caDhJTZ/webhook-trigger/505dd333-82f7-47e2-818e-7fab42fde380';

/**
 * Send data to GoHighLevel webhook to create contact
 * Includes affiliate tracking (am_id) if available
 */
const sendToGoHighLevel = async (member) => {
  try {
    // Only send if there's an email (GHL needs an identifier)
    if (!member.email) {
      console.log('⚠️ Skipping GHL webhook - no email provided');
      return;
    }

    // Build a FLAT payload for HighLevel
    const payload = {
      first_name: member.firstName || '',
      email: member.email || '',
      pet_name: member.petName || '',
      pet_type: member.petType || '',
      pet_status: member.petStatus || 'with-you',
      city: member.location?.city || '',
      state: member.location?.state || '',
      country: member.location?.country || '',
      am_id: member.affiliateId || '' // Include affiliate ID for tracking
    };

    // Log affiliate tracking if present
    if (member.affiliateId) {
      console.log('📊 Including affiliate ID in GHL webhook:', member.affiliateId);
    }

    console.log('📤 Sending to GoHighLevel:', payload);

    // Send POST to GoHighLevel webhook
    const response = await axios.post(GHL_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10 second timeout
    });

    console.log('✅ GoHighLevel webhook successful:', response.status);
  } catch (error) {
    // Log error but don't fail the member creation
    console.error('❌ GoHighLevel webhook failed:', error.message);
  }
};

/**
 * @desc    Get all members for map display
 * @route   GET /api/members
 * @access  Public
 */
const getMembers = async (req, res) => {
  try {
    const members = await Member.getActiveForMap();
    
    // Transform to GeoJSON format for Mapbox
    const geoJSON = {
      type: 'FeatureCollection',
      features: members.map(member => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: member.coordinates.coordinates
        },
        properties: {
          id: member._id,
          petName: member.petName,
          petType: member.petType,
          petStatus: member.petStatus || 'with-you',
          location: member.location.formatted || member.location.city,
          createdAt: member.createdAt
        }
      }))
    };

    res.json({
      success: true,
      count: members.length,
      data: geoJSON
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get member count
 * @route   GET /api/members/count
 * @access  Public
 */
const getMemberCount = async (req, res) => {
  try {
    const count = await Member.getCount();
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting member count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting member count'
    });
  }
};

/**
 * @desc    Get recent members
 * @route   GET /api/members/recent
 * @access  Public
 */
const getRecentMembers = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const members = await Member.getRecent(limit);
    
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error getting recent members:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recent members'
    });
  }
};

/**
 * @desc    Create new member (from website form)
 * @route   POST /api/members
 * @access  Public
 */
const createMember = async (req, res) => {
  try {
    const { firstName, email, petName, petType, petStatus, city, state, country, latitude, longitude, locationName, useCoordinates, am_id } = req.body;

    let finalLongitude, finalLatitude, locationData;

    // Check if using direct coordinates (GPS or manual entry)
    if (useCoordinates && latitude !== undefined && longitude !== undefined) {
      // Validate coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Coordinates out of valid range'
        });
      }

      // Add small jitter to prevent exact stacking
      const jitterAmount = 0.005;
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.sqrt(Math.random()) * jitterAmount;

      finalLongitude = lng + (Math.cos(angle) * distance);
      finalLatitude = lat + (Math.sin(angle) * distance);

      locationData = {
        city: locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        state: '',
        country: 'GPS Location'
      };

      console.log(`📍 Using direct coordinates: [${finalLongitude}, ${finalLatitude}]`);
    } else {
      // Traditional geocoding from city/country
      if (!city || !country) {
        return res.status(400).json({
          success: false,
          message: 'City and country are required when not using coordinates'
        });
      }

      const geoResult = await geocodeLocation({ city, state, country });
      
      if (!geoResult) {
        return res.status(400).json({
          success: false,
          message: 'Could not geocode the provided location. Please check your city and country.'
        });
      }

      finalLongitude = geoResult.longitude;
      finalLatitude = geoResult.latitude;

      locationData = {
        city,
        state: state || '',
        country
      };
    }

    // Create the member
    const member = await Member.create({
      firstName,
      email,
      petName,
      petType,
      petStatus: petStatus || 'with-you',
      location: locationData,
      coordinates: {
        type: 'Point',
        coordinates: [finalLongitude, finalLatitude]
      },
      source: 'website',
      affiliateId: am_id || undefined // Store affiliate ID if provided
    });

    // Log affiliate tracking
    if (am_id) {
      console.log(`📊 Member created with affiliate ID: ${am_id}`);
    }

    // Emit to all connected clients via WebSocket
    emitNewMember(member);
    emitMemberCount();

    // Send to GoHighLevel (includes affiliate ID)
    await sendToGoHighLevel(member);

    console.log(`✅ New member created: ${petName} (${petType}) at [${finalLongitude}, ${finalLatitude}]`);

    res.status(201).json({
      success: true,
      message: 'Welcome to Planet Calm! Your pin has been placed.',
      data: {
        id: member._id,
        petName: member.petName,
        petType: member.petType,
        location: member.location,
        coordinates: {
          lat: finalLatitude,
          lng: finalLongitude
        }
      }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    
    // Handle duplicate entries gracefully
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This entry may already exist.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Webhook endpoint for GoHighLevel/Make.com/Zapier
 * @route   POST /api/members/webhook
 * @access  Public (with optional secret validation)
 */
const webhookCreateMember = async (req, res) => {
  try {
    console.log('📨 Webhook received:', JSON.stringify(req.body, null, 2));

    // Verify webhook secret if configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
      if (providedSecret !== webhookSecret) {
        console.warn('⚠️ Invalid webhook secret');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook secret'
        });
      }
    }

    // Use normalized data from middleware or normalize here
    const data = req.normalizedData || normalizeWebhookData(req.body);
    
    const { petName, petType, petStatus, city, state, country } = data;
    
    // Check for direct coordinates in webhook
    const latitude = req.body.latitude || req.body.lat;
    const longitude = req.body.longitude || req.body.lng || req.body.lon;

    // Validate required fields
    if (!petName) {
      console.warn('⚠️ Missing petName in webhook');
      return res.status(400).json({
        success: false,
        message: 'Missing required field: petName',
        received: data
      });
    }

    let finalLongitude, finalLatitude, locationData;

    // Check if direct coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        // Add jitter
        const jitterAmount = 0.005;
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random()) * jitterAmount;

        finalLongitude = lng + (Math.cos(angle) * distance);
        finalLatitude = lat + (Math.sin(angle) * distance);

        locationData = {
          city: city || req.body.locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          state: state || '',
          country: country || 'GPS Location'
        };

        console.log(`📍 Webhook using direct coordinates: [${finalLongitude}, ${finalLatitude}]`);
      }
    }

    // If no valid coordinates, try geocoding
    if (!finalLatitude || !finalLongitude) {
      if (!city || !country) {
        console.warn('⚠️ Missing required location fields in webhook');
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: either (latitude, longitude) or (city, country) required',
          received: data
        });
      }

      const geoResult = await geocodeLocation({ city, state, country });
      
      if (!geoResult) {
        console.warn(`⚠️ Geocoding failed for: ${city}, ${state}, ${country}`);
        return res.status(400).json({
          success: false,
          message: 'Could not geocode location'
        });
      }

      finalLongitude = geoResult.longitude;
      finalLatitude = geoResult.latitude;

      locationData = {
        city,
        state: state || '',
        country
      };
    }

    // Create the member
    const member = await Member.create({
      petName,
      petType: petType || 'Other',
      petStatus: petStatus || 'with-you',
      location: locationData,
      coordinates: {
        type: 'Point',
        coordinates: [finalLongitude, finalLatitude]
      },
      source: 'webhook'
    });

    // 🔥 THIS IS THE KEY PART - Emit to all connected clients via WebSocket
    emitNewMember(member);
    emitMemberCount();

    console.log(`✅ Webhook: New member created: ${petName} (${petType}) at [${finalLongitude}, ${finalLatitude}]`);

    // Return success - Make.com/Zapier will see this response
    res.status(201).json({
      success: true,
      message: 'Pin placed successfully',
      data: {
        id: member._id,
        petName: member.petName,
        petType: member.petType,
        location: member.location.formatted,
        coordinates: {
          lat: finalLatitude,
          lng: finalLongitude
        }
      }
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Test webhook endpoint
 * @route   POST /api/members/webhook/test
 * @access  Public
 */
const testWebhook = async (req, res) => {
  console.log('🧪 Test webhook received:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  const normalized = normalizeWebhookData(req.body);
  
  res.json({
    success: true,
    message: 'Test webhook received successfully',
    receivedData: req.body,
    normalizedData: normalized,
    headers: {
      contentType: req.headers['content-type'],
      webhookSecret: req.headers['x-webhook-secret'] ? 'provided' : 'not provided'
    }
  });
};

/**
 * @desc    Get single member
 * @route   GET /api/members/:id
 * @access  Public
 */
const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching member'
    });
  }
};

module.exports = {
  getMembers,
  getMemberCount,
  getRecentMembers,
  createMember,
  webhookCreateMember,
  testWebhook,
  getMember
};
