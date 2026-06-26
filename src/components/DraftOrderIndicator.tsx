import type { Participant, Prediction, DraftOrder } from "@/lib/types";

interface DraftOrderIndicatorProps {
  participants: Participant[];
  predictions: Prediction[];
  draftOrders: DraftOrder[];
  gameId: string;
}

export default function DraftOrderIndicator({
  participants,
  predictions,
  draftOrders,
  gameId,
}: DraftOrderIndicatorProps) {
  const gamePredictions = predictions.filter((p) => p.gameId === gameId);
  const predictedIds = new Set(gamePredictions.map((p) => p.participantId));

  const gameDrafts = draftOrders
    .filter((d) => d.gameId === gameId)
    .sort((a, b) => a.order - b.order);

  if (gameDrafts.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-sm p-5 text-center">
        <p className="text-text-muted text-sm">
          Aguardando o sorteio da ordem de palpites...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-sm p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
        🎲 Ordem de Escolha
      </h3>
      <div className="flex flex-wrap gap-2">
        {gameDrafts.map((draft) => {
          const participant = participants.find(
            (p) => p.id === draft.participantId,
          );
          const done = predictedIds.has(draft.participantId);
          const isNext =
            !done &&
            gameDrafts.find((d) => !predictedIds.has(d.participantId))
              ?.participantId === draft.participantId;

          return (
            <div
              key={draft.participantId}
              className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-sm
                transition-all duration-300
                ${
                  done
                    ? "bg-success/10 border-success/30 text-success"
                    : isNext
                      ? "bg-canarinho/15 border-canarinho/50 text-canarinho animate-pulse-glow"
                      : "bg-surface-elevated border-border text-text-muted"
                }`}
            >
              <span className="font-bold text-xs">{draft.order}º</span>
              <span className={`font-medium ${isNext ? "text-canarinho" : ""}`}>
                {participant?.name ?? "?"}
              </span>
              {done && <span className="text-xs">✓</span>}
              {isNext && <span className="text-xs">⚡</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
