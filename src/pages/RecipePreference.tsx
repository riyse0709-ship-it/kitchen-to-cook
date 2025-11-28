import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, Leaf, Drumstick } from 'lucide-react';

const RecipePreference = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedIngredients = location.state?.selectedIngredients || [];
  const [preference, setPreference] = useState<'veg' | 'non-veg' | null>(null);

  if (selectedIngredients.length === 0) {
    navigate('/ingredients');
    return null;
  }

  const handleContinue = () => {
    if (!preference) return;
    navigate('/recipes', { 
      state: { 
        selectedIngredients, 
        recipeType: preference 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <ChefHat className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">What are you in the mood for?</h1>
          <p className="text-muted-foreground">
            Choose your preference to filter recipes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`p-8 cursor-pointer transition-all hover:shadow-lg ${
              preference === 'veg' 
                ? 'border-2 border-accent bg-accent/5' 
                : 'border-2 border-transparent'
            }`}
            onClick={() => setPreference('veg')}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <Leaf className="h-12 w-12 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Vegetarian</h3>
              <p className="text-muted-foreground">Plant-based recipes only</p>
            </div>
          </Card>

          <Card
            className={`p-8 cursor-pointer transition-all hover:shadow-lg ${
              preference === 'non-veg' 
                ? 'border-2 border-primary bg-primary/5' 
                : 'border-2 border-transparent'
            }`}
            onClick={() => setPreference('non-veg')}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Drumstick className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Non-Vegetarian</h3>
              <p className="text-muted-foreground">Includes meat and fish</p>
            </div>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/ingredients')} className="flex-1">
            Back to Ingredients
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!preference}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RecipePreference;
