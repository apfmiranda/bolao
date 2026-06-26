"use client";

import { useState, useRef } from "react";
import type { Participant } from "@/lib/types";
import { registerParticipant, loginParticipant } from "@/app/actions";

const AVATARS = [
  { emoji: "⚽", label: "Bola" },
  { emoji: "🏆", label: "Troféu" },
  { emoji: "🇧🇷", label: "Brasil" },
  { emoji: "🦁", label: "Leão" },
  { emoji: "🐆", label: "Onça" },
  { emoji: "🦅", label: "Águia" },
  { emoji: "🔥", label: "Fogo" },
  { emoji: "⚡", label: "Raio" },
  { emoji: "🌟", label: "Estrela" },
  { emoji: "🎯", label: "Alvo" },
  { emoji: "💪", label: "Força" },
  { emoji: "🥇", label: "Ouro" },
];

type Screen = "select" | "login" | "register";

interface ParticipantSelectorProps {
  participants: Participant[];
  onSelect: (participant: Participant) => void;
}

export default function ParticipantSelector({
  participants,
  onSelect,
}: ParticipantSelectorProps) {
  const [screen, setScreen] = useState<Screen>("select");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regAvatar, setRegAvatar] = useState("⚽");
  const [regPin, setRegPin] = useState(["", "", "", ""]);
  const [regConfirmPin, setRegConfirmPin] = useState(["", "", "", ""]);
  const [regStep, setRegStep] = useState<"info" | "pin" | "confirm">("info");

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const regPinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const regConfirmRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleParticipantClick(p: Participant) {
    setSelectedParticipant(p);
    setPin(["", "", "", ""]);
    setError("");
    setScreen("login");
    setTimeout(() => pinRefs[0].current?.focus(), 100);
  }

  function handlePinInput(
    index: number,
    value: string,
    refs: React.RefObject<HTMLInputElement | null>[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    if (!/^\d?$/.test(value)) return;
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }
  }

  function handlePinKeyDown(
    e: React.KeyboardEvent,
    index: number,
    refs: React.RefObject<HTMLInputElement | null>[],
  ) {
    if (e.key === "Backspace" && !((e.target as HTMLInputElement).value) && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const pinStr = pin.join("");
    if (pinStr.length < 4) {
      triggerShake("Digite os 4 dígitos do PIN.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await loginParticipant(selectedParticipant!.id, pinStr);

    if (!result.success) {
      setLoading(false);
      triggerShake(result.error ?? "Erro ao entrar.");
      setPin(["", "", "", ""]);
      setTimeout(() => pinRefs[0].current?.focus(), 100);
      return;
    }

    setLoading(false);
    onSelect(selectedParticipant!);
  }

  function triggerShake(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  // Register steps
  async function handleRegisterStep(e: React.FormEvent) {
    e.preventDefault();

    if (regStep === "info") {
      if (!regName.trim()) {
        setError("Preencha seu nome.");
        return;
      }
      setError("");
      setRegStep("pin");
      setTimeout(() => regPinRefs[0].current?.focus(), 100);
      return;
    }

    if (regStep === "pin") {
      const pinStr = regPin.join("");
      if (pinStr.length < 4) {
        setError("Digite os 4 dígitos do PIN.");
        return;
      }
      setError("");
      setRegStep("confirm");
      setTimeout(() => regConfirmRefs[0].current?.focus(), 100);
      return;
    }

    // confirm
    const pinStr = regPin.join("");
    const confirmStr = regConfirmPin.join("");
    if (pinStr !== confirmStr) {
      triggerShake("Os PINs não coincidem. Tente novamente.");
      setRegConfirmPin(["", "", "", ""]);
      setTimeout(() => regConfirmRefs[0].current?.focus(), 100);
      return;
    }

    setLoading(true);
    setError("");
    const result = await registerParticipant(regName, regAvatar, pinStr);

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? "Erro ao cadastrar.");
      return;
    }

    setLoading(false);
    window.location.reload();
  }

  function resetRegister() {
    setRegName("");
    setRegAvatar("⚽");
    setRegPin(["", "", "", ""]);
    setRegConfirmPin(["", "", "", ""]);
    setRegStep("info");
    setError("");
    setScreen("select");
  }

  // ── SELECT SCREEN ─────────────────────────────────────────────────
  if (screen === "select") {
    return (
      <div className="w-full">
        {participants.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-5 text-center">
              Quem é você?
            </p>
            <div className="space-y-2 stagger-children">
              {participants.map((p) => (
                <button
                  key={p.id}
                  id={`participant-${p.id}`}
                  onClick={() => handleParticipantClick(p)}
                  className="participant-card w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <span className="avatar-badge">{p.avatar || p.name.charAt(0).toUpperCase()}</span>
                  <span className="flex-1 font-bold text-base text-text-primary">{p.name}</span>
                  <span className="arrow-icon text-text-muted">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          id="new-participant-btn"
          onClick={() => { setScreen("register"); setError(""); }}
          className="register-btn w-full py-4 text-sm font-bold uppercase tracking-widest"
        >
          + Novo Participante
        </button>
      </div>
    );
  }

  // ── LOGIN SCREEN ──────────────────────────────────────────────────
  if (screen === "login" && selectedParticipant) {
    return (
      <div className="w-full animate-fade-in-up">
        <button
          onClick={() => { setScreen("select"); setError(""); setPin(["", "", "", ""]); }}
          className="back-btn mb-6"
        >
          ← Voltar
        </button>

        <div className="login-card">
          <div className="text-center mb-8">
            <div className="avatar-display">{selectedParticipant.avatar || "⚽"}</div>
            <h2 className="text-2xl font-black text-text-primary mt-3">
              {selectedParticipant.name}
            </h2>
            <p className="text-text-muted text-sm mt-1">Digite seu PIN de 4 dígitos</p>
          </div>

          <form onSubmit={handleLogin} id="login-form">
            <div className={`pin-row mb-6 ${shake ? "pin-shake" : ""}`}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={pinRefs[i]}
                  id={`login-pin-${i}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinInput(i, e.target.value, pinRefs, setPin)}
                  onKeyDown={(e) => handlePinKeyDown(e, i, pinRefs)}
                  className="pin-input"
                  autoComplete="off"
                />
              ))}
            </div>

            {error && (
              <p className="text-danger text-sm font-medium text-center mb-4 animate-fade-in">
                {error}
              </p>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading || pin.join("").length < 4}
              className="cta-btn w-full"
            >
              {loading ? "Entrando..." : "Entrar no Bolão"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── REGISTER SCREEN ───────────────────────────────────────────────
  if (screen === "register") {
    return (
      <div className="w-full animate-fade-in-up">
        <button
          onClick={resetRegister}
          className="back-btn mb-6"
        >
          ← Voltar
        </button>

        <div className="login-card">
          {/* Progress */}
          <div className="register-progress mb-6">
            {(["info", "pin", "confirm"] as const).map((step, i) => (
              <div
                key={step}
                className={`progress-dot ${regStep === step ? "active" : i < ["info", "pin", "confirm"].indexOf(regStep) ? "done" : ""}`}
              />
            ))}
          </div>

          <form onSubmit={handleRegisterStep} id="register-form">
            {/* Step 1: Name + Avatar */}
            {regStep === "info" && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-black text-text-primary mb-1">Cadastro</h2>
                <p className="text-text-muted text-sm mb-6">Escolha seu avatar e nome</p>

                {/* Avatar Picker */}
                <div className="avatar-grid mb-6">
                  {AVATARS.map((av) => (
                    <button
                      key={av.emoji}
                      type="button"
                      id={`avatar-${av.label}`}
                      onClick={() => setRegAvatar(av.emoji)}
                      className={`avatar-option ${regAvatar === av.emoji ? "selected" : ""}`}
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>

                {/* Name Input */}
                <div className="mb-6">
                  <label htmlFor="reg-name" className="field-label">Seu nome</label>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Alexandre"
                    autoFocus
                    className="field-input"
                  />
                </div>

                {error && (
                  <p className="text-danger text-sm font-medium mb-4">{error}</p>
                )}

                <button id="reg-next-btn" type="submit" className="cta-btn w-full">
                  Continuar →
                </button>
              </div>
            )}

            {/* Step 2: Create PIN */}
            {regStep === "pin" && (
              <div className="animate-fade-in-up">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{regAvatar}</div>
                  <h2 className="text-2xl font-black text-text-primary">{regName}</h2>
                  <p className="text-text-muted text-sm mt-1">Crie um PIN de 4 dígitos</p>
                </div>

                <div className="pin-row mb-6">
                  {regPin.map((digit, i) => (
                    <input
                      key={i}
                      ref={regPinRefs[i]}
                      id={`reg-pin-${i}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinInput(i, e.target.value, regPinRefs, setRegPin)}
                      onKeyDown={(e) => handlePinKeyDown(e, i, regPinRefs)}
                      className="pin-input"
                      autoComplete="off"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-danger text-sm font-medium text-center mb-4">{error}</p>
                )}

                <button
                  id="reg-pin-next"
                  type="submit"
                  disabled={regPin.join("").length < 4}
                  className="cta-btn w-full"
                >
                  Confirmar PIN →
                </button>
              </div>
            )}

            {/* Step 3: Confirm PIN */}
            {regStep === "confirm" && (
              <div className="animate-fade-in-up">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{regAvatar}</div>
                  <h2 className="text-2xl font-black text-text-primary">Confirme o PIN</h2>
                  <p className="text-text-muted text-sm mt-1">Digite novamente para confirmar</p>
                </div>

                <div className={`pin-row mb-6 ${shake ? "pin-shake" : ""}`}>
                  {regConfirmPin.map((digit, i) => (
                    <input
                      key={i}
                      ref={regConfirmRefs[i]}
                      id={`reg-confirm-${i}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinInput(i, e.target.value, regConfirmRefs, setRegConfirmPin)}
                      onKeyDown={(e) => handlePinKeyDown(e, i, regConfirmRefs)}
                      className="pin-input"
                      autoComplete="off"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-danger text-sm font-medium text-center mb-4 animate-fade-in">{error}</p>
                )}

                <button
                  id="reg-finish-btn"
                  type="submit"
                  disabled={loading || regConfirmPin.join("").length < 4}
                  className="cta-btn w-full"
                >
                  {loading ? "Cadastrando..." : "Entrar no Bolão 🏆"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return null;
}
