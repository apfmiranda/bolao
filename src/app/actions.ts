"use server";

import { revalidatePath } from "next/cache";
import {
  readParticipants,
  writeParticipants,
  readGames,
  writeGames,
  readPredictions,
  writePredictions,
  readDraftOrders,
  writeDraftOrders,
} from "@/lib/data";
import type { Game } from "@/lib/types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function registerParticipant(
  name: string,
  avatar: string,
  pin: string,
): Promise<{ success: boolean; error?: string; participantId?: string }> {
  const data = await readParticipants();

  const nameExists = data.participants.some(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (nameExists) {
    return { success: false, error: "Esse nome já está cadastrado." };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "O PIN deve ter exatamente 4 dígitos." };
  }

  const id = generateId();
  data.participants.push({
    id,
    name: name.trim(),
    avatar: avatar || "⚽",
    pin,
    createdAt: new Date().toISOString(),
  });

  await writeParticipants(data);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true, participantId: id };
}

export async function loginParticipant(
  participantId: string,
  pin: string,
): Promise<{ success: boolean; error?: string; participant?: { id: string; name: string; avatar: string } }> {
  const data = await readParticipants();
  const participant = data.participants.find((p) => p.id === participantId);

  if (!participant) {
    return { success: false, error: "Participante não encontrado." };
  }

  if (participant.pin !== pin) {
    return { success: false, error: "PIN incorreto. Tente novamente." };
  }

  return {
    success: true,
    participant: { id: participant.id, name: participant.name, avatar: participant.avatar },
  };
}


export async function drawDraftOrder(
  gameId: string,
): Promise<{ success: boolean; error?: string }> {
  const [gamesData, participantsData, draftOrderData] = await Promise.all([
    readGames(),
    readParticipants(),
    readDraftOrders(),
  ]);

  const game = gamesData.games.find((g) => g.id === gameId);
  if (!game) return { success: false, error: "Jogo não encontrado." };

  if (game.draftDrawn) {
    return { success: false, error: "O sorteio já foi realizado para este jogo." };
  }

  if (participantsData.participants.length === 0) {
    return { success: false, error: "Nenhum participante cadastrado." };
  }

  // Fisher-Yates shuffle all participants
  const shuffled = shuffle(participantsData.participants);

  // Remove any existing draft orders for this game (safety)
  draftOrderData.draftOrders = draftOrderData.draftOrders.filter(
    (d) => d.gameId !== gameId,
  );

  // Add new draft orders
  shuffled.forEach((participant, index) => {
    draftOrderData.draftOrders.push({
      gameId,
      participantId: participant.id,
      order: index + 1,
    });
  });

  // Mark game as draft drawn
  game.draftDrawn = true;

  await Promise.all([
    writeDraftOrders(draftOrderData),
    writeGames(gamesData),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/game/${gameId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function submitPrediction(
  participantId: string,
  gameId: string,
  brazilScore: number,
  opponentScore: number,
): Promise<{ success: boolean; error?: string }> {
  const [gamesData, predictionsData, participantsData, draftOrderData] =
    await Promise.all([
      readGames(),
      readPredictions(),
      readParticipants(),
      readDraftOrders(),
    ]);

  const game = gamesData.games.find((g) => g.id === gameId);
  if (!game) return { success: false, error: "Jogo não encontrado." };
  if (game.status !== "open")
    return { success: false, error: "Este jogo não está aberto para palpites." };
  if (!game.draftDrawn)
    return { success: false, error: "O sorteio da ordem ainda não foi realizado." };

  const participant = participantsData.participants.find(
    (p) => p.id === participantId,
  );
  if (!participant)
    return { success: false, error: "Participante não encontrado." };

  const alreadyPredicted = predictionsData.predictions.some(
    (p) => p.gameId === gameId && p.participantId === participantId,
  );
  if (alreadyPredicted)
    return { success: false, error: "Você já fez seu palpite para este jogo." };

  // Get the draft order for this specific game
  const gameDraftOrders = draftOrderData.draftOrders
    .filter((d) => d.gameId === gameId)
    .sort((a, b) => a.order - b.order);

  const gamePredictions = predictionsData.predictions.filter(
    (p) => p.gameId === gameId,
  );
  const predictedParticipantIds = new Set(
    gamePredictions.map((p) => p.participantId),
  );

  // Find the next participant in the draft order for this game
  const nextInLine = gameDraftOrders.find(
    (d) => !predictedParticipantIds.has(d.participantId),
  );

  if (!nextInLine || nextInLine.participantId !== participantId) {
    const nextParticipant = participantsData.participants.find(
      (p) => p.id === nextInLine?.participantId,
    );
    return {
      success: false,
      error: `Não é sua vez! Aguarde ${nextParticipant?.name ?? "outro participante"}.`,
    };
  }

  predictionsData.predictions.push({
    id: generateId(),
    gameId,
    participantId,
    brazilScore,
    opponentScore,
    createdAt: new Date().toISOString(),
  });

  await writePredictions(predictionsData);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/game/${gameId}`);
  return { success: true };
}

export async function addGame(
  opponent: string,
  opponentFlag: string,
  date: string,
  stage: string,
): Promise<{ success: boolean; error?: string }> {
  const data = await readGames();

  const id = `game-${data.games.length + 1}`;
  const newGame: Game = {
    id,
    opponent: opponent.trim(),
    opponentFlag: opponentFlag.trim(),
    date,
    stage: stage.trim(),
    status: "closed",
    draftDrawn: false,
    actualBrazilScore: null,
    actualOpponentScore: null,
  };

  data.games.push(newGame);
  await writeGames(data);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

export async function setGameStatus(
  gameId: string,
  status: "open" | "closed" | "finished",
): Promise<{ success: boolean; error?: string }> {
  const data = await readGames();
  const game = data.games.find((g) => g.id === gameId);
  if (!game) return { success: false, error: "Jogo não encontrado." };

  // Cannot open a game without a draft draw
  if (status === "open" && !game.draftDrawn) {
    return {
      success: false,
      error: "Faça o sorteio da ordem antes de abrir os palpites.",
    };
  }

  game.status = status;
  await writeGames(data);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/game/${gameId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function setActualScore(
  gameId: string,
  brazilScore: number,
  opponentScore: number,
): Promise<{ success: boolean; error?: string }> {
  const data = await readGames();
  const game = data.games.find((g) => g.id === gameId);
  if (!game) return { success: false, error: "Jogo não encontrado." };

  game.actualBrazilScore = brazilScore;
  game.actualOpponentScore = opponentScore;
  game.status = "finished";
  await writeGames(data);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/game/${gameId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function removeParticipant(
  participantId: string,
): Promise<{ success: boolean; error?: string }> {
  const data = await readParticipants();
  data.participants = data.participants.filter((p) => p.id !== participantId);
  await writeParticipants(data);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}
