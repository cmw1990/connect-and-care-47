
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, Download } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  document_type: string | null;
  created_by: string | null;
  created_at: string;
  group_id: string;
}

export const DocumentSharing = ({ groupId }: { groupId: string }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: "",
    description: "",
    document_type: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [groupId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_documents")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${groupId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical_documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("medical_documents")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("medical_documents").insert({
        group_id: groupId,
        title: newDocument.title,
        description: newDocument.description,
        document_type: newDocument.document_type,
        file_url: publicUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      fetchDocuments();
      setNewDocument({
        title: "",
        description: "",
        document_type: "",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={newDocument.title}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newDocument.description}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <Input
                    id="document_type"
                    value={newDocument.document_type}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        document_type: e.target.value,
                      })
                    }
                    placeholder="e.g., Medical Report, Prescription"
                  />
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{document.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {document.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Type: {document.document_type}
                </p>
              </div>
              {document.file_url && (
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <Download className="h-5 w-5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
