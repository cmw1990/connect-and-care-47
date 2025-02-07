
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Edit2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CareRecipient {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  care_needs: string[];
  special_requirements: string[];
  medical_conditions: string[];
  allergies: string[];
  preferences: Record<string, any>;
  group_id: string;
}

interface CareRecipientManagerProps {
  groupId: string;
}

export const CareRecipientManager = ({ groupId }: CareRecipientManagerProps) => {
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CareRecipient>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRecipients();
  }, [groupId]);

  const fetchRecipients = async () => {
    try {
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Cast the preferences to Record<string, any>
      const formattedData = (data || []).map(recipient => ({
        ...recipient,
        preferences: recipient.preferences as Record<string, any>
      }));

      setRecipients(formattedData);
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast({
        title: "Error",
        description: "Failed to load care recipients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing('new');
    setEditForm({
      first_name: '',
      last_name: '',
      date_of_birth: null,
      care_needs: [],
      special_requirements: [],
      medical_conditions: [],
      allergies: [],
      preferences: {},
      group_id: groupId
    });
  };

  const handleSave = async () => {
    try {
      if (!editForm.first_name?.trim()) {
        toast({
          title: "Error",
          description: "First name is required",
          variant: "destructive",
        });
        return;
      }

      const recipientData = {
        ...editForm,
        group_id: groupId,
        preferences: editForm.preferences || {}
      };

      if (isEditing === 'new') {
        const { error } = await supabase
          .from('care_recipients')
          .insert(recipientData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Care recipient added successfully",
        });
      } else {
        const { error } = await supabase
          .from('care_recipients')
          .update(recipientData)
          .eq('id', isEditing);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Care recipient updated successfully",
        });
      }

      setIsEditing(null);
      setEditForm({});
      await fetchRecipients();
    } catch (error) {
      console.error('Error saving recipient:', error);
      toast({
        title: "Error",
        description: "Failed to save care recipient",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('care_recipients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Care recipient removed successfully",
      });
      await fetchRecipients();
    } catch (error) {
      console.error('Error deleting recipient:', error);
      toast({
        title: "Error",
        description: "Failed to remove care recipient",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (recipient: CareRecipient) => {
    setIsEditing(recipient.id);
    setEditForm(recipient);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Care Recipients</span>
          <Button onClick={handleAddNew} variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recipients.map((recipient) => (
            <div
              key={recipient.id}
              className="p-4 border rounded-lg space-y-2"
            >
              {isEditing === recipient.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={editForm.first_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={editForm.last_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={editForm.date_of_birth || ''}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(null);
                        setEditForm({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {recipient.first_name} {recipient.last_name}
                    </h3>
                    {recipient.date_of_birth && (
                      <p className="text-sm text-gray-500">
                        Born: {new Date(recipient.date_of_birth).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(recipient)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(recipient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isEditing === 'new' && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_first_name">First Name</Label>
                  <Input
                    id="new_first_name"
                    value={editForm.first_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_last_name">Last Name</Label>
                  <Input
                    id="new_last_name"
                    value={editForm.last_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_date_of_birth">Date of Birth</Label>
                <Input
                  id="new_date_of_birth"
                  type="date"
                  value={editForm.date_of_birth || ''}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(null);
                    setEditForm({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
