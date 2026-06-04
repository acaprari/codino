import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface SuccessScreenProps {
  stars: number;
  explanation: string;
  narrativeBridge: string;
  onContinue: () => void;
}

export function SuccessScreen({ stars, explanation, narrativeBridge, onContinue }: SuccessScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-2xl text-center">
        {/* Celebration */}
        <div className="text-6xl mb-4">🎉</div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <span key={i} className="text-5xl">
              {i <= stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        {/* Explanation */}
        <p className="text-child-lg text-gray-700 mb-6">
          {explanation}
        </p>

        {/* Narrative bridge */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
          <p className="text-child-base text-purple-900">
            {narrativeBridge}
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={onContinue}>
          Continue →
        </Button>
      </Card>
    </div>
  );
}
