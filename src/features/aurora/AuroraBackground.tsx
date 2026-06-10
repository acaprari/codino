export function AuroraBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background:
          'radial-gradient(at 15% 20%, rgba(var(--aurora-bg-glow-violet-rgb), 0.42) 0%, transparent 40%), ' +
          'radial-gradient(at 85% 80%, rgba(var(--aurora-bg-glow-pink-rgb), 0.38) 0%, transparent 45%), ' +
          'radial-gradient(at 50% 50%, rgba(var(--aurora-bg-glow-indigo-rgb), 0.28) 0%, transparent 55%), ' +
          'linear-gradient(135deg, var(--aurora-bg-deep) 0%, var(--aurora-bg-mid) 50%, var(--aurora-bg-accent) 100%)',
      }}
    />
  );
}
