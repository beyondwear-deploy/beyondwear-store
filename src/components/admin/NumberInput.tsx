"use client";
import { useEffect, useState } from "react";

/**
 * A number field that can be fully cleared and typed over.
 *
 * The old pattern (`<input type="number" value={n} onChange={e => setN(Number(e.target.value))}>`)
 * turned an emptied field straight back into "0", so the 0 could never be deleted and a new price
 * ended up as "03999". Here the text the admin types is kept as-is while editing; the parent only
 * ever receives a clean number (blank = 0), and the field tidies itself on blur.
 */
export function NumberInput({
  value, onValueChange, className, placeholder = "0", min = 0, ariaLabel,
}: {
  value: number;
  onValueChange: (n: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(String(value));

  // Follow outside changes (e.g. the form being reset), but never fight the admin's own typing.
  useEffect(() => {
    setText((t) => (Number(t === "" ? 0 : t) === value ? t : String(value)));
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      value={text}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
      // Selecting everything on focus means typing replaces the default 0 straight away.
      onFocus={(e) => e.currentTarget.select()}
      // Scrolling the page with the cursor over a focused number field must not change the number.
      onWheel={(e) => e.currentTarget.blur()}
      onChange={(e) => {
        // "0" followed by digits is just a leftover default — drop the leading zeros ("03999" -> "3999").
        const raw = e.target.value.replace(/^0+(?=\d)/, "");
        setText(raw);
        const n = raw === "" ? 0 : Number(raw);
        onValueChange(Number.isFinite(n) ? n : 0);
      }}
      onBlur={() => setText(String(value))}
    />
  );
}
