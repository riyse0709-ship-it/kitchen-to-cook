import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

const MealPlan = () => {
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const meals = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMealPlans();
  }, [user]);

  const fetchMealPlans = async () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartDate = weekStart.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, recipes(*)')
      .eq('user_id', user?.id)
      .eq('week_start_date', weekStartDate);

    if (error) {
      toast.error('Failed to load meal plan');
    } else {
      setMealPlans(data || []);
    }
    setLoading(false);
  };

  const getMealForSlot = (day: number, meal: string) => {
    return mealPlans.find(mp => mp.day_of_week === day && mp.meal_type === meal);
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
          <h1 className="text-4xl font-bold mb-2">Weekly Meal Plan</h1>
          <p className="text-muted-foreground">Plan your meals for the week</p>
        </div>

        <div className="grid gap-4">
          {days.map((day, dayIndex) => (
            <Card key={day} className="p-6">
              <h2 className="text-2xl font-semibold mb-4">{day}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {meals.map((meal) => {
                  const mealPlan = getMealForSlot(dayIndex, meal);
                  return (
                    <Card key={meal} className="p-4 bg-muted/30">
                      <h3 className="font-medium capitalize mb-2">{meal}</h3>
                      {mealPlan ? (
                        <div
                          className="cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/recipe/${mealPlan.recipe_id}`)}
                        >
                          <p className="text-sm font-medium">{mealPlan.recipes.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No meal planned</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
