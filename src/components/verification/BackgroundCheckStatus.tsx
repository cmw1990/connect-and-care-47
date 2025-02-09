
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VerificationBadge } from "./VerificationBadge";

interface BackgroundCheck {
  id: string;
  created_at: string;
  status: string;
  check_type: string;
  results?: any;
}

export const BackgroundCheckStatus = () => {
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBackgroundChecks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('background_checks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setChecks(data || []);
      } catch (error) {
        console.error('Error fetching background checks:', error);
        toast({
          title: "Error",
          description: "Failed to load background check history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBackgroundChecks();

    // Subscribe to background check updates
    const channel = supabase
      .channel('background_checks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'background_checks'
        },
        (payload) => {
          // Refresh the checks when there's an update
          fetchBackgroundChecks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Background Check Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Shield className="h-6 w-6 animate-pulse text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Background Check History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checks.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No background checks found. Request one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {check.check_type.charAt(0).toUpperCase() + check.check_type.slice(1)} Check
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(check.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <VerificationBadge status={check.status as any} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

