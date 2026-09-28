'use client';

import { useState } from 'react';
import { MAX_PRODUCT_QUANTITY } from '@/lib/pricing';
import styles from './QuantityInput.module.css';

export default function QuantityInput({ value, onChange, label, max = MAX_PRODUCT_QUANTITY, disabled = false }: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  max?: number;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit() {
    if (draft !== null && draft.trim() !== '') {
      const parsed = Number(draft);
      if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(1, Math.floor(parsed))));
    }
    setDraft(null);
  }

  return <input
    className={styles.input}
    type="number"
    inputMode="numeric"
    min={1}
    max={max}
    step={1}
    aria-label={label}
    disabled={disabled}
    value={draft ?? value}
    onChange={event => {
      const next = event.target.value;
      setDraft(next);
      const parsed = Number(next);
      if (next.trim() !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= max) onChange(parsed);
    }}
    onBlur={commit}
    onKeyDown={event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.blur();
      }
    }}
  />;
}
