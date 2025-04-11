
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: UserProfile;
  role?: "user" | "assistant";
}

export interface UserProfile {
  first_name: string;
  last_name: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
