"use client";

import { useEffect, useMemo, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(endsAtMs: number, now: number): Parts | null {
  const ms = endsAtMs - now;
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function LaunchCountdown({ endsAtIso }: { endsAtIso: string }) {
  const endsAtMs = Date.parse(endsAtIso);
  const endLabel = useMemo(() => {
    if (!Number.isFinite(endsAtMs)) return "";
    return new Intl.DateTimeFormat("es-VE", {
      timeZone: "America/Caracas",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(endsAtMs));
  }, [endsAtMs]);

  const [parts, setParts] = useState<Parts | null>(() =>
    Number.isFinite(endsAtMs) ? partsUntil(endsAtMs, Date.now()) : null,
  );

  useEffect(() => {
    if (!Number.isFinite(endsAtMs)) return;
    const tick = () => setParts(partsUntil(endsAtMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAtMs]);

  if (!parts) return null;

  return (
    <div className="launch-countdown" role="timer" aria-live="polite">
      <p className="launch-countdown-label">Precio de lanzamiento · queda</p>
      <div className="launch-countdown-grid">
        <div>
          <strong>{pad(parts.days)}</strong>
          <span>días</span>
        </div>
        <div>
          <strong>{pad(parts.hours)}</strong>
          <span>hrs</span>
        </div>
        <div>
          <strong>{pad(parts.minutes)}</strong>
          <span>min</span>
        </div>
        <div>
          <strong>{pad(parts.seconds)}</strong>
          <span>seg</span>
        </div>
      </div>
      {endLabel ? (
        <p className="launch-countdown-until">Hasta el {endLabel} (hora Venezuela)</p>
      ) : null}
    </div>
  );
}
