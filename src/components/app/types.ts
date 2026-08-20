export type WorkDoc = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type ChatTurn = { role: "user" | "assistant"; content: string };