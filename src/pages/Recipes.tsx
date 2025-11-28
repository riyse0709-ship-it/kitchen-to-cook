import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChefHat, Clock, Bookmark, BookmarkCheck, ArrowLeft, Leaf, Drumstick } from 'lucide-react';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  name: string;
  image_url: string | null;
  estimated_time_minutes: number | null;
  recipe_type: string;
  source_url: string | null;
  match_score: number;
  total_ingredients: number;
}

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedIngredients = location.state?.selectedIngredients || [];
  const recipeType = location.state?.recipeType;

  useEffect(() => {
    if (!user || selectedIngredients.length === 0) {
      navigate('/ingredients');
      return;
    }
    fetchRecipes();
    fetchSavedRecipes();
  }, [user, selectedIngredients]);

  const fetchRecipes = async () => {
    const { data: allRecipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('recipe_type', recipeType);

    if (recipesError) {
      toast.error('Failed to load recipes');
      console.error(recipesError);
      setLoading(false);
      return;
    }

    const { data: recipeIngredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select('*');

    if (ingredientsError) {
      toast.error('Failed to load recipe ingredients');
      console.error(ingredientsError);
      setLoading(false);
      return;
    }

    const recipesWithScore = allRecipes.map((recipe) => {
      const ingredients = recipeIngredients
        .filter((ri) => ri.recipe_id === recipe.id)
        .map((ri) => ri.ingredient_name.toLowerCase());

      const matchCount = selectedIngredients.filter((ing: string) =>
        ingredients.some((recipeIng) => recipeIng.includes(ing.toLowerCase()))
      ).length;

      return {
        ...recipe,
        match_score: matchCount,
        total_ingredients: ingredients.length,
      };
    });

    recipesWithScore.sort((a, b) => b.match_score - a.match_score);
    setRecipes(recipesWithScore.filter(r => r.match_score > 0));
    setLoading(false);
  };

  const fetchSavedRecipes = async () => {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', user?.id);

    if (!error && data) {
      setSavedRecipeIds(new Set(data.map((sr) => sr.recipe_id)));
    }
  };

  const toggleSaveRecipe = async (recipeId: string) => {
    if (savedRecipeIds.has(recipeId)) {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Failed to remove recipe');
      } else {
        setSavedRecipeIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
        toast.success('Recipe removed from saved');
      }
    } else {
      const { error } = await supabase
        .from('saved_recipes')
        .insert([{ recipe_id: recipeId, user_id: user?.id }]);

      if (error) {
        toast.error('Failed to save recipe');
      } else {
        setSavedRecipeIds((prev) => new Set(prev).add(recipeId));
        toast.success('Recipe saved!');
      }
    }
  };

  const getFilteredRecipes = () => {
    let filtered = [...recipes];

    if (filter === 'high-match') {
      filtered = filtered.filter((r) => (r.match_score / r.total_ingredients) >= 0.7);
    } else if (filter === 'quick') {
      filtered = filtered.filter((r) => r.estimated_time_minutes && r.estimated_time_minutes <= 30);
    }

    if (sortBy === 'time') {
      filtered.sort((a, b) => (a.estimated_time_minutes || 999) - (b.estimated_time_minutes || 999));
    }

    return filtered;
  };

  const filteredRecipes = getFilteredRecipes();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/ingredients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ingredients
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recipes for you</h1>
          <p className="text-muted-foreground">
            Found {filteredRecipes.length} {recipeType === 'veg' ? 'vegetarian' : 'non-vegetarian'} recipes
          </p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={filter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('all')}
              >
                All
              </Badge>
              <Badge
                variant={filter === 'high-match' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('high-match')}
              >
                High Match (70%+)
              </Badge>
              <Badge
                variant={filter === 'quick' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('quick')}
              >
                Quick (&lt;30 mins)
              </Badge>
            </div>

            <div className="md:ml-auto min-w-[200px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="time">Time: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {filteredRecipes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl mb-4">No recipes found with these filters</p>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or selecting different ingredients
            </p>
            <Button onClick={() => navigate('/ingredients')}>
              Back to Ingredients
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const matchPercentage = Math.round((recipe.match_score / recipe.total_ingredients) * 100);
              
              return (
                <Card
                  key={recipe.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/recipe/${recipe.id}`, { state: { selectedIngredients } })}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveRecipe(recipe.id);
                      }}
                    >
                      {savedRecipeIds.has(recipe.id) ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{recipe.name}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {recipeType === 'veg' ? (
                          <Leaf className="h-3 w-3 mr-1" />
                        ) : (
                          <Drumstick className="h-3 w-3 mr-1" />
                        )}
                        {recipeType === 'veg' ? 'Veg' : 'Non-Veg'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {recipe.estimated_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.estimated_time_minutes} mins
                        </div>
                      )}
                      <Badge className="bg-accent text-accent-foreground">
                        Match: {matchPercentage}%
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2">
                      {recipe.match_score}/{recipe.total_ingredients} ingredients match
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
