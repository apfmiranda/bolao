import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  readGames,
  readParticipants,
  readPredictions,
  readDraftOrders,
} from "@/lib/data";
import PredictionForm from "@/components/PredictionForm";
import PredictionTable from "@/components/PredictionTable";
import DraftOrderIndicator from "@/components/DraftOrderIndicator";
import GamePolling from "@/components/GamePolling";

export const dynamic = "force-dynamic";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id: gameId } = await params;

  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;

  if (!participantId) {
    redirect("/");
  }

  const [gamesData, participantsData, predictionsData, draftOrderData] =
    await Promise.all([
      readGames(),
      readParticipants(),
      readPredictions(),
      readDraftOrders(),
    ]);

  const game = gamesData.games.find((g) => g.id === gameId);
  if (!game) notFound();

  const currentParticipant = participantsData.participants.find(
    (p) => p.id === participantId,
  );
  if (!currentParticipant) redirect("/");

  const gamePredictions = predictionsData.predictions.filter(
    (p) => p.gameId === gameId,
  );
  const predictedIds = new Set(gamePredictions.map((p) => p.participantId));

  // Get draft order for this specific game
  const gameDraftOrders = draftOrderData.draftOrders
    .filter((d) => d.gameId === gameId)
    .sort((a, b) => a.order - b.order);

  // Find next in line using per-game draft order
  const nextDraft = gameDraftOrders.find(
    (d) => !predictedIds.has(d.participantId),
  );
  const nextInLine = nextDraft
    ? participantsData.participants.find(
        (p) => p.id === nextDraft.participantId,
      )
    : null;
  const nextInLineOrder = nextDraft?.order;

  const isMyTurn = nextDraft?.participantId === participantId;
  const iAlreadyPredicted = predictedIds.has(participantId);

  const canPredict =
    game.status === "open" &&
    game.draftDrawn &&
    isMyTurn &&
    !iAlreadyPredicted;

  // Find current participant's order for this game
  const myDraftOrder = gameDraftOrders.find(
    (d) => d.participantId === participantId,
  );

  const gameDate = new Date(game.date);
  const dateStr = gameDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = gameDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-dvh">
      {/* Auto-refresh when game is open */}
      {game.status === "open" && <GamePolling intervalMs={5000} />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>←</span>
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">
              {currentParticipant.name}
            </p>
            {myDraftOrder && (
              <p className="text-xs text-canarinho font-medium">
                {myDraftOrder.order}º neste jogo
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Match header */}
        <section className="animate-fade-in-up text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            {game.stage}
          </p>

          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">🇧🇷</span>
              <span className="font-bold text-lg text-text-primary">
                Brasil
              </span>
            </div>

            {game.status === "finished" &&
            game.actualBrazilScore !== null &&
            game.actualOpponentScore !== null ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl font-black text-canarinho tabular-nums">
                  {game.actualBrazilScore}
                </span>
                <span className="text-text-muted text-2xl font-light">×</span>
                <span className="text-4xl sm:text-5xl font-black text-text-primary tabular-nums">
                  {game.actualOpponentScore}
                </span>
              </div>
            ) : (
              <span className="text-2xl text-text-muted font-bold">VS</span>
            )}

            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">{game.opponentFlag}</span>
              <span className="font-bold text-lg text-text-primary">
                {game.opponent}
              </span>
            </div>
          </div>

          <p className="text-sm text-text-muted capitalize">
            {dateStr} • {timeStr}
          </p>
        </section>

        {/* Draft order indicator */}
        {game.status === "open" && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <DraftOrderIndicator
              participants={participantsData.participants}
              predictions={predictionsData.predictions}
              draftOrders={draftOrderData.draftOrders}
              gameId={gameId}
            />
          </section>
        )}

        {/* Prediction form */}
        {canPredict && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <PredictionForm
              participantId={participantId}
              gameId={gameId}
              opponent={game.opponent}
              opponentFlag={game.opponentFlag}
            />
          </section>
        )}

        {/* Status messages */}
        {game.status === "open" &&
          !isMyTurn &&
          !iAlreadyPredicted &&
          nextInLine && (
            <div
              className="animate-fade-in bg-surface border border-border rounded-sm p-5 text-center"
              style={{ animationDelay: "200ms" }}
            >
              <p className="text-text-secondary">
                Aguarde a vez de{" "}
                <span className="font-bold text-text-primary">
                  {nextInLine.name}
                </span>{" "}
                ({nextInLineOrder}º)
              </p>
              <p className="text-xs text-text-muted mt-1">
                A página atualiza automaticamente a cada 5 segundos.
              </p>
            </div>
          )}

        {game.status === "open" && !game.draftDrawn && (
          <div
            className="animate-fade-in bg-surface border border-border rounded-sm p-5 text-center"
            style={{ animationDelay: "200ms" }}
          >
            <p className="text-text-muted">
              ⏳ Aguardando o administrador sortear a ordem de palpites...
            </p>
          </div>
        )}

        {iAlreadyPredicted && game.status === "open" && (
          <div
            className="animate-fade-in bg-success/10 border border-success/30 rounded-sm p-5 text-center"
            style={{ animationDelay: "200ms" }}
          >
            <p className="text-success font-medium">
              ✓ Você já fez seu palpite para este jogo!
            </p>
          </div>
        )}

        {game.status === "closed" && (
          <div
            className="animate-fade-in bg-surface border border-border rounded-sm p-5 text-center"
            style={{ animationDelay: "200ms" }}
          >
            <p className="text-text-muted">
              Este jogo ainda não está aberto para palpites.
            </p>
          </div>
        )}

        {/* Predictions table */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">
            Palpites
          </h2>
          <PredictionTable
            predictions={predictionsData.predictions}
            participants={participantsData.participants}
            draftOrders={draftOrderData.draftOrders}
            game={game}
          />
        </section>
      </main>
    </div>
  );
}
