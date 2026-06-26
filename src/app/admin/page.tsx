"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addGame,
  setGameStatus,
  setActualScore,
  removeParticipant,
  drawDraftOrder,
} from "@/app/actions";
import type { Game, Participant, Prediction, DraftOrder } from "@/lib/types";

const COUNTRIES_LIST = [
  { name: "Alemanha", flag: "🇩🇪" },
  { name: "Angola", flag: "🇦🇴" },
  { name: "Arábia Saudita", flag: "🇸🇦" },
  { name: "Argélia", flag: "🇩🇿" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Austrália", flag: "🇦🇺" },
  { name: "Áustria", flag: "🇦🇹" },
  { name: "Bélgica", flag: "🇧🇪" },
  { name: "Bolívia", flag: "🇧🇴" },
  { name: "Brasil", flag: "🇧🇷" },
  { name: "Camarões", flag: "🇨🇲" },
  { name: "Canadá", flag: "🇨🇦" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colômbia", flag: "🇨🇴" },
  { name: "Coreia do Sul", flag: "🇰🇷" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Croácia", flag: "🇭🇷" },
  { name: "Dinamarca", flag: "🇩🇰" },
  { name: "Egito", flag: "🇪🇬" },
  { name: "Equador", flag: "🇪🇨" },
  { name: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Eslováquia", flag: "🇸🇰" },
  { name: "Eslovênia", flag: "🇸🇮" },
  { name: "Espanha", flag: "🇪🇸" },
  { name: "Estados Unidos", flag: "🇺🇸" },
  { name: "França", flag: "🇫🇷" },
  { name: "Gana", flag: "🇬🇭" },
  { name: "Geórgia", flag: "🇬🇪" },
  { name: "Grécia", flag: "🇬🇷" },
  { name: "Haiti", flag: "🇭🇹" },
  { name: "Holanda", flag: "🇳🇱" },
  { name: "Honduras", flag: "🇭🇳" },
  { name: "Hungria", flag: "🇭🇺" },
  { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Irã", flag: "🇮🇷" },
  { name: "Iraque", flag: "🇮🇶" },
  { name: "Irlanda", flag: "🇮🇪" },
  { name: "Islândia", flag: "🇮🇸" },
  { name: "Itália", flag: "🇮🇹" },
  { name: "Jamaica", flag: "🇯🇲" },
  { name: "Japão", flag: "🇯🇵" },
  { name: "Marrocos", flag: "🇲🇦" },
  { name: "México", flag: "🇲🇽" },
  { name: "Nigéria", flag: "🇳🇬" },
  { name: "Noruega", flag: "🇳🇴" },
  { name: "Nova Zelândia", flag: "🇳🇿" },
  { name: "Panamá", flag: "🇵🇦" },
  { name: "Paraguai", flag: "🇵🇾" },
  { name: "Peru", flag: "🇵🇪" },
  { name: "Polônia", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "República Tcheca", flag: "🇨🇿" },
  { name: "Romênia", flag: "🇷🇴" },
  { name: "Rússia", flag: "🇷🇺" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Sérvia", flag: "🇷🇸" },
  { name: "Suécia", flag: "🇸🇪" },
  { name: "Suíça", flag: "🇨🇭" },
  { name: "Tunísia", flag: "🇹🇳" },
  { name: "Turquia", flag: "🇹🇷" },
  { name: "Ucrânia", flag: "🇺🇦" },
  { name: "Uruguai", flag: "🇺🇾" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Wales / Gales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" }
];

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // New game form
  const [newOpponent, setNewOpponent] = useState("");
  const [newFlag, setNewFlag] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStage, setNewStage] = useState("");

  // Score form
  const [scoreGameId, setScoreGameId] = useState("");
  const [scoreBrazil, setScoreBrazil] = useState("");
  const [scoreOpponent, setScoreOpponent] = useState("");

  async function fetchData() {
    try {
      const [gamesRes, participantsRes, predictionsRes, draftRes] =
        await Promise.all([
          fetch("/api/games"),
          fetch("/api/participants"),
          fetch("/api/predictions"),
          fetch("/api/draft-orders"),
        ]);
      const gData = await gamesRes.json();
      const pData = await participantsRes.json();
      const prData = await predictionsRes.json();
      const dData = await draftRes.json();
      setGames(gData.games ?? []);
      setParticipants(pData.participants ?? []);
      setPredictions(prData.predictions ?? []);
      setDraftOrders(dData.draftOrders ?? []);
    } catch {
      setMessage("Erro ao carregar dados.");
    }
    setLoading(false);
  }

  useEffect(() => {
    const cookiesList = document.cookie.split("; ");
    const nameCookie = cookiesList.find((row) => row.startsWith("participantName="));
    const decodedName = nameCookie ? decodeURIComponent(nameCookie.split("=")[1]) : "";

    if (decodedName !== "Alexandre") {
      router.replace(decodedName ? "/dashboard" : "/");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
      fetchData();
    }
  }, [router]);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleAddGame(e: React.FormEvent) {
    e.preventDefault();
    if (!newOpponent || !newDate || !newStage) {
      showMessage("Preencha todos os campos.");
      return;
    }
    const result = await addGame(newOpponent, newFlag, newDate, newStage);
    if (result.success) {
      showMessage("Jogo adicionado!");
      setNewOpponent("");
      setNewFlag("");
      setNewDate("");
      setNewStage("");
      fetchData();
    } else {
      showMessage(result.error ?? "Erro.");
    }
  }

  async function handleStatus(
    gameId: string,
    status: "open" | "closed" | "finished",
  ) {
    const result = await setGameStatus(gameId, status);
    if (result.success) {
      showMessage(`Status atualizado!`);
      fetchData();
    } else {
      showMessage(result.error ?? "Erro.");
    }
  }

  async function handleDrawDraft(gameId: string) {
    if (!confirm("Sortear a ordem de palpites para este jogo?")) return;
    const result = await drawDraftOrder(gameId);
    if (result.success) {
      showMessage("🎲 Ordem sorteada com sucesso!");
      fetchData();
    } else {
      showMessage(result.error ?? "Erro ao sortear.");
    }
  }

  async function handleSetScore(e: React.FormEvent) {
    e.preventDefault();
    if (!scoreGameId || scoreBrazil === "" || scoreOpponent === "") {
      showMessage("Selecione o jogo e informe o placar.");
      return;
    }
    const result = await setActualScore(
      scoreGameId,
      parseInt(scoreBrazil, 10),
      parseInt(scoreOpponent, 10),
    );
    if (result.success) {
      showMessage("Placar registrado!");
      setScoreGameId("");
      setScoreBrazil("");
      setScoreOpponent("");
      fetchData();
    } else {
      showMessage(result.error ?? "Erro.");
    }
  }

  async function handleRemoveParticipant(id: string, name: string) {
    if (!confirm(`Remover ${name} do bolão?`)) return;
    const result = await removeParticipant(id);
    if (result.success) {
      showMessage(`${name} removido.`);
      fetchData();
    }
  }

  if (authorized === null || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-text-muted">
        Carregando...
      </div>
    );
  }

  const inputClass = `w-full bg-[#0A0A0A] border border-border rounded-sm px-4 py-3
    text-text-primary placeholder:text-text-muted
    focus:border-canarinho focus:ring-1 focus:ring-canarinho/30 transition-colors`;

  const btnPrimary = `bg-canarinho text-[#0A0A0A] font-bold py-3 px-6 rounded-sm
    transition-all duration-200 hover:bg-canarinho-glow active:scale-[0.98]`;

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <h1 className="font-bold text-sm text-text-primary">ADMIN</h1>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Message toast */}
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-surface border border-canarinho/40 rounded-sm px-6 py-3 text-sm font-medium text-canarinho shadow-lg">
            {message}
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* Games list */}
        <section>
          <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider mb-5">
            Jogos
          </h2>
          <div className="space-y-3">
            {games.map((game) => {
              const gameDrafts = draftOrders
                .filter((d) => d.gameId === game.id)
                .sort((a, b) => a.order - b.order);
              const gamePredictions = predictions.filter(
                (pr) => pr.gameId === game.id,
              );

              return (
                <div
                  key={game.id}
                  className="bg-surface border border-border rounded-sm p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-text-primary">
                        🇧🇷 Brasil vs {game.opponentFlag} {game.opponent}
                      </span>
                      <span className="text-xs text-text-muted ml-3">
                        {game.stage}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border
                      ${
                        game.status === "open"
                          ? "bg-success/15 text-success border-success/30"
                          : game.status === "finished"
                            ? "bg-canarinho/15 text-canarinho border-canarinho/30"
                            : "bg-text-muted/15 text-text-muted border-text-muted/30"
                      }`}
                    >
                      {game.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Draft draw button */}
                    {!game.draftDrawn ? (
                      <button
                        onClick={() => handleDrawDraft(game.id)}
                        className="text-xs bg-canarinho/15 text-canarinho border border-canarinho/30 px-3 py-1.5 rounded-sm
                          hover:bg-canarinho/25 transition-colors font-bold"
                      >
                        🎲 Sortear Ordem
                      </button>
                    ) : (
                      game.status !== "finished" && gamePredictions.length === 0 && (
                        <button
                          onClick={() => handleDrawDraft(game.id)}
                          className="text-xs bg-warning/15 text-warning border border-warning/30 px-3 py-1.5 rounded-sm
                            hover:bg-warning/25 transition-colors font-bold"
                        >
                          🎲 Refazer Sorteio
                        </button>
                      )
                    )}

                    {/* Open/Close buttons */}
                    {game.status !== "open" && game.draftDrawn && (
                      <button
                        onClick={() => handleStatus(game.id, "open")}
                        className="text-xs bg-success/15 text-success border border-success/30 px-3 py-1.5 rounded-sm
                          hover:bg-success/25 transition-colors"
                      >
                        Abrir Palpites
                      </button>
                    )}
                    {game.status === "open" && (
                      <button
                        onClick={() => handleStatus(game.id, "closed")}
                        className="text-xs bg-danger/15 text-danger border border-danger/30 px-3 py-1.5 rounded-sm
                          hover:bg-danger/25 transition-colors"
                      >
                        Fechar Palpites
                      </button>
                    )}
                    {game.status !== "finished" && (
                      <button
                        onClick={() => {
                          setScoreGameId(game.id);
                          setScoreBrazil("");
                          setScoreOpponent("");
                        }}
                        className="text-xs bg-canarinho/15 text-canarinho border border-canarinho/30 px-3 py-1.5 rounded-sm
                          hover:bg-canarinho/25 transition-colors"
                      >
                        Registrar Placar
                      </button>
                    )}
                  </div>

                  {/* Draft order display */}
                  {game.draftDrawn && gameDrafts.length > 0 && (
                    <div className="mb-3 p-3 bg-[#0A0A0A] rounded-sm border border-border">
                      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                        🎲 Ordem Sorteada
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {gameDrafts.map((d) => {
                          const p = participants.find(
                            (part) => part.id === d.participantId,
                          );
                          const hasPredicted = gamePredictions.some(
                            (pr) => pr.participantId === d.participantId,
                          );
                          return (
                            <span
                              key={d.participantId}
                              className={`text-xs px-2 py-1 rounded-sm border
                                ${
                                  hasPredicted
                                    ? "bg-success/10 border-success/30 text-success"
                                    : "bg-surface-elevated border-border text-text-secondary"
                                }`}
                            >
                              {d.order}º {p?.name ?? "?"}
                              {hasPredicted && " ✓"}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {game.status === "finished" &&
                    game.actualBrazilScore !== null && (
                      <p className="text-sm text-text-secondary mt-2">
                        Placar final: 🇧🇷 {game.actualBrazilScore} ×{" "}
                        {game.actualOpponentScore} {game.opponentFlag}
                      </p>
                    )}

                  {/* Inline score form */}
                  {scoreGameId === game.id && (
                    <form
                      onSubmit={handleSetScore}
                      className="mt-4 flex items-end gap-3 animate-fade-in"
                    >
                      <div>
                        <label className="block text-xs text-text-muted mb-1">
                          🇧🇷 Brasil
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreBrazil}
                          onChange={(e) => setScoreBrazil(e.target.value)}
                          className="w-20 bg-[#0A0A0A] border border-border rounded-sm px-3 py-2 text-center
                            text-text-primary focus:border-canarinho transition-colors"
                          autoFocus
                        />
                      </div>
                      <span className="text-text-muted pb-2">×</span>
                      <div>
                        <label className="block text-xs text-text-muted mb-1">
                          {game.opponentFlag} {game.opponent}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreOpponent}
                          onChange={(e) => setScoreOpponent(e.target.value)}
                          className="w-20 bg-[#0A0A0A] border border-border rounded-sm px-3 py-2 text-center
                            text-text-primary focus:border-canarinho transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        className={`${btnPrimary} text-sm py-2`}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setScoreGameId("")}
                        className="text-xs text-text-muted hover:text-text-secondary pb-2"
                      >
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Add game form */}
        <section>
          <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider mb-5">
            Adicionar Jogo
          </h2>
          <form
            onSubmit={handleAddGame}
            className="bg-surface border border-border rounded-sm p-6 space-y-4"
          >
            <div>
              <label className="block text-xs text-text-muted mb-1">
                País Predefinido (Preenche Adversário e Bandeira)
              </label>
              <select
                value={COUNTRIES_LIST.some((c) => c.name === newOpponent) ? newOpponent : ""}
                onChange={(e) => {
                  const selected = COUNTRIES_LIST.find((c) => c.name === e.target.value);
                  if (selected) {
                    setNewOpponent(selected.name);
                    setNewFlag(selected.flag);
                  } else {
                    setNewOpponent("");
                    setNewFlag("");
                  }
                }}
                className={inputClass}
              >
                <option value="">-- Selecione um país (opcional) --</option>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Adversário
                </label>
                <input
                  type="text"
                  value={newOpponent}
                  onChange={(e) => setNewOpponent(e.target.value)}
                  placeholder="Ex: Alemanha"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Bandeira (emoji)
                </label>
                <input
                  type="text"
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  placeholder="🇩🇪"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Data e hora (ISO)
                </label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Fase
                </label>
                <input
                  type="text"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  placeholder="Oitavas de Final"
                  className={inputClass}
                />
              </div>
            </div>
            <button type="submit" className={btnPrimary}>
              Adicionar Jogo
            </button>
          </form>
        </section>

        {/* Participants */}
        <section>
          <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider mb-5">
            Participantes ({participants.length})
          </h2>
          <div className="space-y-2">
            {participants.map((p) => {
              const pPredictions = predictions.filter(
                (pr) => pr.participantId === p.id,
              );
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-surface border border-border rounded-sm px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-canarinho bg-canarinho/10 px-2 py-1 rounded-sm">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-text-primary">
                      {p.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {pPredictions.length} palpite(s)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(p.id, p.name)}
                    className="text-xs text-danger hover:text-danger/80 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
