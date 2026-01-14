/**
 * Affiliate Tracking Utility - ENHANCED WITH COMPREHENSIVE DEBUGGING
 * 
 * Captures and persists affiliate IDs (am_id) from URL parameters
 * Stores in localStorage, sessionStorage, and cookies for triple redundancy
 * Survives page refreshes, navigation, and returns within 30 days
 */

const AFFILIATE_PARAM = 'am_id';
const STORAGE_KEY = 'affiliate_id';
const COOKIE_NAME = 'affiliate_id';
const EXPIRY_DAYS = 30;

/**
 * Extract am_id parameter from current URL (query params OR hash fragment)
 * Supports multiple formats to survive redirects:
 * - ?am_id=value (standard query parameter)
 * - #am_id=value (hash fragment - survives redirects)
 * - #/path?am_id=value (hash with query)
 * @returns {string|null} The affiliate ID or null if not found
 */
export const captureAffiliateId = () => {
  console.log('=== AFFILIATE CAPTURE: STARTING ===');
  console.log('🔍 Page loaded, checking for am_id...');
  console.log('📍 Current URL:', window.location.href);
  console.log('🔎 Search params string:', window.location.search);
  console.log('🔗 Hash fragment:', window.location.hash);
  
  try {
    let affiliateId = null;
    
    // METHOD 1: Check standard URL query parameters
    console.log('1️⃣ Checking URL query parameters...');
    const urlParams = new URLSearchParams(window.location.search);
    console.log('📊 All URL parameters:', Object.fromEntries(urlParams.entries()));
    
    affiliateId = urlParams.get(AFFILIATE_PARAM);
    console.log(`   Query param ${AFFILIATE_PARAM}:`, affiliateId);
    
    if (affiliateId && affiliateId.trim()) {
      console.log('✅ SUCCESS: Affiliate ID found in query parameters:', affiliateId);
      console.log('🔢 Length:', affiliateId.length, 'characters');
      return affiliateId.trim();
    }
    
    // METHOD 2: Check hash fragment (survives redirects!)
    console.log('2️⃣ Checking hash fragment (redirect-safe)...');
    if (window.location.hash) {
      // Remove the leading # and check for am_id
      const hash = window.location.hash.substring(1);
      console.log('   Raw hash:', hash);
      
      // Try parsing as query string (e.g., #am_id=value or #?am_id=value)
      const hashQuery = hash.startsWith('?') ? hash.substring(1) : hash;
      const hashParams = new URLSearchParams(hashQuery);
      
      affiliateId = hashParams.get(AFFILIATE_PARAM);
      console.log(`   Hash param ${AFFILIATE_PARAM}:`, affiliateId);
      
      if (affiliateId && affiliateId.trim()) {
        console.log('✅ SUCCESS: Affiliate ID found in hash fragment:', affiliateId);
        console.log('🔢 Length:', affiliateId.length, 'characters');
        console.log('🛡️ (Hash fragments survive redirects - smart!')
        
        // Clean the hash from URL after capturing (optional, keeps URL clean)
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('🧹 Cleaned hash from URL');
        }
        
        return affiliateId.trim();
      }
    } else {
      console.log('   No hash fragment present');
    }
    
    console.log('⚠️ No am_id found in URL parameters or hash fragment');
    return null;
  } catch (error) {
    console.error('❌ CRITICAL ERROR capturing affiliate ID:', error);
    console.error('Error stack:', error.stack);
    return null;
  }
};

/**
 * Store affiliate ID in localStorage, sessionStorage, and cookie
 * @param {string} affiliateId - The affiliate ID to store
 */
