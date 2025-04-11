
import { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks/use-user';

interface CoverageResult {
  isInsured: boolean;
  isCovered: boolean;
  coveragePercentage: number;
  deductibleRemaining: number;
  outOfPocketMax: number;
  canAutoProcess: boolean;
  userId?: string;
  insuranceId?: string;
  notes?: string;
}

export const useInsuranceCoverage = (serviceType: string) => {
  const [coverageInfo, setCoverageInfo] = useState<CoverageResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    fetchCoverageInfo();
  }, [serviceType, user]);

  const fetchCoverageInfo = async () => {
    setIsLoading(true);
    
    try {
      // This would normally fetch from a database
      // For now, we'll use mock data
      const mockCoverageInfo: CoverageResult = {
        isInsured: true,
        isCovered: ['companion_care', 'home_care', 'physical_therapy'].includes(serviceType),
        coveragePercentage: 80,
        deductibleRemaining: 250,
        outOfPocketMax: 5000,
        canAutoProcess: true,
        userId: user?.id,
        insuranceId: 'insurance-123',
        notes: 'Pre-authorization may be required for some services.'
      };
      
      // Simulate API call delay
      setTimeout(() => {
        setCoverageInfo(mockCoverageInfo);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching insurance coverage:', error);
      setIsLoading(false);
    }
  };

  return { coverageInfo, isLoading };
};
