
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UploadCloud, File, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface InsuranceDocumentUploadProps {
  insuranceId: string;
  documentType: string;
}

export const InsuranceDocumentUpload = ({
  insuranceId,
  documentType
}: InsuranceDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['insuranceDocuments', insuranceId, documentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_documents')
        .select('*')
        .eq('insurance_id', insuranceId)
        .eq('document_type', documentType);

      if (error) throw error;
      return data;
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${insuranceId}/${documentType}/${Math.random()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('insurance_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('insurance_documents')
        .getPublicUrl(filePath);

      // Save document reference in database
      const { error: dbError } = await supabase
        .from('insurance_documents')
        .insert({
          insurance_id: insuranceId,
          document_type: documentType,
          file_url: publicUrl,
          metadata: {
            original_name: file.name,
            size: file.size,
            type: file.type
          }
        });

      if (dbError) throw dbError;

      toast({
        title: "Document uploaded successfully",
        description: "Your insurance document has been saved.",
      });

      queryClient.invalidateQueries(['insuranceDocuments']);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error uploading document",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/').slice(-2).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('insurance_documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('insurance_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast({
        title: "Document deleted successfully",
        description: "The insurance document has been removed.",
      });

      queryClient.invalidateQueries(['insuranceDocuments']);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error deleting document",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading documents...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Documents</CardTitle>
        <CardDescription>
          Upload and manage your insurance documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            {documents?.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">
                      {doc.metadata?.original_name || 'Insurance Document'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(doc.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.file_url)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG (max. 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
