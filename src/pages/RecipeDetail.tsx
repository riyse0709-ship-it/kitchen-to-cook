import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ArrowLeft, 
  ExternalLink,
  Leaf,
  Drumstick,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Recipe {
  id: string;
  name: string;
  image_url: string | null;
  estimated_time_minutes: number | null;
  recipe_type: string;
  source_url: string | null;
  instructions: string | null;
}

interface RecipeIngredient {
  ingredient_name: string;
}

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mealPlanDialog, setMealPlanDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedMeal, setSelectedMeal] = useState<string>('dinner');
  
  const selectedIngredients = location.state?.selectedIngredients || [];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRecipe();
    checkIfSaved();
  }, [user, id]);

  const fetchRecipe = async () => {
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (recipeError) {
      toast.error('Failed to load recipe');
      console.error(recipeError);
      setLoading(false);
      return;
    }

    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_name')
      .eq('recipe_id', id);

    if (ingredientsError) {
      toast.error('Failed to load ingredients');
      console.error(ingredientsError);
    } else {
      setIngredients(ingredientsData.map((i) => i.ingredient_name));
    }

    setRecipe(recipeData);
    setLoading(false);
  };

  const checkIfSaved = async () => {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('recipe_id', id)
      .eq('user_id', user?.id)
      .maybeSingle();

    if (!error) {
      setIsSaved(!!data);
    }
  };

  const toggleSave = async () => {
    if (isSaved) {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('recipe_id', id)
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Failed to remove recipe');
      } else {
        setIsSaved(false);
        toast.success('Recipe removed from saved');
      }
    } else {
      const { error } = await supabase
        .from('saved_recipes')
        .insert([{ recipe_id: id, user_id: user?.id }]);

      if (error) {
        toast.error('Failed to save recipe');
      } else {
        setIsSaved(true);
        toast.success('Recipe saved!');
      }
    }
  };

  const addToMealPlan = async () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartDate = weekStart.toISOString().split('T')[0];

    const { error } = await supabase
      .from('meal_plans')
      .upsert([
        {
          user_id: user?.id,
          recipe_id: id,
          day_of_week: selectedDay,
          meal_type: selectedMeal,
          week_start_date: weekStartDate,
        },
      ]);

    if (error) {
      if (error.code === '23505') {
        toast.error('You already have a meal planned for this slot');
      } else {
        toast.error('Failed to add to meal plan');
        console.error(error);
      }
    } else {
      toast.success('Added to meal plan!');
      setMealPlanDialog(false);
    }
  };

  if (loading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  const matchingIngredients = ingredients.filter((ing) =>
    selectedIngredients.some((selIng: string) =>
      ing.toLowerCase().includes(selIng.toLowerCase())
    )
  );
  const matchPercentage = selectedIngredients.length > 0
    ? Math.round((matchingIngredients.length / ingredients.length) * 100)
    : 0;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden mb-6">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="h-24 w-24 text-primary/40" />
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <Badge variant="secondary">
                {recipe.recipe_type === 'veg' ? (
                  <Leaf className="h-4 w-4 mr-1" />
                ) : (
                  <Drumstick className="h-4 w-4 mr-1" />
                )}
                {recipe.recipe_type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
              </Badge>
              {recipe.estimated_time_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.estimated_time_minutes} minutes
                </div>
              )}
              {selectedIngredients.length > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  Match: {matchPercentage}%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleSave}>
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
            
            <Dialog open={mealPlanDialog} onOpenChange={setMealPlanDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Meal Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Meal Plan</DialogTitle>
                  <DialogDescription>
                    Choose a day and meal type for this recipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Day of Week</Label>
                    <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                      <SelectTrigger id="day">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal">Meal Type</Label>
                    <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                      <SelectTrigger id="meal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addToMealPlan} className="w-full">
                    Add to Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedIngredients.length > 0 && (
          <Card className="p-6 mb-6 bg-accent/5">
            <h2 className="text-lg font-semibold mb-2">Ingredient Match</h2>
            <p className="text-muted-foreground">
              {matchingIngredients.length} out of {ingredients.length} ingredients match your selection
            </p>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => {
              const isMatching = matchingIngredients.includes(ingredient);
              return (
                <li
                  key={index}
                  className={`flex items-center gap-2 ${
                    isMatching ? 'text-accent font-medium' : ''
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                  {ingredient}
                </li>
              );
            })}
          </ul>
        </Card>

        {recipe.instructions && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{recipe.instructions}</p>
            </div>
          </Card>
        )}

        {recipe.source_url && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Full Recipe</h2>
            <Button asChild>
              <a href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                Open full recipe
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
