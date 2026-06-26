import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  readGames,
  readParticipants,
  readPredictions,
  readDraftOrders,
} from "@/lib/data";
import GameCard from "@/components/GameCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;
  const participantName = cookieStore.get("participantName")?.value;
  const participantAvatarRaw = cookieStore.get("participantAvatar")?.value;

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

  const decodedName = participantName
    ? decodeURIComponent(participantName)
    : "Participante";

  const currentParticipant = participantsData.participants.find(
    (p) => p.id === participantId,
  );

  if (!currentParticipant) {
    redirect("/");
  }

  const decodedAvatar = participantAvatarRaw
    ? decodeURIComponent(participantAvatarRaw)
    : (currentParticipant?.avatar ?? "⚽");

  const openGames = gamesData.games.filter((g) => g.status === "open");
  const closedGames = gamesData.games.filter((g) => g.status === "closed");
  const finishedGames = gamesData.games.filter((g) => g.status === "finished");

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇧🇷</span>
            <div>
              <h1 className="font-bold text-sm text-text-primary leading-tight">
                BOLÃO COPA 2026
              </h1>
              <p className="text-xs text-text-muted">Jogos do Brasil</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="header-avatar">{decodedAvatar}</div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary leading-tight">
                {decodedName}
              </p>
            </div>
            <Link
              href="/"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              title="Trocar participante"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* Open games */}
        {openGames.length > 0 && (
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider">
                Aberto para Palpites
              </h2>
            </div>
            <div className="stagger-children space-y-3">
              {openGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  predictions={predictionsData.predictions}
                  participants={participantsData.participants}
                  draftOrders={draftOrderData.draftOrders}
                  currentParticipantId={participantId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Closed games */}
        {closedGames.length > 0 && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <h2 className="text-lg font-bold text-text-muted uppercase tracking-wider mb-5">
              Próximos Jogos
            </h2>
            <div className="stagger-children space-y-3">
              {closedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  predictions={predictionsData.predictions}
                  participants={participantsData.participants}
                  draftOrders={draftOrderData.draftOrders}
                  currentParticipantId={participantId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Finished games */}
        {finishedGames.length > 0 && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <h2 className="text-lg font-bold text-text-muted uppercase tracking-wider mb-5">
              Jogos Encerrados
            </h2>
            <div className="stagger-children space-y-3">
              {finishedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  predictions={predictionsData.predictions}
                  participants={participantsData.participants}
                  draftOrders={draftOrderData.draftOrders}
                  currentParticipantId={participantId}
                />
              ))}
            </div>
          </section>
        )}

        {gamesData.games.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">Nenhum jogo cadastrado ainda.</p>
          </div>
        )}
      </main>

      {/* Admin link */}
      {decodedName === "Alexandre" && (
        <footer className="max-w-3xl mx-auto px-4 py-8 text-center">
          <Link
            href="/admin"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Painel Admin →
          </Link>
        </footer>
      )}
    </div>
  );
}
