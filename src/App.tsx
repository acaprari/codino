import { AppLayout } from './components/layout/AppLayout';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

function App() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-lg text-center">
          <h1 className="text-child-xl font-bold text-purple-600 mb-4">
            Welcome to Codino!
          </h1>
          <p className="text-child-base text-gray-700 mb-6">
            Learn to code through storytelling
          </p>
          <Button variant="primary" size="lg">
            Start Your Adventure
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}

export default App;
