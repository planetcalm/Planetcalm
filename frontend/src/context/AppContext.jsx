import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { memberAPI } from '../utils/api';
import { useSocket } from '../hooks/useSocket';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newlyAddedMember, setNewlyAddedMember] = useState(null);

  const handleNewMember = useCallback((member) => {
    setMembers(prev => {
      const exists = prev.some(m => m.properties?.id === member.id);
      if (exists) return prev;
      
      const newFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: member.coordinates.coordinates
        },
        properties: {
          id: member.id,
          petName: member.petName,
          petType: member.petType,
          location: member.location?.formatted || member.location,
          createdAt: member.createdAt,
          isNew: true
        }
      };
      
      return [newFeature, ...prev];
    });
    
    setMemberCount(prev => prev + 1);
    setNewlyAddedMember(member);
    
    setTimeout(() => {
      setNewlyAddedMember(null);
    }, 5000);
  }, []);

  const handleMemberCount = useCallback((count) => {
    setMemberCount(count);
  }, []);

  const { isConnected } = useSocket({
    onNewMember: handleNewMember,
    onMemberCount: handleMemberCount,
  });

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberAPI.getAll();
      if (response.success && response.data) {
        setMembers(response.data.features || []);
        setMemberCount(response.count || response.data.features?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = useCallback(async (memberData) => {
    try {
      const response = await memberAPI.create(memberData);
      if (response.success) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const value = {
    members,
    memberCount,
    isLoading,
    error,
    isConnected,
    showSuccessMessage,
    newlyAddedMember,
    addMember,
    refreshMembers: fetchMembers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
