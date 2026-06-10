interface RuntimeErrorCardProps {
  message: string;
  line: number;
  language: 'it' | 'en';
}

function translateMessage(message: string, language: 'it' | 'en'): string {
  if (language === 'en') return message;

  // Exact matches
  const exact: Record<string, string> = {
    'Invalid assignment':                      'Assegnazione non valida',
    'Print statement has no expression':       'SCRIVI ha bisogno di qualcosa da stampare',
    'Empty argument in print statement':       'Una virgola in SCRIVI senza niente prima o dopo',
    'Loop count cannot be negative':           'Il numero di ripetizioni non può essere negativo',
    'Loop count must be an integer':           'Il numero di ripetizioni deve essere un numero intero',
    'Loop has no count':                       'Manca il numero di ripetizioni',
    'Loop count must be a number':             'Le ripetizioni devono essere un numero',
    'Range loop missing iteration variable':   'Il RIPETI con DA e A ha bisogno di un nome di variabile',
    'Range loop missing FROM/DA value':        'Manca il valore dopo DA',
    'Range loop missing TO/A value':           'Manca il valore dopo A',
    'Range loop bounds must be numbers':       'I valori dopo DA e A devono essere numeri',
    'Range loop bounds must be integers':      'I valori dopo DA e A devono essere numeri interi',
    'Range loop FROM must be at most TO':      'Il valore dopo DA deve essere minore o uguale a quello dopo A',
    'Parity check requires a number':                'PARI e DISPARI funzionano solo con i numeri',
    'Parity check requires a whole number (integer)': 'PARI e DISPARI funzionano solo con numeri interi',
    'Empty expression':                        'Espressione vuota',
    'Invalid expression structure':            'Struttura dell\'espressione non valida',
    'Cannot use text in an arithmetic operation': 'Non puoi usare un testo in un\'operazione matematica',
    'Division by zero':                        'Non si può dividere per zero!',
    'Empty term':                              'Termine vuoto',
    'Invalid condition':                       'Condizione non valida',
  };
  if (exact[message]) return exact[message];

  // Prefix matches (messages with dynamic suffixes)
  if (message.startsWith('Undefined variable:')) {
    const name = message.slice('Undefined variable:'.length).trim();
    return `Variabile non trovata: ${name}`;
  }
  if (message.startsWith('Loop count too large')) {
    const max = message.match(/\d+/)?.[0] ?? '';
    return `Troppe ripetizioni! Il massimo è ${max}`;
  }
  if (message.startsWith('Unknown comparison operator:')) {
    const op = message.slice('Unknown comparison operator:'.length).trim();
    return `Operatore sconosciuto: ${op}`;
  }
  if (message.startsWith('Cannot evaluate:')) {
    return 'Espressione non valida';
  }

  return message;
}

export function RuntimeErrorCard({ message, line, language }: RuntimeErrorCardProps) {
  const lineLabel = language === 'it' ? 'Riga' : 'Line';
  const translated = translateMessage(message, language);
  return (
    <div
      style={{
        background: 'rgba(var(--aurora-accent-error-rgb), 0.10)',
        border: '1px solid rgba(var(--aurora-accent-error-rgb), 0.30)',
        borderLeft: '3px solid var(--aurora-accent-error)',
        borderRadius: 'var(--aurora-card-radius)',
        padding: '10px 14px',
        color: 'var(--aurora-text-primary)',
        fontSize: '13.5px',
        lineHeight: 1.5,
        fontFamily: 'var(--aurora-font-ui)',
      }}
    >
      🤔 {lineLabel} {line}: {translated}
    </div>
  );
}
