'use client';

import { useState } from 'react';
import type { PipelineResult, UserInput } from '@/types';

const DEFAULT_INPUT: UserInput = {
  brand_name: '',
  campaign_objective: '',
  target_audience: '',
  content_tone: 'professional',
  key_messages: [],
  reel_topic: '',
  visual_style: 'minimalist dark tech',
  background_music_mood: 'upbeat',
  reel_duration_seconds: 30,
  cta: '',
};

export default function Home() {
  const [mode, setMode] = useState<'test' | 'full'>('test');
  const [input, setInput] = useState<UserInput>(DEFAULT_INPUT);
  const [keyMsgInput, setKeyMsgInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  function addLog(msg: string) {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  function updateInput(field: keyof UserInput, value: unknown) {
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  function addKeyMessage() {
    const msg = keyMsgInput.trim();
    if (msg) {
      updateInput('key_messages', [...input.key_messages, msg]);
      setKeyMsgInput('');
    }
  }

  function removeKeyMessage(index: number) {
    updateInput(
      'key_messages',
      input.key_messages.filter((_, i) => i !== index)
    );
  }

  async function handleRun() {
    setLoading(true);
    setResult(null);
    setLogs([]);

    try {
      addLog(`Starting pipeline (${mode} mode)...`);

      const body: Record<string, unknown> = { mode };
      if (mode === 'full') {
        body.input = input;
      }

      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data: PipelineResult = await res.json();
      setResult(data);

      if (data.status === 'success') {
        addLog('Pipeline complete!');
        addLog(`Post ID: ${data.post_id}`);
        addLog(`Video: ${data.video_url}`);
      } else {
        addLog(`Error: ${data.error}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Fatal: ${msg}`);
      setResult({ status: 'error', error: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            margin: 0,
            background: 'linear-gradient(135deg, #e94560, #0f3460)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Presocio
        </h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 16 }}>
          Instagram Reel Auto-Publisher — MVP
        </p>
      </div>

      {/* Mode Toggle */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          backgroundColor: '#141420',
          borderRadius: 12,
          padding: 4,
        }}
      >
        {(['test', 'full'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: mode === m ? '#e94560' : 'transparent',
              color: mode === m ? '#fff' : '#888',
              transition: 'all 0.2s',
            }}
          >
            {m === 'test' ? 'Test Mode (hardcoded)' : 'Full Mode (AI-generated)'}
          </button>
        ))}
      </div>

      {/* Pipeline Stages */}
      <div
        style={{
          backgroundColor: '#141420',
          border: '1px solid #2a2a3a',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, margin: '0 0 16px', color: '#e94560' }}>
          Pipeline Stages
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              n: 1,
              label: mode === 'full' ? 'Gemini → Movie JSON' : 'Hardcoded Movie JSON',
              status: mode === 'full' ? 'ai' : 'stub',
            },
            { n: 2, label: 'Wan 2.6 Generation', status: 'active' },
            {
              n: 3,
              label: mode === 'full' ? 'Gemini → Caption' : 'Test Caption',
              status: mode === 'full' ? 'ai' : 'stub',
            },
            { n: 4, label: 'Zernio → Instagram Post', status: 'active' },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                backgroundColor: '#1a1a2e',
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor:
                    s.status === 'active' ? '#e94560' : s.status === 'ai' ? '#0f3460' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {s.n}
              </span>
              <span style={{ fontSize: 14 }}>{s.label}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor:
                    s.status === 'active'
                      ? '#1a3a2e'
                      : s.status === 'ai'
                      ? '#1a2a3e'
                      : '#2a2a2a',
                  color:
                    s.status === 'active'
                      ? '#4ade80'
                      : s.status === 'ai'
                      ? '#60a5fa'
                      : '#666',
                }}
              >
                {s.status === 'active' ? 'LIVE' : s.status === 'ai' ? 'AI' : 'STUB'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Brief Form (Full Mode Only) */}
      {mode === 'full' && (
        <div
          style={{
            backgroundColor: '#141420',
            border: '1px solid #2a2a3a',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 18, margin: '0 0 16px', color: '#e94560' }}>
            Campaign Brief
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField
              label="Brand Name"
              value={input.brand_name}
              onChange={(v) => updateInput('brand_name', v)}
              placeholder="e.g. Acme Corporation"
            />
            <FormField
              label="Campaign Objective"
              value={input.campaign_objective}
              onChange={(v) => updateInput('campaign_objective', v)}
              placeholder="e.g. Increase brand awareness by 50% in Q2"
            />
            <FormField
              label="Target Audience"
              value={input.target_audience}
              onChange={(v) => updateInput('target_audience', v)}
              placeholder="e.g. Marketing professionals, 25-45"
            />
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>
                Content Tone
              </label>
              <select
                value={input.content_tone}
                onChange={(e) => updateInput('content_tone', e.target.value)}
                style={selectStyle}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="witty">Witty</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>
                Key Messages
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={keyMsgInput}
                  onChange={(e) => setKeyMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyMessage()}
                  placeholder="Type a key message and press Enter"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addKeyMessage} style={addBtnStyle}>
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {input.key_messages.map((msg, i) => (
                  <span key={i} style={tagStyle}>
                    {msg}
                    <button
                      onClick={() => removeKeyMessage(i)}
                      style={{ ...tagRemoveStyle }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <FormField
              label="Reel Topic"
              value={input.reel_topic}
              onChange={(v) => updateInput('reel_topic', v)}
              placeholder="e.g. How AI saves 10hrs/week"
            />
            <FormField
              label="Visual Style"
              value={input.visual_style}
              onChange={(v) => updateInput('visual_style', v)}
              placeholder="e.g. minimalist dark tech"
            />
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>
                Reel Duration
              </label>
              <select
                value={input.reel_duration_seconds}
                onChange={(e) =>
                  updateInput('reel_duration_seconds', Number(e.target.value))
                }
                style={selectStyle}
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
            <FormField
              label="Call to Action"
              value={input.cta}
              onChange={(v) => updateInput('cta', v)}
              placeholder="e.g. Follow for more AI tips"
            />
          </div>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px 32px',
          fontSize: 18,
          fontWeight: 700,
          border: 'none',
          borderRadius: 12,
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#333' : '#e94560',
          color: '#fff',
          transition: 'all 0.2s',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? 'Rendering & Posting...'
          : mode === 'test'
          ? 'Run Pipeline (Test Reel)'
          : 'Generate & Publish Reel'}
      </button>

      {/* Logs */}
      {logs.length > 0 && (
        <div style={logContainerStyle}>
          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                color: log.includes('Error') || log.includes('Fatal')
                  ? '#ef4444'
                  : log.includes('complete')
                  ? '#4ade80'
                  : '#888',
                padding: '2px 0',
              }}
            >
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: 24,
            backgroundColor: result.status === 'success' ? '#0d1a14' : '#1a0d0d',
            border: `1px solid ${result.status === 'success' ? '#1a3a2e' : '#3a1a1a'}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3
            style={{
              margin: '0 0 16px',
              color: result.status === 'success' ? '#4ade80' : '#ef4444',
            }}
          >
            {result.status === 'success' ? 'Published!' : 'Failed'}
          </h3>

          {result.status === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field label="Post ID" value={result.post_id} />
              <Field label="Video URL" value={result.video_url} link />
              <Field label="Caption Preview" value={result.caption_preview} />
              {result.caption && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', color: '#888', fontSize: 13 }}>
                    Full Caption
                  </summary>
                  <pre style={captionStyle}>{result.caption}</pre>
                </details>
              )}
            </div>
          )}

          {result.status === 'error' && (
            <p style={{ color: '#ef4444', margin: 0 }}>{result.error}</p>
          )}
        </div>
      )}

      <p style={{ textAlign: 'center', color: '#444', fontSize: 12, marginTop: 48 }}>
        Presocio MVP — Wan 2.6 + Gemini + Zernio pipeline
      </p>
    </main>
  );
}

// ─── Components ──────────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function Field({
  label,
  value,
  link,
}: {
  label: string;
  value?: string;
  link?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
      <span style={{ color: '#888', minWidth: 120 }}>{label}:</span>
      {link && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#60a5fa', wordBreak: 'break-all' }}
        >
          {value}
        </a>
      ) : (
        <span style={{ color: '#ccc', wordBreak: 'break-all' }}>{value ?? '—'}</span>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  border: '1px solid #2a2a3a',
  borderRadius: 8,
  backgroundColor: '#1a1a2e',
  color: '#e0e0e0',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const addBtnStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 16,
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  backgroundColor: '#e94560',
  color: '#fff',
};

const tagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  fontSize: 12,
  backgroundColor: '#1a2a3e',
  borderRadius: 6,
  color: '#60a5fa',
};

const tagRemoveStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888',
  cursor: 'pointer',
  fontSize: 14,
  padding: 0,
  lineHeight: 1,
};

const logContainerStyle: React.CSSProperties = {
  marginTop: 24,
  backgroundColor: '#0d0d14',
  border: '1px solid #2a2a3a',
  borderRadius: 12,
  padding: 16,
  fontFamily: '"Fira Code", "Cascadia Code", monospace',
  fontSize: 13,
  maxHeight: 300,
  overflowY: 'auto',
};

const captionStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  fontSize: 13,
  color: '#ccc',
  backgroundColor: '#0d0d14',
  padding: 12,
  borderRadius: 8,
  marginTop: 8,
};
