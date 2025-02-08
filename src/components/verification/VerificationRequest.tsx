
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle, AlertCircle, Shield, FileText, Fingerprint } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const VerificationRequest = () => {
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verification_documents')
        .getPublicUrl(filePath);

      // Create verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          request_type: type,
          documents: [{ url: publicUrl, type }]
        });

      if (requestError) throw requestError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Update progress
      setProgress((prev) => Math.min(prev + 33, 100));
      
      // Refresh status
      fetchVerificationStatus();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const initiateBackgroundCheck = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('background_checks')
        .insert({
          user_id: user.id,
          check_type: 'standard',
          status: 'pending',
          provider: 'certn'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Background Check Initiated",
        description: "We'll notify you once the check is complete",
      });

      setProgress(100);
    } catch (error) {
      console.error('Error initiating background check:', error);
      toast({
        title: "Error",
        description: "Failed to initiate background check",
        variant: "destructive",
      });
    }
  };

  const fetchVerificationStatus = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .single();
    
    setVerificationStatus(profile?.verification_status);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Trust & Safety Verification
        </CardTitle>
        <CardDescription>
          Complete these steps to become a verified caregiver or companion
        </CardDescription>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                Identity Verification
              </Label>
              {verificationStatus?.identity ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Upload a government-issued photo ID to verify your identity
            </p>
            <Button
              variant="outline"
              className="w-full"
              disabled={uploading || verificationStatus?.identity}
            >
              <label className="flex items-center justify-center gap-2 cursor-pointer w-full">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload ID"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'identity')}
                  disabled={uploading || verificationStatus?.identity}
                />
              </label>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                References
              </Label>
              {verificationStatus?.references ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Provide references who can vouch for your caregiving experience
            </p>
            <Button
              variant="outline"
              className="w-full"
              disabled={uploading || verificationStatus?.references}
            >
              <label className="flex items-center justify-center gap-2 cursor-pointer w-full">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload References"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'references')}
                  disabled={uploading || verificationStatus?.references}
                />
              </label>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Background Check
              </Label>
              {verificationStatus?.background ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Complete a comprehensive background check through our trusted provider
            </p>
            <Button
              variant="default"
              className="w-full"
              onClick={initiateBackgroundCheck}
              disabled={verificationStatus?.background}
            >
              Start Background Check
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
          <h4 className="font-medium">Why verify?</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Build trust with families</li>
            <li>Get more job opportunities</li>
            <li>Appear higher in search results</li>
            <li>Access premium features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
