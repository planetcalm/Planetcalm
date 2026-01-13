/**
 * Affiliate Tracking Utility
 * 
 * Captures and persists affiliate IDs (am_id) from URL parameters
 * Stores in both localStorage and cookies for redundancy
 * Survives page refreshes, navigation, and returns within 30 days
 */

const AFFILIATE_PARAM = 'am_id';
const STORAGE_KEY = 'affiliate_id';
const COOKIE_NAME = 'affiliate_id';
const EXPIRY_DAYS = 30;

/**
 * Extract am_id parameter from current URL
 * @returns {string|null} The affiliate ID or null if not found
 */
export const captureAffiliateId = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateId = urlParams.get(AFFILIATE_PARAM);
    
    if (affiliateId && affiliateId.trim()) {
      console.log('✅ Affiliate ID captured from URL:', affiliateId);
      return affiliateId.trim();
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error capturing affiliate ID:', error);
    return null;
  }
};

/**
 * Store affiliate ID in both localStorage and cookie
 * @param {string} affiliateId - The affiliate ID to store
 */
export const storeAffiliateId = (affiliateId) => {
  if (!affiliateId || !affiliateId.trim()) {
    console.warn('⚠️ Cannot store empty affiliate ID');
    return false;
  }

  const cleanId = affiliateId.trim();
  
  try {
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, cleanId);
    
    // Store in cookie with 30-day expiration
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
    
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cleanId)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    console.log(`✅ Affiliate ID stored: ${cleanId} (expires in ${EXPIRY_DAYS} days)`);
    return true;
  } catch (error) {
    console.error('❌ Error storing affiliate ID:', error);
    return false;
  }
};

/**
 * Retrieve stored affiliate ID from localStorage or cookie
 * @returns {string|null} The stored affiliate ID or null
 */
export const getAffiliateId = () => {
  try {
    // Try localStorage first (faster)
    let affiliateId = localStorage.getItem(STORAGE_KEY);
    
    // Fallback to cookie if localStorage is empty
    if (!affiliateId) {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${COOKIE_NAME}=`));
      
      if (cookieValue) {
        affiliateId = decodeURIComponent(cookieValue.split('=')[1]);
        
        // Sync back to localStorage if found in cookie
        if (affiliateId) {
          localStorage.setItem(STORAGE_KEY, affiliateId);
        }
      }
    }
    
    return affiliateId || null;
  } catch (error) {
    console.error('❌ Error retrieving affiliate ID:', error);
    return null;
  }
};

/**
 * Clear stored affiliate ID (for testing or manual clearing)
 */
export const clearAffiliateId = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log('✅ Affiliate ID cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing affiliate ID:', error);
    return false;
  }
};

/**
 * Main initialization function - Call this on app load
 * Automatically captures and stores affiliate ID if present in URL
 * @returns {string|null} The affiliate ID (captured or existing)
 */
export const initAffiliateTracking = () => {
  console.log('🔍 Initializing affiliate tracking...');
  
  // Check if there's an affiliate ID in the current URL
  const capturedId = captureAffiliateId();
  
  if (capturedId) {
    // New affiliate ID in URL - store it (overwrites existing)
    storeAffiliateId(capturedId);
    return capturedId;
  }
  
  // No affiliate ID in URL - check if we have one stored
  const existingId = getAffiliateId();
  
  if (existingId) {
    console.log('✅ Using existing affiliate ID:', existingId);
    return existingId;
  }
  
  console.log('ℹ️ No affiliate ID found');
  return null;
};

/**
 * Check if user has an active affiliate tracking
 * @returns {boolean}
 */
export const hasAffiliateId = () => {
  return getAffiliateId() !== null;
};

/**
 * Get affiliate tracking status for debugging
 * @returns {object} Current tracking status
 */
export const getTrackingStatus = () => {
  const affiliateId = getAffiliateId();
  const urlParam = captureAffiliateId();
  
  return {
    hasActiveTracking: !!affiliateId,
    currentAffiliateId: affiliateId,
    urlParameter: urlParam,
    storageAvailable: typeof localStorage !== 'undefined',
    cookieEnabled: navigator.cookieEnabled
  };
};

// Export as default for convenience
export default {
  initAffiliateTracking,
  captureAffiliateId,
  storeAffiliateId,
  getAffiliateId,
  clearAffiliateId,
  hasAffiliateId,
  getTrackingStatus
};

