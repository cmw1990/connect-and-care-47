
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, FileUp, Trash2, FilePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabaseClient } from "@/integrations/supabaseClient";
import { transformDocumentData } from "@/utils/supabaseHelpers";

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  document_type?: string;
  created_by?: string;
  created_at: string;
}

interface DocumentSharingProps {
  groupId: string;
}

export const DocumentSharing = ({ groupId }: DocumentSharingProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDesc, setDocumentDesc] = useState("");
  const [documentType, setDocumentType] = useState("medical");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('medical_documents')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching documents:", error);
          return;
        }

        if (data) {
          const transformedData = transformDocumentData(data);
          setDocuments(transformedData);
        }
      } catch (error) {
        console.error("Error in document fetch:", error);
      }
    };

    if (groupId) {
      fetchDocuments();
    }
  }, [groupId]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || doc.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      alert("Please provide a title and select a file");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${groupId}/${fileName}`;
      
      const { error: uploadError } = await supabaseClient
        .storage
        .from('medical_files')
        .upload(filePath, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // 2. Get the public URL
      const { data: urlData } = supabaseClient
        .storage
        .from('medical_files')
        .getPublicUrl(filePath);
      
      const fileUrl = urlData.publicUrl;

      // 3. Save document metadata
      const { error } = await supabaseClient
        .from('medical_documents')
        .insert({
          group_id: groupId,
          title: documentTitle,
          description: documentDesc || null,
          document_type: documentType,
          file_url: fileUrl,
        });

      if (error) throw error;

      // 4. Reset form and fetch updated documents
      setDocumentTitle("");
      setDocumentDesc("");
      setDocumentType("medical");
      setSelectedFile(null);
      setUploadDialogOpen(false);
      
      // 5. Refresh document list
      const { data: refreshedData, error: refreshError } = await supabaseClient
        .from('medical_documents')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      
      if (refreshError) throw refreshError;
      
      if (refreshedData) {
        const transformedData = transformDocumentData(refreshedData);
        setDocuments(transformedData);
      }
      
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getDocumentTypeLabel = (type?: string) => {
    switch (type) {
      case "medical": return "Medical";
      case "legal": return "Legal";
      case "care_plan": return "Care Plan";
      case "insurance": return "Insurance";
      default: return "Document";
    }
  };
  
  const getDocumentTypeBadgeColor = (type?: string) => {
    switch (type) {
      case "medical": return "bg-blue-100 text-blue-800";
      case "legal": return "bg-purple-100 text-purple-800";
      case "care_plan": return "bg-green-100 text-green-800";
      case "insurance": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <FilePlus className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title" 
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={documentDesc}
                    onChange={(e) => setDocumentDesc(e.target.value)}
                    placeholder="Enter document description" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <Select 
                    value={documentType} 
                    onValueChange={setDocumentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="care_plan">Care Plan</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-500 mb-2">
                      {selectedFile ? selectedFile.name : "Drag & drop a file or click to browse"}
                    </p>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUploadDocument}
                    disabled={isUploading || !selectedFile || !documentTitle.trim()}
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="pl-10"
              />
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="care_plan">Care Plan</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="important">Important</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No documents found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedType !== "all" 
                      ? "Try a different search term or filter" 
                      : "Upload your first document to get started"}
                  </p>
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="rounded-lg bg-blue-50 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-medium truncate">{doc.title}</h4>
                          {doc.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{doc.description}</p>
                          )}
                        </div>
                        <Badge className={getDocumentTypeBadgeColor(doc.document_type)}>
                          {getDocumentTypeLabel(doc.document_type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src="/avatars/user-1.png" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span>Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.file_url} download>
                              Download
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Recent documents will appear here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="shared">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Documents shared with you will appear here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="important">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Important documents will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
