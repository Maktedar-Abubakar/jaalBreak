import { useEffect, useState } from 'react';
import { Copy, Check } from './Icons.js';
import { copyText } from '../utils/format.js';

export default function CopyButton({ getText, label = 'Copy', className = 'btn btn--secondary' }) {
  const [state, setState] = useState('idle'); // idle | copied | failed

  useEffect(() => {
    if (state === 'idle') return undefined;
    const t = setTimeout(() => setState('idle'), 2200);
    return () => clearTimeout(t);
  }, [state]);

  const onClick = async () => {
    const ok = await copyText(typeof getText === 'function' ? getText() : String(getText));
    setState(ok ? 'copied' : 'failed');
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy not supported — select and copy manually' : label}
      </span>
    </button>
  );
}
