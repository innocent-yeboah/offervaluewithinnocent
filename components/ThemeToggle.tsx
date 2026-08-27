"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode can block storage; the class still applies this visit.
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-ink"
      aria-pressed={dark}
      aria-label={dark ? "Switch to light reading" : "Switch to dark reading"}
    >
      {ready ? (dark ? "Light" : "Dark") : "Theme"}
    </button>
  );
}
