import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { 
  ChefHat, 
  Plus, 
  Search, 
  X, 
  MoreVertical,
  LogOut,
  User,
  Bookmark,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  is_default: boolean;
  user_id: string | null;
}

const categories = ['Grains', 'Pulses', 'Vegetables', 'Dairy & Protein', 'Spices & Oils'];

const Ingredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: '' });
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchIngredients();
  }, [user]);

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('category');

    if (error) {
      toast.error('Failed to load ingredients');
      console.error(error);
    } else {
      setIngredients(data || []);
    }
    setLoading(false);
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.name || !newIngredient.category) {
      toast.error('Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('ingredients')
      .insert([
        {
          name: newIngredient.name,
          category: newIngredient.category,
          is_default: false,
          user_id: user?.id,
        },
      ]);

    if (error) {
      toast.error('Failed to add ingredient');
      console.error(error);
    } else {
      toast.success('Ingredient added!');
      setNewIngredient({ name: '', category: '' });
      setDialogOpen(false);
      fetchIngredients();
    }
  };

  const handleUpdateIngredient = async () => {
    if (!editingIngredient) return;

    const { error } = await supabase
      .from('ingredients')
      .update({
        name: editingIngredient.name,
        category: editingIngredient.category,
      })
      .eq('id', editingIngredient.id);

    if (error) {
      toast.error('Failed to update ingredient');
      console.error(error);
    } else {
      toast.success('Ingredient updated!');
      setEditingIngredient(null);
      setDialogOpen(false);
      fetchIngredients();
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete ingredient');
      console.error(error);
    } else {
      toast.success('Ingredient deleted!');
      fetchIngredients();
    }
  };

  const toggleIngredient = (name: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedIngredients(newSelected);
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedIngredients = categories.reduce((acc, category) => {
    acc[category] = filteredIngredients.filter((ing) => ing.category === category);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Fridge2Feast</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/saved-recipes')}>
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/meal-plan')}>
              <Calendar className="h-4 w-4 mr-2" />
              Meal Plan
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">What's in your kitchen?</h1>
          <p className="text-muted-foreground">Select your available ingredients to find recipes</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory('All')}
              >
                All
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingIngredient(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingIngredient ? 'Edit Ingredient' : 'Add Custom Ingredient'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingIngredient 
                      ? 'Update the ingredient details' 
                      : 'Add a custom ingredient to your list'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ingredient Name</Label>
                    <Input
                      id="name"
                      value={editingIngredient?.name || newIngredient.name}
                      onChange={(e) =>
                        editingIngredient
                          ? setEditingIngredient({ ...editingIngredient, name: e.target.value })
                          : setNewIngredient({ ...newIngredient, name: e.target.value })
                      }
                      placeholder="e.g., Coconut Oil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingIngredient?.category || newIngredient.category}
                      onValueChange={(value) =>
                        editingIngredient
                          ? setEditingIngredient({ ...editingIngredient, category: value })
                          : setNewIngredient({ ...newIngredient, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                  >
                    {editingIngredient ? 'Update' : 'Add'} Ingredient
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Ingredients Grid */}
        <div className="space-y-8">
          {(selectedCategory === 'All' ? categories : [selectedCategory]).map((category) => {
            const categoryIngredients = groupedIngredients[category] || [];
            if (categoryIngredients.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="text-2xl font-semibold mb-4">{category}</h2>
                <div className="flex flex-wrap gap-3">
                  {categoryIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="relative group">
                      <Badge
                        variant={selectedIngredients.has(ingredient.name) ? 'default' : 'outline'}
                        className="cursor-pointer text-base py-2 px-4 pr-8"
                        onClick={() => toggleIngredient(ingredient.name)}
                      >
                        {ingredient.name}
                      </Badge>
                      {!ingredient.is_default && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingIngredient(ingredient);
                                setDialogOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteIngredient(ingredient.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedIngredients.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected ingredients</p>
              <p className="font-semibold text-lg">{selectedIngredients.size} ingredients</p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate('/recipe-preference', { state: { selectedIngredients: Array.from(selectedIngredients) } })}
            >
              Find Recipes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
