import { useState, useEffect } from 'react';
import { AdminStorage } from '../services/adminStorage';
import { CompanyConfig } from '../data/company';

export function useCompanyConfig(): CompanyConfig {
  const [config, setConfig] = useState<CompanyConfig>(() => AdminStorage.getCompanyConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(AdminStorage.getCompanyConfig());
    };
    window.addEventListener('origintra_company_updated', handleUpdate);
    return () => {
      window.removeEventListener('origintra_company_updated', handleUpdate);
    };
  }, []);

  return config;
}
