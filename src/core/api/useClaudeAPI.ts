import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ClaudeAPIClient } from './claude';

export function useClaudeAPI() {
  const apiKey = useGameStore((state) => state.apiKey);

  const client = useMemo(() => {
    if (!apiKey) {
      return null;
    }
    return new ClaudeAPIClient(apiKey);
  }, [apiKey]);

  return client;
}
