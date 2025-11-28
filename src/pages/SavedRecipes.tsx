import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ArrowLeft, Bookmark, Leaf, Drumstick, Clock } from 'lucide-react';
import { toast } from 'sonner';

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSavedRecipes();
  }, [user]);

  const fetchSavedRecipes = async () => {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*, recipes(*)')
      .eq('user_id', user?.id)
      .order('saved_at', { ascending: false });

    if (error) {
      toast.error('Failed to load saved recipes');
    } else {
      setRecipes(data?.map(sr => sr.recipes) || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ChefHat className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/ingredients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Saved Recipes</h1>
          <p className="text-muted-foreground">{recipes.length} saved recipes</p>
        </div>

        {recipes.length === 0 ? (
          <Card className="p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl mb-4">No saved recipes yet</p>
            <Button onClick={() => navigate('/ingredients')}>Find Recipes</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {recipe.estimated_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.estimated_time_minutes} mins
                      </div>
                    )}
                    <Badge variant="secondary">
                      {recipe.recipe_type === 'veg' ? <Leaf className="h-3 w-3 mr-1" /> : <Drumstick className="h-3 w-3 mr-1" />}
                      {recipe.recipe_type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;
