export function AuroraBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background:
          'radial-gradient(at 15% 20%, rgba(167, 139, 250, 0.42) 0%, transparent 40%), ' +
          'radial-gradient(at 85% 80%, rgba(244, 114, 182, 0.38) 0%, transparent 45%), ' +
          'radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.28) 0%, transparent 55%), ' +
          'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)',
      }}
    />
  );
}
