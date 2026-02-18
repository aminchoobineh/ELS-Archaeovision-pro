import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getOrCreateSystemId } from '../services/systemId';

type LicenseStatus = 'loading' | 'active' | 'expired' | 'not_activated' | 'offline';

interface LicenseInfo {
  status: LicenseStatus;
  daysLeft?: number;
  expiresAt?: string;
}

export const useLicenseCheck = () => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({ status: 'loading' });
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const checkLicense = async () => {
    try {
      const systemId = getOrCreateSystemId();
      
      // بررسی وضعیت اینترنت
      if (!navigator.onLine) {
        setLicenseInfo({ status: 'offline' });
        setChecking(false);
        return;
      }

      const result = await api.verifySession(systemId);
      
      if (result.status === 'active') {
        setLicenseInfo({
          status: 'active',
          daysLeft: result.daysLeft,
          expiresAt: result.expiresAt,
        });
        
        // اگر در صفحه فعال‌سازی یا منقضی هستیم، به داشبورد برو
        if (window.location.pathname === '/activate' || window.location.pathname === '/expired') {
          navigate('/dashboard');
        }
      } else if (result.status === 'expired') {
        setLicenseInfo({ status: 'expired' });
        navigate('/expired');
      } else {
        setLicenseInfo({ status: 'not_activated' });
        navigate('/activate');
      }
    } catch (error) {
      console.error('License check failed:', error);
      setLicenseInfo({ status: 'offline' });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkLicense();
    
    // بررسی مجدد هر ساعت
    const interval = setInterval(checkLicense, 60 * 60 * 1000);
    
    // بررسی هنگام آنلاین شدن مجدد
    const handleOnline = () => checkLicense();
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [navigate]);

  return { ...licenseInfo, checking, refresh: checkLicense };
};