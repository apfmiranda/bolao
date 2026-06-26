"use client";

import { useState } from "react";
import { submitPrediction } from "@/app/actions";

interface PredictionFormProps {
  participantId: string;
  gameId: string;
  opponent: string;
  opponentFlag: string;
}

export default function PredictionForm({
  participantId,
  gameId,
  opponent,
  opponentFlag,
}: PredictionFormProps) {
  const [brazilScore, setBrazilScore] = useState<string>("");
  const [opponentScore, setOpponentScore] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bScore = parseInt(brazilScore, 10);
    const oScore = parseInt(opponentScore, 10);

    if (isNaN(bScore) || isNaN(oScore) || bScore < 0 || oScore < 0) {
      setError("Informe placares válidos (números inteiros ≥ 0).");
      return;
    }

    setLoading(true);
    setError("");

    const result = await submitPrediction(participantId, gameId, bScore, oScore);
    if (!result.success) {
      setError(result.error ?? "Erro ao enviar palpite.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div
        className="animate-fade-in-up bg-success/10 border border-success/30
        rounded-sm p-6 text-center"
      >
        <div className="text-4xl mb-3">🎉</div>
        <p className="font-bold text-success text-lg">Palpite registrado!</p>
        <p className="text-text-secondary text-sm mt-1">
          🇧🇷 {brazilScore} × {opponentScore} {opponentFlag}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up bg-surface border-2 border-canarinho/40 rounded-sm p-6"
    >
      <h3 className="font-bold text-lg text-canarinho mb-1">
        ⚡ É a sua vez!
      </h3>
      <p className="text-text-secondary text-sm mb-6">
        Faça seu palpite para este jogo.
      </p>

      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Brazil score */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🇧🇷</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Brasil
          </span>
          <input
            id="brazil-score"
            type="number"
            min="0"
            max="20"
            value={brazilScore}
            onChange={(e) => setBrazilScore(e.target.value)}
            autoFocus
            className="w-20 h-20 text-center text-3xl font-black bg-[#0A0A0A]
              border-2 border-border rounded-sm text-canarinho
              focus:border-canarinho focus:ring-2 focus:ring-canarinho/20
              transition-all"
            placeholder="0"
          />
        </div>

        <span className="text-text-muted text-3xl font-light mt-8">×</span>

        {/* Opponent score */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">{opponentFlag}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {opponent}
          </span>
          <input
            id="opponent-score"
            type="number"
            min="0"
            max="20"
            value={opponentScore}
            onChange={(e) => setOpponentScore(e.target.value)}
            className="w-20 h-20 text-center text-3xl font-black bg-[#0A0A0A]
              border-2 border-border rounded-sm text-text-primary
              focus:border-canarinho focus:ring-2 focus:ring-canarinho/20
              transition-all"
            placeholder="0"
          />
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm font-medium text-center mb-4">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-canarinho text-[#0A0A0A] font-bold text-lg py-4 rounded-sm
          transition-all duration-200
          hover:bg-canarinho-glow active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Enviando..." : "Confirmar Palpite"}
      </button>
    </form>
  );
}
