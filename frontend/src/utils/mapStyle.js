/**
 * Map Style Configuration - Vibrant Theme
 * Individual markers per pet (no clustering)
 */

// Mapbox style - using colorful streets style
export const MAP_STYLE_URL = 'mapbox://styles/mapbox/streets-v12';

// Map configuration
export const MAP_CONFIG = {
  initialViewState: {
    longitude: 0,
    latitude: 30,
    zoom: 2,
  },
  minZoom: 1.5,
  maxZoom: 18,
  dragRotate: false,
  antialias: true,
};

// Pet type colors - vibrant palette
export const PET_COLORS = {
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

// Pet emoji icons
export const PET_ICONS = {
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

// Helper function to get pin color
export const getPinColor = (petType) => {
  return PET_COLORS[petType] || PET_COLORS.Other;
};

// Helper function to get pet icon
export const getPetIcon = (petType) => {
  return PET_ICONS[petType] || PET_ICONS.Other;
};

export default {
  MAP_STYLE_URL,
  MAP_CONFIG,
  PET_COLORS,
  PET_ICONS,
  getPinColor,
  getPetIcon,
};
