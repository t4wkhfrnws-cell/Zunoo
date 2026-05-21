import { useState } from 'react';
import type { Pathophysiology } from '../types';

// Interactive pathophysiology diagram (PRD §3). Each step in the disease
// pathway is a clickable node that reveals its mechanism detail.

const KIND_COLOR: Record<string, string> = {
  trigger: '#c97a16',
  mechanism: 'var(--teal-600)',
  effect: '#2f6fb0',
  outcome: 'var(--red-text)',
};

export function PathwayDiagram({ data }: { data: Pathophysiology }) {
  const [openId, setOpenId] = useState<string | null>(data.steps[0]?.id ?? null);

  return (
    <div className="pathway">
      <p className="pw-overview">{data.overview}</p>
      <div className="pathway-flow">
        {data.steps.map((step, i) => {
          const open = openId === step.id;
          return (
            <div className="pw-node" key={step.id}>
              <div className="pw-rail">
                <div className={`pw-dot ${step.kind}`}>{i + 1}</div>
                <div className="pw-line" />
              </div>
              <div className="pw-content">
                <button
                  type="button"
                  className={`pw-card ${open ? 'open' : ''}`}
                  onClick={() => setOpenId(open ? null : step.id)}
                  aria-expanded={open}
                >
                  <span className="pw-card-label">
                    <span>{step.label}</span>
                    <span className="pw-kind">{step.kind}</span>
                  </span>
                  {open && <span className="pw-detail">{step.detail}</span>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pw-legend" aria-hidden="true">
        {(['trigger', 'mechanism', 'effect', 'outcome'] as const).map((k) => (
          <span key={k}>
            <i style={{ background: KIND_COLOR[k] }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
