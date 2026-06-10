import { describe, it, expect } from 'vitest';

describe('INV-VS-06: body.aurora-mode applied unconditionally at boot', () => {
  it('importing src/main.tsx adds aurora-mode to <body>', async () => {
    document.body.classList.remove('aurora-mode');
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }
    await import('../../src/main');
    expect(document.body.classList.contains('aurora-mode')).toBe(true);
  });
});
