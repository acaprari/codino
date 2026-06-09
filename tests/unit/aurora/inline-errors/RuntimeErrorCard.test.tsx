import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RuntimeErrorCard } from '../../../../src/features/aurora/inline-errors/RuntimeErrorCard';

describe('RuntimeErrorCard', () => {
  describe('English mode', () => {
    it('renders the message verbatim with English line label', () => {
      render(<RuntimeErrorCard message="Division by zero" line={3} language="en" />);
      expect(screen.getByText(/Line 3: Division by zero/)).toBeInTheDocument();
    });

    it('passes through messages unchanged regardless of map entry', () => {
      const msg = 'Range loop FROM must be at most TO';
      render(<RuntimeErrorCard message={msg} line={7} language="en" />);
      expect(screen.getByText(new RegExp(msg))).toBeInTheDocument();
    });
  });

  describe('Italian mode — new translations (language revision)', () => {
    const cases: Array<[string, RegExp]> = [
      ['Empty argument in print statement', /Una virgola in SCRIVI senza niente prima o dopo/],
      ['Loop has no count', /Manca il numero di ripetizioni/],
      ['Loop count must be a number', /Le ripetizioni devono essere un numero/],
      ['Range loop missing iteration variable', /Il RIPETI con DA e A ha bisogno di un nome di variabile/],
      ['Range loop missing FROM/DA value', /Manca il valore dopo DA/],
      ['Range loop missing TO/A value', /Manca il valore dopo A/],
      ['Range loop bounds must be numbers', /I valori dopo DA e A devono essere numeri/],
      ['Range loop bounds must be integers', /I valori dopo DA e A devono essere numeri interi/],
      ['Range loop FROM must be at most TO', /Il valore dopo DA deve essere minore o uguale a quello dopo A/],
      ['Parity check requires a number', /PARI e DISPARI funzionano solo con i numeri/],
      ['Parity check requires a whole number \\(integer\\)', /PARI e DISPARI funzionano solo con numeri interi/],
    ];

    for (const [english, italianMatch] of cases) {
      it(`translates "${english}" to Italian`, () => {
        render(<RuntimeErrorCard message={english.replace(/\\([()])/g, '$1')} line={1} language="it" />);
        expect(screen.getByText(italianMatch)).toBeInTheDocument();
      });
    }
  });

  describe('Italian mode — pre-existing translations (spot-checks)', () => {
    it('translates "Division by zero"', () => {
      render(<RuntimeErrorCard message="Division by zero" line={2} language="it" />);
      expect(screen.getByText(/Non si può dividere per zero/)).toBeInTheDocument();
      expect(screen.getByText(/Riga 2/)).toBeInTheDocument();
    });

    it('translates the "Undefined variable" prefix and preserves the variable name', () => {
      render(<RuntimeErrorCard message="Undefined variable: mele" line={4} language="it" />);
      expect(screen.getByText(/Variabile non trovata: mele/)).toBeInTheDocument();
    });

    it('translates the "Loop count too large" prefix and preserves the cap', () => {
      render(<RuntimeErrorCard message="Loop count too large (maximum 1000)" line={5} language="it" />);
      expect(screen.getByText(/Troppe ripetizioni! Il massimo è 1000/)).toBeInTheDocument();
    });
  });

  describe('Italian mode — fallthrough', () => {
    it('renders an unknown message unchanged', () => {
      const unknown = 'Some message the interpreter does not produce yet';
      render(<RuntimeErrorCard message={unknown} line={1} language="it" />);
      expect(screen.getByText(new RegExp(unknown))).toBeInTheDocument();
    });
  });
});
