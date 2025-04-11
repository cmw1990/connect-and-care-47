import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, AlertTriangle, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComparisonResultsProps {
  selectedProducts: any[];
}

export const ComparisonResults = ({ selectedProducts }: ComparisonResultsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleRequestVerification = async (type: string) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to request verification",
          variant: "destructive"
        });
        return;
      }
      
      // Create verification request in the database
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          request_type: type,
          documents: []
        });
      
      if (error) throw error;
      
      toast({
        title: "Verification Requested",
        description: `Your ${type} verification request has been submitted.`,
      });
      
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast({
        title: "Request Failed",
        description: "Unable to submit verification request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const initiateBackgroundCheck = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to request a background check",
          variant: "destructive"
        });
        return;
      }
      
      // Create background check in the database
      const { error } = await supabase
        .from('background_checks')
        .insert({
          user_id: user.id,
          check_type: 'provider',
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Background Check Initiated",
        description: "Your background check has been initiated. We'll notify you once it's complete.",
      });
      
    } catch (error) {
      console.error("Error initiating background check:", error);
      toast({
        title: "Request Failed",
        description: "Unable to initiate background check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {selectedProducts.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Identity Verified</span>
              {product.isIdentityVerified ? (
                <Badge variant="success">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRequestVerification('identity')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Request Verification
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Background Checked</span>
              {product.isBackgroundChecked ? (
                <Badge variant="success">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Checked
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={initiateBackgroundCheck}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Initiate Check
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {product.isIdentityVerified && product.isBackgroundChecked && (
              <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2 inline-block" />
                This provider is fully verified.
              </div>
            )}
            
            {!product.isIdentityVerified && product.isBackgroundChecked && (
              <div className="rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-600">
                <AlertTriangle className="h-4 w-4 mr-2 inline-block" />
                This provider has not completed all verification steps.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
