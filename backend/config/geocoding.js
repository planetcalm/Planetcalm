const axios = require('axios');

/**
 * Geocoding service using Mapbox Geocoding API
 * Converts city/state/country to latitude/longitude coordinates
 * Includes jittering to prevent pins from stacking on same coordinates
 */

const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/** Map form country names → ISO 3166-1 alpha-2 for Mapbox (reduces e.g. Paris, France → Paris TX) */
const COUNTRY_TO_ISO2 = {
  'united states': 'us',
  usa: 'us',
  canada: 'ca',
  'united kingdom': 'gb',
  uk: 'gb',
  australia: 'au',
  germany: 'de',
  france: 'fr',
  india: 'in',
  brazil: 'br',
  japan: 'jp',
  mexico: 'mx',
  spain: 'es',
  italy: 'it',
  netherlands: 'nl',
  'south africa': 'za',
  'new zealand': 'nz',
  pakistan: 'pk',
  other: ''
};

/**
 * Add small random offset to coordinates to prevent pin stacking
 * The jitter is small enough to keep pins in the same visual area
 * but large enough to see all pins when zoomed in
 * 
 * @param {number} longitude - Original longitude
 * @param {number} latitude - Original latitude
 * @param {number} jitterAmount - Amount of jitter (default 0.01 ≈ 1km)
 * @returns {Object} - { longitude, latitude } with jitter applied
 */
const addJitter = (longitude, latitude, jitterAmount = 0.008) => {
  // Random angle for circular distribution
  const angle = Math.random() * 2 * Math.PI;
  // Random distance (using sqrt for even distribution)
  const distance = Math.sqrt(Math.random()) * jitterAmount;
  
  return {
    longitude: longitude + (Math.cos(angle) * distance),
    latitude: latitude + (Math.sin(angle) * distance)
  };
};

/**
 * Geocode a location string to coordinates
 * @param {Object} location - Location object with city, state, country
 * @param {boolean} applyJitter - Whether to add jitter (default true)
 * @returns {Object} - { longitude, latitude } or null if not found
 */
const geocodeLocation = async (location, applyJitter = true) => {
  try {
    const { city, state, country } = location;
    
    // Build search query
    const searchParts = [city];
    if (state) searchParts.push(state);
    searchParts.push(country);
    const searchQuery = searchParts.join(', ');
    
    console.log(`🔍 Geocoding: ${searchQuery}`);
    
    const countryIso = COUNTRY_TO_ISO2[(country || '').toLowerCase().trim()] || '';

    const response = await axios.get(
      `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(searchQuery)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN,
          types: 'place,locality,region', // Focus on cities and regions
          limit: 1,
          ...(countryIso ? { country: countryIso } : {})
        }
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      let [longitude, latitude] = response.data.features[0].center;
      
      // Apply jitter to prevent pins from stacking
      if (applyJitter) {
        const jittered = addJitter(longitude, latitude);
        longitude = jittered.longitude;
        latitude = jittered.latitude;
        console.log(`📍 Found coordinates: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}] (with jitter)`);
      } else {
        console.log(`📍 Found coordinates: [${longitude}, ${latitude}]`);
      }
      
      return {
        longitude,
        latitude,
        confidence: response.data.features[0].relevance || 1
      };
    }

    console.warn(`⚠️ No results found for: ${searchQuery}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    // If Mapbox fails, try a fallback approach
    return fallbackGeocode(location);
  }
};

/**
 * Fallback geocoding using approximate country/region centers
 * Used when API fails or quota exceeded
 */
const fallbackGeocode = (location) => {
  // Common country centers as fallback
  const countryCenters = {
    'united states': { longitude: -98.5795, latitude: 39.8283 },
    'usa': { longitude: -98.5795, latitude: 39.8283 },
    'canada': { longitude: -106.3468, latitude: 56.1304 },
    'united kingdom': { longitude: -3.4360, latitude: 55.3781 },
    'uk': { longitude: -3.4360, latitude: 55.3781 },
    'australia': { longitude: 133.7751, latitude: -25.2744 },
    'germany': { longitude: 10.4515, latitude: 51.1657 },
    'france': { longitude: 2.2137, latitude: 46.2276 },
    'india': { longitude: 78.9629, latitude: 20.5937 },
    'brazil': { longitude: -51.9253, latitude: -14.2350 },
    'japan': { longitude: 138.2529, latitude: 36.2048 },
    'mexico': { longitude: -102.5528, latitude: 23.6345 },
    'spain': { longitude: -3.7492, latitude: 40.4637 },
    'italy': { longitude: 12.5674, latitude: 41.8719 },
    'netherlands': { longitude: 5.2913, latitude: 52.1326 },
    'south africa': { longitude: 22.9375, latitude: -30.5595 },
    'new zealand': { longitude: 174.8860, latitude: -40.9006 },
    'pakistan': { longitude: 69.3451, latitude: 30.3753 }
  };

  const countryLower = location.country?.toLowerCase() || '';
  const fallback = countryCenters[countryLower];
  
  if (fallback) {
    console.log(`📍 Using fallback coordinates for ${location.country}`);
    // Add some randomness to prevent pins stacking
    return {
      longitude: fallback.longitude + (Math.random() - 0.5) * 5,
      latitude: fallback.latitude + (Math.random() - 0.5) * 5,
      confidence: 0.3,
      isFallback: true
    };
  }

  // Ultimate fallback - random position
  console.warn(`⚠️ No fallback found, using random position`);
  return {
    longitude: (Math.random() * 360) - 180,
    latitude: (Math.random() * 140) - 70,
    confidence: 0.1,
    isFallback: true
  };
};

/**
 * Batch geocode multiple locations
 * @param {Array} locations - Array of location objects
 * @returns {Array} - Array of { location, coordinates } objects
 */
const batchGeocode = async (locations) => {
  const results = [];
  
  // Process sequentially to avoid rate limits
  for (const location of locations) {
    const coordinates = await geocodeLocation(location);
    results.push({ location, coordinates });
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
};

module.exports = {
  geocodeLocation,
  batchGeocode,
  fallbackGeocode,
  addJitter
};
