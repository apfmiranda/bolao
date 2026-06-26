import type { Prediction, Participant, Game, DraftOrder } from "@/lib/types";

interface PredictionTableProps {
  predictions: Prediction[];
  participants: Participant[];
  draftOrders: DraftOrder[];
  game: Game;
}

export default function PredictionTable({
  predictions,
  participants,
  draftOrders,
  game,
}: PredictionTableProps) {
  const gameDraftOrders = draftOrders
    .filter((d) => d.gameId === game.id)
    .sort((a, b) => a.order - b.order);

  const gamePredictions = predictions
    .filter((p) => p.gameId === game.id)
    .sort((a, b) => {
      const dA = gameDraftOrders.find(
        (d) => d.participantId === a.participantId,
      );
      const dB = gameDraftOrders.find(
        (d) => d.participantId === b.participantId,
      );
      return (dA?.order ?? 0) - (dB?.order ?? 0);
    });

  if (gamePredictions.length === 0) {
    return (
      <div className="text-center py-10 text-text-muted">
        <p className="text-lg">Nenhum palpite ainda</p>
        <p className="text-sm mt-1">
          Os palpites aparecerão aqui conforme forem feitos.
        </p>
      </div>
    );
  }

  function isExactMatch(pred: Prediction): boolean {
    return (
      game.status === "finished" &&
      game.actualBrazilScore !== null &&
      game.actualOpponentScore !== null &&
      pred.brazilScore === game.actualBrazilScore &&
      pred.opponentScore === game.actualOpponentScore
    );
  }

  function isResultMatch(pred: Prediction): boolean {
    if (
      game.status !== "finished" ||
      game.actualBrazilScore === null ||
      game.actualOpponentScore === null
    )
      return false;

    const actualDiff = Math.sign(
      game.actualBrazilScore - game.actualOpponentScore,
    );
    const predDiff = Math.sign(pred.brazilScore - pred.opponentScore);
    return actualDiff === predDiff && !isExactMatch(pred);
  }

  return (
    <div className="overflow-hidden border border-border rounded-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-elevated">
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              #
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Participante
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              🇧🇷
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              ×
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {game.opponentFlag}
            </th>
            {game.status === "finished" && (
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Resultado
              </th>
            )}
          </tr>
        </thead>
        <tbody className="stagger-children">
          {gamePredictions.map((pred) => {
            const participant = participants.find(
              (p) => p.id === pred.participantId,
            );
            const draft = gameDraftOrders.find(
              (d) => d.participantId === pred.participantId,
            );
            const exact = isExactMatch(pred);
            const result = isResultMatch(pred);

            return (
              <tr
                key={pred.id}
                className={`border-t border-border transition-colors
                  ${exact ? "bg-canarinho/10" : result ? "bg-success/5" : "hover:bg-surface-hover"}`}
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-text-muted">
                    {draft?.order ?? "—"}º
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {participant?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xl font-black text-canarinho tabular-nums">
                    {pred.brazilScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-text-muted">×</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xl font-black text-text-primary tabular-nums">
                    {pred.opponentScore}
                  </span>
                </td>
                {game.status === "finished" && (
                  <td className="px-4 py-3 text-center">
                    {exact && (
                      <span className="text-xs font-bold text-canarinho bg-canarinho/20 px-2 py-1 rounded-sm">
                        🎯 EXATO
                      </span>
                    )}
                    {result && (
                      <span className="text-xs font-bold text-success bg-success/15 px-2 py-1 rounded-sm">
                        ✓ ACERTOU
                      </span>
                    )}
                    {!exact && !result && (
                      <span className="text-xs text-text-muted">✗</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
