
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, UserPlus } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";

interface CareCircleManagerProps {
  groupId: string;
}

export const CareCircleManager = ({ groupId }: CareCircleManagerProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("caregiver");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseClient
        .from("care_circle_invites")
        .insert({
          group_id: groupId,
          email: email.trim(),
          role: role,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Care Circle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caregiver">Caregiver</SelectItem>
                <SelectItem value="family">Family Member</SelectItem>
                <SelectItem value="medical">Medical Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleInvite} 
            disabled={isLoading}
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
