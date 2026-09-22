import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ENDPOINTS, apiFetch } from '../utils/api';

// ============================================================
// CustomerProfileContext
// Primary: localStorage ka customer_data (login pe save hota hai)
// Fallback: /customer/profile API (agar localStorage empty ho)
// ============================================================

const CustomerProfileContext = createContext(null);

export const CustomerProfileProvider = ({ children }) => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      // Step 1: Pehle localStorage se check karo (fastest, no network)
      const stored = localStorage.getItem('customer_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setLoading(false);
          return; // localStorage se mil gaya, API call ki zarurat nahi
        } catch (_) {
          // JSON parse fail - aage API try karo
        }
      }

      // Step 2: Fallback - API se fetch karo (agar localStorage empty ho)
      const token = localStorage.getItem('customer_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const { data, ok, error: err } = await apiFetch(ENDPOINTS.CUSTOMER_PROFILE);
      if (ok && data) {
        setProfile(data);
        localStorage.setItem('customer_data', JSON.stringify(data)); // cache karo
      } else {
        setError(err || 'Profile load nahi ho saki');
      }
      setLoading(false);
    };

    loadProfile();
  }, []); // sirf mount pe ek baar

  // Logout pe reset karo
  const resetProfile = () => {
    setProfile(null);
    setError(null);
    setLoading(false);
  };

  // Force refresh (agar zarurat ho)
  const refreshProfile = useCallback(async () => {
    setLoading(true);
    const { data, ok, error: err } = await apiFetch(ENDPOINTS.CUSTOMER_PROFILE);
    if (ok && data) {
      setProfile(data);
      localStorage.setItem('customer_data', JSON.stringify(data));
    } else {
      setError(err || 'Profile load nahi ho saki');
    }
    setLoading(false);
  }, []);

  return (
    <CustomerProfileContext.Provider value={{ profile, setProfile, loading, error, resetProfile, refreshProfile }}>
      {children}
    </CustomerProfileContext.Provider>
  );
};

// Easy hook
export const useCustomerProfile = () => {
  const ctx = useContext(CustomerProfileContext);
  if (!ctx) throw new Error('useCustomerProfile must be used inside CustomerProfileProvider');
  return ctx;
};

