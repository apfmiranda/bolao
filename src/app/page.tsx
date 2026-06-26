"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Participant } from "@/lib/types";
import ParticipantSelector from "@/components/ParticipantSelector";

export default function HomePage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/participants")
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data.participants ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleSelect(participant: Participant) {
    document.cookie = `participantId=${participant.id}; path=/; max-age=${60 * 60 * 24 * 90}`;
    document.cookie = `participantName=${encodeURIComponent(participant.name)}; path=/; max-age=${60 * 60 * 24 * 90}`;
    document.cookie = `participantAvatar=${encodeURIComponent(participant.avatar ?? "⚽")}; path=/; max-age=${60 * 60 * 24 * 90}`;
    router.push("/dashboard");
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* Hero */}
        <div className="animate-fade-in-up text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(to right, transparent, #006847)" }}
            />
            <span className="text-4xl" role="img" aria-label="Bandeira do Brasil">🇧🇷</span>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(to left, transparent, #006847)" }}
            />
          </div>

          <h1 className="text-5xl font-black tracking-tight text-text-primary leading-none mb-1">
            BOLÃO
          </h1>
          <h2
            className="text-3xl font-black tracking-tight leading-none"
            style={{ color: "#FFDF00" }}
          >
            COPA 2026
          </h2>

          <p className="text-text-muted text-sm mt-4">
            Jogos da Seleção Brasileira — Faça seus palpites!
          </p>

          <div
            className="mt-5 h-[2px] w-16 mx-auto"
            style={{ background: "linear-gradient(to right, #006847, #FFDF00, #006847)" }}
          />
        </div>

        {/* Participant selection */}
        {loading ? (
          <div className="animate-fade-in text-text-muted text-sm text-center">
            Carregando...
          </div>
        ) : (
          <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <ParticipantSelector
              participants={participants}
              onSelect={handleSelect}
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="animate-fade-in mt-12 text-center text-text-muted"
          style={{ animationDelay: "350ms", fontSize: "0.65rem", letterSpacing: "0.12em" }}
        >
          <p>BOLÃO FAMILIAR · COPA DO MUNDO 2026</p>
        </div>
      </div>
    </div>
  );
}
