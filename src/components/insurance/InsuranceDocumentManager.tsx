
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Trash2, Eye } from 'lucide-react';
import type { InsuranceDocument } from '@/types/insurance';

export const InsuranceDocumentManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ['insuranceDocuments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('insurance_documents')
        .select('*')
        .eq('user_id', user.id)
        .returns<InsuranceDocument[]>();

      if (error) throw error;
      return data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('insurance-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('insurance_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_url: filePath,
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type
          }
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['insuranceDocuments']);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setFile(null);
      setDocumentType('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  });

  const handleDownload = async (document: InsuranceDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('insurance-documents')
        .download(document.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.metadata.filename || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insurance_card">Insurance Card</SelectItem>
                <SelectItem value="eob">Explanation of Benefits</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="lab_result">Lab Result</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => uploadMutation.mutate()}
            disabled={!file || !documentType || uploadMutation.isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>

          <div className="space-y-4 mt-8">
            {documents?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{doc.document_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
