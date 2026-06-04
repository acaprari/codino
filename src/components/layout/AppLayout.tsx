import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: ReactNode;
  onSettingsClick?: () => void;
}

export function AppLayout({ children, onSettingsClick }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Navbar onSettingsClick={onSettingsClick} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
