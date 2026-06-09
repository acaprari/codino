import { useState } from 'react';
import { Label } from '../../../components/aurora/Label';

type CategoryKey = 'print' | 'math' | 'loops' | 'conditions';

interface HelpPanelProps {
  language: 'it' | 'en';
  currentLevel: number;
}

interface Bilingual { it: string; en: string }

interface CategoryDef {
  key: CategoryKey;
  iconAndTitle: Bilingual;
  cards: Array<{ kw: Bilingual; ex: Bilingual }>;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'print',
    iconAndTitle: { it: '✏️ Scrivere', en: '✏️ Writing' },
    cards: [
      { kw: { it: 'SCRIVI x',         en: 'WRITE x' },          ex: { it: 'mostra un numero o variabile', en: 'show a number or variable' } },
      { kw: { it: 'SCRIVI "ciao"',    en: 'WRITE "hello"' },    ex: { it: 'mostra un testo tra virgolette', en: 'show text in quotes' } },
      { kw: { it: 'WRITE x',          en: 'SCRIVI x' },         ex: { it: 'lo stesso in inglese',          en: 'same in Italian' } },
      { kw: { it: 'SCRIVI "Hai", monete, "monete"', en: 'WRITE "You have", coins, "coins"' }, ex: { it: 'più cose, separate da spazi', en: 'multiple parts, joined with spaces' } },
    ],
  },
  {
    key: 'math',
    iconAndTitle: { it: '➕ Matematica', en: '➕ Math' },
    cards: [
      { kw: { it: '+   –   x   :',    en: '+   –   x   :' },    ex: { it: 'somma · sottrai · moltiplica · dividi', en: 'add · subtract · multiply · divide' } },
    ],
  },
  {
    key: 'loops',
    iconAndTitle: { it: '🔁 Ripetizioni', en: '🔁 Loops' },
    cards: [
      { kw: { it: 'RIPETI 5 VOLTE … FINE', en: 'REPEAT 5 TIMES … END' }, ex: { it: 'ripete 5 volte', en: 'repeats 5 times' } },
      { kw: { it: 'RIPETI i DA 1 A 5 … FINE', en: 'REPEAT i FROM 1 TO 5 … END' }, ex: { it: 'i conta da inizio a fine', en: 'i counts from start to end' } },
    ],
  },
  {
    key: 'conditions',
    iconAndTitle: { it: '🤔 Condizioni', en: '🤔 Conditions' },
    cards: [
      { kw: { it: 'SE x > 5 … FINE',         en: 'IF x > 5 … END' },         ex: { it: 'esegue se la condizione è vera', en: 'runs if true' } },
      { kw: { it: 'SE … ALTRIMENTI … FINE',  en: 'IF … ELSE … END' },        ex: { it: 'oppure questo se è falsa',       en: 'or this if false' } },
      { kw: { it: 'SE x PARI … FINE', en: 'IF x EVEN … END' }, ex: { it: 'controlla se è pari (o DISPARI/ODD)', en: 'checks parity (or ODD/DISPARI)' } },
    ],
  },
];

// Matches LEVEL_CONCEPTS in claude.ts (1-based):
// 1=Print, 2-3=Math, 4-5=Loops, 6+=Conditions (per execution-engine INV-10)
function defaultExpanded(level: number): CategoryKey {
  if (level <= 1) return 'print';
  if (level <= 3) return 'math';
  if (level <= 5) return 'loops';
  return 'conditions';
}

const PANEL_TITLE = { it: 'Aiuto · Linguaggio', en: 'Help · Language' };

export function HelpPanel({ language, currentLevel }: HelpPanelProps) {
  const [expanded, setExpanded] = useState<Set<CategoryKey>>(
    new Set([defaultExpanded(currentLevel)])
  );

  const toggle = (key: CategoryKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', flex: 1, minHeight: 0 }}>
      <Label>{PANEL_TITLE[language]}</Label>
      {CATEGORIES.map((cat) => {
        const isOpen = expanded.has(cat.key);
        return (
          <div key={cat.key}>
            <div
              onClick={() => toggle(cat.key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.8px',
                color: isOpen ? 'var(--aurora-accent-pink)' : 'var(--aurora-text-secondary)',
                paddingBottom: '6px',
              }}
            >
              <span>{cat.iconAndTitle[language]}</span>
              <span style={{ fontSize: '16px', color: 'var(--aurora-text-secondary)', lineHeight: 1 }}>{isOpen ? '▾' : '▸'}</span>
            </div>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {cat.cards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--aurora-card-radius)',
                      padding: '9px 11px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--aurora-font-code)', fontSize: '12.5px', color: 'var(--aurora-text-primary)', fontWeight: 600 }}>
                      {card.kw[language]}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--aurora-text-tertiary)', marginTop: '3px' }}>
                      {card.ex[language]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
