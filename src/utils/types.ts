export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string; // created_atを追加
  }