export const storeAffiliateId = (affiliateId) => {
  console.log('=== AFFILIATE STORAGE: STARTING ===');
  console.log('📥 Attempting to store am_id:', affiliateId);
  
  if (!affiliateId || !affiliateId.trim()) {
    console.warn('⚠️ Cannot store empty affiliate ID');
    return false;
  }

  const cleanId = affiliateId.trim();
  console.log('🧹 Cleaned am_id:', cleanId);
  
  try {
    // Check if storage is available
    console.log('🔐 Checking storage availability...');
    console.log('   - localStorage available:', typeof localStorage !== 'undefined');
    console.log('   - sessionStorage available:', typeof sessionStorage !== 'undefined');
    console.log('   - cookies enabled:', navigator.cookieEnabled);
    
    // Store in localStorage
    console.log('💾 Storing in localStorage...');
    localStorage.setItem(STORAGE_KEY, cleanId);
    const storedInLocalStorage = localStorage.getItem(STORAGE_KEY);
    console.log('✅ Verified in localStorage:', storedInLocalStorage);
    
    // Store in sessionStorage as backup
    console.log('💾 Storing in sessionStorage (backup)...');
    sessionStorage.setItem(STORAGE_KEY, cleanId);
    const storedInSessionStorage = sessionStorage.getItem(STORAGE_KEY);
    console.log('✅ Verified in sessionStorage:', storedInSessionStorage);
    
    // Store in cookie with 30-day expiration
    console.log('🍪 Storing in cookie...');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
    
    const cookieString = `${COOKIE_NAME}=${encodeURIComponent(cleanId)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
    console.log('🍪 Cookie set with expiry:', expiryDate.toUTCString());
    console.log('🍪 All cookies:', document.cookie);
    
    console.log(`✅ SUCCESS: Affiliate ID stored in all three locations!`);
    console.log(`   - Value: "${cleanId}"`);
    console.log(`   - Expires: ${EXPIRY_DAYS} days from now`);
    console.log('=== AFFILIATE STORAGE: COMPLETE ===');
    
    return true;
  } catch (error) {
    console.error('❌ CRITICAL ERROR storing affiliate ID:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try to identify the specific storage that failed
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('✅ localStorage is working');
    } catch (e) {
      console.error('❌ localStorage is blocked or unavailable:', e.message);
    }
    
    return false;
  }
};

/**
 * Retrieve stored affiliate ID from localStorage, sessionStorage, or cookie
 * @returns {string|null} The stored affiliate ID or null
 */
export const getAffiliateId = () => {
  console.log('=== AFFILIATE RETRIEVAL: STARTING ===');
  console.log('🔍 Retrieving am_id from storage...');
  
  try {
    let affiliateId = null;
    
    // Try localStorage first (primary storage)
    console.log('1️⃣ Checking localStorage...');
    affiliateId = localStorage.getItem(STORAGE_KEY);
    console.log('   localStorage value:', affiliateId);
    
    if (affiliateId) {
      console.log('✅ Found in localStorage:', affiliateId);
      console.log('=== AFFILIATE RETRIEVAL: SUCCESS (localStorage) ===');
      return affiliateId;
    }
    
    // Try sessionStorage (backup storage)
    console.log('2️⃣ Checking sessionStorage...');
    affiliateId = sessionStorage.getItem(STORAGE_KEY);
    console.log('   sessionStorage value:', affiliateId);
    
    if (affiliateId) {
      console.log('✅ Found in sessionStorage:', affiliateId);
      console.log('💾 Syncing back to localStorage...');
      try {
        localStorage.setItem(STORAGE_KEY, affiliateId);
        console.log('✅ Synced to localStorage');
      } catch (e) {
        console.warn('⚠️ Could not sync to localStorage:', e.message);
      }
      console.log('=== AFFILIATE RETRIEVAL: SUCCESS (sessionStorage) ===');
      return affiliateId;
    }
    
    // Try cookie (tertiary fallback)
    console.log('3️⃣ Checking cookies...');
    console.log('   All cookies:', document.cookie);
    
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`));
    
    console.log('   Matching cookie:', cookieValue);
    
    if (cookieValue) {
      affiliateId = decodeURIComponent(cookieValue.split('=')[1]);
      console.log('✅ Found in cookie:', affiliateId);
      
      // Sync back to storage if found in cookie
      console.log('💾 Syncing back to localStorage and sessionStorage...');
      try {
        localStorage.setItem(STORAGE_KEY, affiliateId);
        sessionStorage.setItem(STORAGE_KEY, affiliateId);
        console.log('✅ Synced to both storages');
      } catch (e) {
        console.warn('⚠️ Could not sync to storage:', e.message);
      }
      
      console.log('=== AFFILIATE RETRIEVAL: SUCCESS (cookie) ===');
      return affiliateId;
    }
    
    console.log('⚠️ No am_id found in any storage location');
    console.log('=== AFFILIATE RETRIEVAL: NOT FOUND ===');
    return null;
  } catch (error) {
    console.error('❌ CRITICAL ERROR retrieving affiliate ID:', error);
    console.error('Error stack:', error.stack);
    console.log('=== AFFILIATE RETRIEVAL: ERROR ===');
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
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🚀 AFFILIATE TRACKING INITIALIZATION STARTED      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🌐 User Agent:', navigator.userAgent);
  console.log('🔗 Referrer:', document.referrer || 'Direct/None');
  console.log('');
  
  // Check if there's an affiliate ID in the current URL
  const capturedId = captureAffiliateId();
  
  if (capturedId) {
    console.log('');
    console.log('🎯 NEW AFFILIATE ID DETECTED IN URL!');
    console.log('📝 Proceeding to store...');
    console.log('');
    
    // New affiliate ID in URL - store it (overwrites existing)
    storeAffiliateId(capturedId);
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     ✅ INITIALIZATION COMPLETE: NEW ID CAPTURED       ║');
    console.log('║     Value: ' + capturedId.padEnd(43) + '║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    
    return capturedId;
  }
  
  console.log('');
  console.log('🔎 No am_id in URL, checking existing storage...');
  console.log('');
  
  // No affiliate ID in URL - check if we have one stored
  const existingId = getAffiliateId();
  
  if (existingId) {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ INITIALIZATION COMPLETE: EXISTING ID FOUND       ║');
    console.log('║     Value: ' + existingId.padEnd(43) + '║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    return existingId;
  }
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   ℹ️  INITIALIZATION COMPLETE: NO AFFILIATE ID        ║');
  console.log('║     User has not used an affiliate link              ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
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
  console.log('=== DIAGNOSTIC: TRACKING STATUS ===');
  
  const urlParam = new URLSearchParams(window.location.search).get(AFFILIATE_PARAM);
  const localStorageValue = localStorage.getItem(STORAGE_KEY);
  const sessionStorageValue = sessionStorage.getItem(STORAGE_KEY);
  const cookieValue = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`));
  
  const status = {
    timestamp: new Date().toISOString(),
    currentUrl: window.location.href,
    urlParameter: urlParam,
    localStorage: localStorageValue,
    sessionStorage: sessionStorageValue,
    cookie: cookieValue ? cookieValue.split('=')[1] : null,
    hasActiveTracking: !!(localStorageValue || sessionStorageValue || cookieValue),
    storageAvailable: typeof localStorage !== 'undefined',
    sessionStorageAvailable: typeof sessionStorage !== 'undefined',
    cookieEnabled: navigator.cookieEnabled
  };
  
  console.table(status);
  console.log('=== END DIAGNOSTIC ===');
  
  return status;
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

// Make tracking utilities available on window for debugging
if (typeof window !== 'undefined') {
  window.AffiliateTracker = {
    init: initAffiliateTracking,
    get: getAffiliateId,
    status: getTrackingStatus,
    clear: clearAffiliateId,
    capture: captureAffiliateId,
    store: storeAffiliateId
  };
  
  console.log('🔧 Debug tools available: window.AffiliateTracker');
  console.log('   - window.AffiliateTracker.status() - View current status');
  console.log('   - window.AffiliateTracker.get() - Get current am_id');
  console.log('   - window.AffiliateTracker.clear() - Clear stored am_id');
}
