import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CONDITIONS } from '../data/conditions';
import { JOURNALS, TEXTBOOKS } from '../data/sources';
import { SUGGESTED_PROMPTS, generateResponse } from '../lib/knowledgeBase';
import type { ChatMessage } from '../types';
import { ChatMessageView } from '../components/ChatMessage';
import { Icon } from '../components/icons';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function ChatbotTab({ onUpgrade }: { onUpgrade: () => void }) {
  const { transcripts, addTranscript, clearTranscripts, profile, focusConditionId, setFocusCondition } =
    useApp();
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [transcripts, pending]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || pending) return;
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    addTranscript(userMsg);
    setInput('');
    setPending(true);
    window.setTimeout(() => {
      const response = generateResponse(text, {
        conditionId: focusConditionId ?? undefined,
        profile,
      });
      addTranscript({
        id: uid(),
        role: 'assistant',
        text: response.summary,
        response,
        timestamp: new Date().toISOString(),
      });
      if (response.conditionId) {
        setFocusCondition(response.conditionId);
      }
      setPending(false);
    }, 620);
  };

  const empty = transcripts.length === 0;

  return (
    <div className="chat-wrap">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Medical Assistant</h1>
          <p>Evidence-based, cited answers for conditions you already know you have.</p>
        </div>
        {!empty && (
          <button className="btn btn-secondary btn-sm" onClick={clearTranscripts}>
            <Icon name="trash" size={15} /> Clear
          </button>
        )}
      </div>

      <div className="chat-stream">
        {empty && (
          <div>
            <div className="chat-intro">
              <img src="/favicon.svg" alt="" className="brand-mark" width={60} height={60} />
              <h2>How can Zuuno help today?</h2>
              <p>
                Ask about a condition by name or ICD-10 code. Every answer is structured, cited,
                and includes an interactive pathophysiology diagram.
              </p>
            </div>
            <div className="suggested">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} onClick={() => send(p)}>
                  {p}
                </button>
              ))}
            </div>

            <div className="card" style={{ marginTop: 18, padding: 14 }}>
              <button
                className="acc-header"
                style={{ padding: 0, background: 'none' }}
                aria-expanded={showSources}
                onClick={() => setShowSources((v) => !v)}
              >
                <span className="acc-ico">
                  <Icon name="book" size={18} />
                </span>
                <span className="acc-title">
                  Knowledge sources · {TEXTBOOKS.length} textbooks, {JOURNALS.length} journals
                </span>
                <Icon name="chevron" size={18} className="acc-chevron" />
              </button>
              {showSources && (
                <div style={{ marginTop: 12 }} className="knowledge-cols">
                  <div>
                    <div className="section-title">Medical textbooks</div>
                    <ul className="kb-grid">
                      {TEXTBOOKS.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="section-title">PubMed-indexed journals</div>
                    <ul className="kb-grid">
                      {JOURNALS.map((j) => (
                        <li key={j}>{j}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {transcripts.map((m) => (
          <ChatMessageView key={m.id} message={m} onUpgrade={onUpgrade} />
        ))}

        {pending && (
          <div className="msg-bot">
            <div className="answer-card">
              <div className="typing-dots" aria-label="Zuuno is preparing an answer">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <div className="composer-context">
          <select
            className="context-select"
            value={focusConditionId ?? ''}
            onChange={(e) => setFocusCondition(e.target.value || null)}
            aria-label="Condition context"
          >
            <option value="">No condition selected (auto-detect)</option>
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.icd10}
              </option>
            ))}
          </select>
        </div>
        <div className="composer-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about a condition, its treatment, prognosis…"
            rows={1}
            aria-label="Message Zuuno"
          />
          <button
            className="send-btn"
            onClick={() => send(input)}
            disabled={!input.trim() || pending}
            aria-label="Send message"
          >
            <Icon name="send" size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
