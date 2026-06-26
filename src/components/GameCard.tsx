import Link from "next/link";
import type { Game, Prediction, Participant, DraftOrder } from "@/lib/types";

interface GameCardProps {
  game: Game;
  predictions: Prediction[];
  participants: Participant[];
  draftOrders: DraftOrder[];
  currentParticipantId?: string;
}

export default function GameCard({
  game,
  predictions,
  participants,
  draftOrders,
  currentParticipantId,
}: GameCardProps) {
  const gamePredictions = predictions.filter((p) => p.gameId === game.id);
  const totalParticipants = participants.length;
  const predictedCount = gamePredictions.length;

  // Use per-game draft order
  const gameDraftOrders = draftOrders
    .filter((d) => d.gameId === game.id)
    .sort((a, b) => a.order - b.order);

  const predictedIds = new Set(gamePredictions.map((p) => p.participantId));

  const nextDraft = gameDraftOrders.find(
    (d) => !predictedIds.has(d.participantId),
  );
  const nextInLine = nextDraft
    ? participants.find((p) => p.id === nextDraft.participantId)
    : null;

  const isMyTurn =
    currentParticipantId !== undefined &&
    nextDraft?.participantId === currentParticipantId;
  const iAlreadyPredicted =
    currentParticipantId !== undefined && predictedIds.has(currentParticipantId);

  const gameDate = new Date(game.date);
  const dateStr = gameDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short",
  });
  const timeStr = gameDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusConfig = {
    open: {
      label: "ABERTO",
      className: "bg-success/15 text-success border-success/30",
    },
    closed: {
      label: "FECHADO",
      className: "bg-text-muted/15 text-text-muted border-text-muted/30",
    },
    finished: {
      label: "ENCERRADO",
      className: "bg-canarinho/15 text-canarinho border-canarinho/30",
    },
  };

  const status = statusConfig[game.status];

  return (
    <Link href={`/dashboard/game/${game.id}`}>
      <div
        className={`group relative bg-surface border rounded-sm p-5
        transition-all duration-200
        hover:bg-surface-hover active:scale-[0.99]
        ${isMyTurn && game.status === "open" ? "border-canarinho/60 animate-pulse-glow" : "border-border hover:border-border-active"}`}
      >
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {game.stage}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Match */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇧🇷</span>
            <span className="font-bold text-lg text-text-primary">Brasil</span>
          </div>

          {game.status === "finished" &&
          game.actualBrazilScore !== null &&
          game.actualOpponentScore !== null ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-canarinho tabular-nums">
                {game.actualBrazilScore}
              </span>
              <span className="text-text-muted font-light text-lg">×</span>
              <span className="text-2xl font-black text-text-primary tabular-nums">
                {game.actualOpponentScore}
              </span>
            </div>
          ) : (
            <span className="text-text-muted font-bold text-lg">vs</span>
          )}

          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-text-primary">
              {game.opponent}
            </span>
            <span className="text-3xl">{game.opponentFlag}</span>
          </div>
        </div>

        {/* Date + info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {dateStr} • {timeStr}
          </span>

          <div className="flex items-center gap-3">
            {game.status === "open" && (
              <span className="text-text-secondary text-xs">
                <span className="text-canarinho font-bold">
                  {predictedCount}
                </span>
                /{totalParticipants} palpites
              </span>
            )}

            {isMyTurn && game.status === "open" && (
              <span className="text-xs font-bold text-canarinho uppercase tracking-wider">
                ⚡ SUA VEZ
              </span>
            )}

            {iAlreadyPredicted && (
              <span className="text-xs font-medium text-success">✓ Feito</span>
            )}
          </div>
        </div>

        {/* Next in line */}
        {game.status === "open" &&
          nextInLine &&
          !isMyTurn &&
          !iAlreadyPredicted && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-text-muted">
                Vez de:{" "}
                <span className="text-text-secondary font-medium">
                  {nextInLine.name}
                </span>{" "}
                ({nextDraft?.order}º)
              </span>
            </div>
          )}

        {/* Waiting for draft */}
        {game.status === "open" &&
          !game.draftDrawn && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-text-muted">
                ⏳ Aguardando sorteio da ordem...
              </span>
            </div>
          )}

        {/* Arrow */}
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted
          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          →
        </span>
      </div>
    </Link>
  );
}
