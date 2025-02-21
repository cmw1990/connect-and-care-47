import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Fingerprint,
  Car,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  icon: React.ReactNode;
  completedAt?: Date;
}

export const BackgroundCheck = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [steps, setSteps] = React.useState<VerificationStep[]>([
    {
      id: 'identity',
      title: t('backgroundCheck.identityVerification'),
      description: t('backgroundCheck.identityDescription'),
      status: 'completed',
      icon: <User className="h-5 w-5" />,
      completedAt: new Date(2024, 1, 15),
    },
    {
      id: 'criminal',
      title: t('backgroundCheck.criminalCheck'),
      description: t('backgroundCheck.criminalDescription'),
      status: 'completed',
      icon: <Shield className="h-5 w-5" />,
      completedAt: new Date(2024, 1, 16),
    },
    {
      id: 'fingerprint',
      title: t('backgroundCheck.fingerprintVerification'),
      description: t('backgroundCheck.fingerprintDescription'),
      status: 'in-progress',
      icon: <Fingerprint className="h-5 w-5" />,
    },
    {
      id: 'driving',
      title: t('backgroundCheck.drivingRecord'),
      description: t('backgroundCheck.drivingDescription'),
      status: 'pending',
      icon: <Car className="h-5 w-5" />,
    },
    {
      id: 'references',
      title: t('backgroundCheck.referenceCheck'),
      description: t('backgroundCheck.referenceDescription'),
      status: 'pending',
      icon: <FileText className="h-5 w-5" />,
    },
  ]);

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const completedSteps = steps.filter((step) => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  const handleStartCheck = (stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, status: 'in-progress' as const }
          : step
      )
    );

    toast({
      title: t('backgroundCheck.checkStarted'),
      description: t('backgroundCheck.checkInProgress'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('backgroundCheck.title')}</CardTitle>
        <CardDescription>{t('backgroundCheck.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {t('backgroundCheck.verificationProgress')}
            </span>
            <span className="text-sm text-gray-500">
              {completedSteps}/{steps.length} {t('backgroundCheck.completed')}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex-shrink-0 mt-1">{step.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{step.title}</h4>
                  {getStatusIcon(step.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                {step.completedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t('backgroundCheck.completedOn')}{' '}
                    {step.completedAt.toLocaleDateString()}
                  </p>
                )}
                {step.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleStartCheck(step.id)}
                  >
                    {t('backgroundCheck.startCheck')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {completedSteps === steps.length && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">
                {t('backgroundCheck.allChecksCompleted')}
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {t('backgroundCheck.verificationSuccess')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
