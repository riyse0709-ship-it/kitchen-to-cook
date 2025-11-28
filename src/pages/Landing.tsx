import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChefHat, 
  Clock, 
  Leaf, 
  Sparkles, 
  ArrowRight,
  Circle,
  CheckCircle2
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/ingredients');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: Clock,
      title: 'Saves Time',
      description: 'Quick cooking decisions for busy days'
    },
    {
      icon: Leaf,
      title: 'Indian Pantry Optimized',
      description: 'Works with your everyday staples'
    },
    {
      icon: Sparkles,
      title: 'Reduces Food Waste',
      description: 'Use what you have, waste less'
    },
    {
      icon: CheckCircle2,
      title: 'Veg & Non-Veg Options',
      description: 'Filter recipes by your preference'
    }
  ];

  const ingredients = [
    'Atta', 'Dal', 'Rice', 'Onion', 'Tomato', 
    'Haldi', 'Paneer', 'Ghee', 'Jeera'
  ];

  const steps = [
    {
      number: '1',
      title: 'Select Ingredients',
      description: 'Choose what you already have in your kitchen'
    },
    {
      number: '2',
      title: 'Pick Veg or Non-Veg',
      description: 'Filter recipes based on your preference'
    },
    {
      number: '3',
      title: 'Get Matched Recipes',
      description: 'Recipes ranked by ingredient match score'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Fridge2Feast</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline">
            {user ? 'Dashboard' : 'Sign In'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
              From ingredients to inspiration
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Turn your pantry into <span className="text-primary">meals</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Select what's in your kitchen and get instant recipe ideas optimized for Indian households
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={handleGetStarted} className="text-lg">
                Start with Ingredients
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Sign Up Free
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <Card className="relative p-8 bg-card/80 backdrop-blur">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <feature.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Ingredients */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Popular Ingredients in Indian Kitchens
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient}
              className="px-6 py-3 bg-secondary rounded-full text-secondary-foreground font-medium hover:scale-105 transition-transform cursor-pointer"
            >
              {ingredient}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Three simple steps to your next meal
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 text-center relative">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-10 top-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-accent/10">
          <h2 className="text-3xl font-bold mb-4">
            Loved by home chefs and students
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Optimized for real Indian kitchens
          </p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Circle key={i} className="h-4 w-4 fill-primary text-primary" />
            ))}
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">
            Ready to cook something amazing today?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Join thousands of home cooks discovering new recipes
          </p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg">
            Start with your ingredients
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="font-semibold">Fridge2Feast</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ for Indian kitchens
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
