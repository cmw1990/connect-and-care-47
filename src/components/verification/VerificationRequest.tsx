import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export const VerificationRequest = () => {
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
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

  const fetchVerificationStatus = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .single();
    
    setVerificationStatus(profile?.verification_status);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Identity Document</Label>
            {verificationStatus?.identity ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
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
            <Label>Background Check Consent</Label>
            {verificationStatus?.background ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={uploading || verificationStatus?.background}
          >
            <label className="flex items-center justify-center gap-2 cursor-pointer w-full">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Consent Form"}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'background')}
                disabled={uploading || verificationStatus?.background}
              />
            </label>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>References</Label>
            {verificationStatus?.references ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
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
      </CardContent>
    </Card>
  );
};