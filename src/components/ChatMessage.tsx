import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateReportPdf } from '../lib/pdf';
import type { ChatMessage as ChatMessageType, ChatResponse, StructuredSection } from '../types';
import { Icon, type IconName } from './icons';
import { PathwayDiagram } from './PathwayDiagram';

const SECTION_ICONS: Record<string, IconName> = {
  symptoms: 'symptoms',
  findings: 'findings',
  medications: 'medications',
  epidemiology: 'epidemiology',
  prognosis: 'prognosis',
  pathophysiology: 'pathophysiology',
  redflags: 'redflags',
  emergency: 'redflags',
  guardrail: 'redflags',
  capabilities: 'sparkle',
  insufficient: 'info',
};

function iconFor(section: StructuredSection): IconName {
  return SECTION_ICONS[section.icon] ?? SECTION_ICONS[section.id] ?? 'info';
}

export function ChatMessageView({
  message,
  onUpgrade,
}: {
  message: ChatMessageType;
  onUpgrade: () => void;
}) {
  if (message.role === 'user') {
    return <div className="msg-user">{message.text}</div>;
  }
  if (!message.response) return null;
  return (
    <div className="msg-bot">
      <AnswerCard response={message.response} onUpgrade={onUpgrade} />
    </div>
  );
}

function AnswerCard({
  response,
  onUpgrade,
}: {
  response: ChatResponse;
  onUpgrade: () => void;
}) {
  const { premium } = useApp();
  const [open, setOpen] = useState<Set<string>>(
    () =>
      new Set(
        [response.focusSectionId ?? 'symptoms', 'medications'].filter((id) =>
          response.sections.some((s) => s.id === id),
        ),
      ),
  );
  const [shareNote, setShareNote] = useState('');

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAnswer = response.kind === 'answer';

  const handleExport = () => {
    if (!premium) {
      onUpgrade();
      return;
    }
    generateReportPdf(response);
  };

  const handleShare = async () => {
    const lines = [
      `Zuuno — ${response.conditionName ?? 'Medical reference'}`,
      response.icd10 ? `ICD-10: ${response.icd10}` : '',
      '',
      response.summary,
      '',
      `Source: Zuuno clinician-grade knowledge base. ${response.disclaimer}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string }) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: 'Zuuno', text });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareNote('Summary copied to clipboard');
      setTimeout(() => setShareNote(''), 2600);
    } catch {
      setShareNote('Unable to share on this device');
      setTimeout(() => setShareNote(''), 2600);
    }
  };

  const confidencePct = Math.round(response.confidence * 100);

  return (
    <div className={`answer-card answer-kind-${response.kind}`}>
      <div className="answer-head">
        <div className="ah-row">
          {response.conditionName ? (
            <h3>{response.conditionName}</h3>
          ) : (
            <h3>
              {response.kind === 'guardrail'
                ? 'Safety notice'
                : response.kind === 'greeting'
                  ? 'Welcome to Zuuno'
                  : 'Zuuno assistant'}
            </h3>
          )}
          {response.icd10 && <span className="chip chip-teal">ICD-10 {response.icd10}</span>}
          {isAnswer && (
            <span className="confidence" title="Match confidence">
              <span className="confidence-track">
                <span className="confidence-fill" style={{ width: `${confidencePct}%` }} />
              </span>
              {confidencePct}%
            </span>
          )}
        </div>
        <p className="answer-summary">{response.summary}</p>
      </div>

      <div>
        {response.sections.map((section) => {
          const expanded = open.has(section.id);
          const locked = Boolean(section.premium) && !premium;
          return (
            <div className="acc-section" key={section.id}>
              <button
                type="button"
                className={`acc-header ${
                  response.focusSectionId === section.id ? 'focused' : ''
                }`}
                aria-expanded={expanded}
                onClick={() => toggle(section.id)}
              >
                <span className={`acc-ico ${section.icon === 'redflags' ? 'redflags' : ''}`}>
                  <Icon name={iconFor(section)} size={18} />
                </span>
                <span className="acc-title">{section.title}</span>
                {section.premium && (
                  <span className="chip chip-violet">
                    <Icon name="crown" size={12} /> Premium
                  </span>
                )}
                <Icon name="chevron" size={18} className="acc-chevron" />
              </button>
              {expanded && (
                <div className="acc-body with-ico">
                  {locked ? (
                    <div className="lock-overlay">
                      <Icon name="lock" />
                      <p>
                        <strong>{section.title}</strong> with the interactive view is a
                        Zuuno Premium feature.
                      </p>
                      <button className="btn btn-ghost btn-sm" onClick={onUpgrade}>
                        <Icon name="crown" size={15} /> Unlock with Premium
                      </button>
                    </div>
                  ) : (
                    <SectionBody section={section} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {response.citations.length > 0 && (
          <div className="acc-section">
            <div className="acc-header" style={{ cursor: 'default' }}>
              <span className="acc-ico">
                <Icon name="book" size={18} />
              </span>
              <span className="acc-title">Citations ({response.citations.length})</span>
            </div>
            <div className="acc-body with-ico">
              <ol className="cite-list">
                {response.citations.map((c, i) => (
                  <li className="cite" key={c.id}>
                    <span className="cite-num">{i + 1}</span>
                    <span>
                      <span className="cite-ref">{c.reference}</span>
                      <br />
                      <span className="cite-meta">
                        {[c.detail, c.year, ' '].filter(Boolean).join(' · ')}
                        <span className="cite-type">{c.type}</span>
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="answer-actions">
        {isAnswer && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={handleExport}>
              <Icon name="download" size={15} />
              {premium ? 'Download PDF report' : 'PDF report (Premium)'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleShare}>
              <Icon name="share" size={15} /> Share
            </button>
          </>
        )}
        <span className="disclaimer-bar" style={{ flex: 1, minWidth: 200 }}>
          <Icon name="info" size={16} />
          <span>{response.disclaimer}</span>
        </span>
      </div>
      {shareNote && (
        <div className="banner banner-teal" style={{ margin: '0 12px 12px' }}>
          <Icon name="check" size={16} />
          <span>{shareNote}</span>
        </div>
      )}
    </div>
  );
}

function SectionBody({ section }: { section: StructuredSection }) {
  if (section.kind === 'bullets' && section.bullets) {
    const danger = section.icon === 'redflags';
    return (
      <ul className={`bullet-list ${danger ? 'danger' : ''}`}>
        {section.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    );
  }
  if (section.kind === 'text' && section.text) {
    return <p style={{ fontSize: '0.86rem', color: 'var(--ink-700)' }}>{section.text}</p>;
  }
  if (section.kind === 'medications' && section.medications) {
    const m = section.medications;
    return (
      <div>
        <div className="med-group">
          <span className="med-label first">First-line</span>
          <ul className="bullet-list">
            {m.firstLine.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="med-group">
          <span className="med-label second">Second-line</span>
          <ul className="bullet-list">
            {m.secondLine.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="med-group">
          <span className="med-label monitor">Monitoring</span>
          <ul className="bullet-list">
            {m.monitoring.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  if (section.kind === 'diagram' && section.diagram) {
    return <PathwayDiagram data={section.diagram} />;
  }
  return null;
}
