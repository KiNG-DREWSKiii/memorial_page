"use client";

import { useState } from "react";

export function CandleButton() {
  const [litCount, setLitCount] = useState(184);

  return (
    <button className="candle-button" type="button" onClick={() => setLitCount((count) => count + 1)}>
      <span className="candle-flame" aria-hidden="true" />
      Light a Candle
      <strong>{litCount}</strong>
    </button>
  );
}
