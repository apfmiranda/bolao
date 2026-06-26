export interface Participant {
  id: string;
  name: string;
  avatar: string;      // emoji or avatar code
  pin: string;         // 4-digit PIN (stored as plain for this family app)
  createdAt: string;
}

export interface Game {
  id: string;
  opponent: string;
  opponentFlag: string;
  date: string;
  stage: string;
  status: "open" | "closed" | "finished";
  draftDrawn: boolean;
  actualBrazilScore: number | null;
  actualOpponentScore: number | null;
}

export interface Prediction {
  id: string;
  gameId: string;
  participantId: string;
  brazilScore: number;
  opponentScore: number;
  createdAt: string;
}

export interface DraftOrder {
  gameId: string;
  participantId: string;
  order: number;
}

export interface ParticipantsData {
  participants: Participant[];
}

export interface GamesData {
  games: Game[];
}

export interface PredictionsData {
  predictions: Prediction[];
}

export interface DraftOrderData {
  draftOrders: DraftOrder[];
}
