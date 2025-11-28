-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_url TEXT,
  image_url TEXT,
  estimated_time_minutes INTEGER,
  recipe_type TEXT NOT NULL CHECK (recipe_type IN ('veg', 'non-veg')),
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recipe_ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL
);

-- Create saved_recipes table
CREATE TABLE public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create meal_plans table for weekly planning
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week, meal_type, week_start_date)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ingredients policies
CREATE POLICY "Anyone can view default ingredients"
  ON public.ingredients FOR SELECT
  USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own custom ingredients"
  ON public.ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom ingredients"
  ON public.ingredients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom ingredients"
  ON public.ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- Recipes policies (public read)
CREATE POLICY "Anyone can view recipes"
  ON public.recipes FOR SELECT
  USING (true);

-- Recipe ingredients policies (public read)
CREATE POLICY "Anyone can view recipe ingredients"
  ON public.recipe_ingredients FOR SELECT
  USING (true);

-- Saved recipes policies
CREATE POLICY "Users can view their own saved recipes"
  ON public.saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON public.saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON public.saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "Users can view their own meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
  ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
  ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone)
  VALUES (
    new.id,
    new.email,
    new.phone
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default Indian ingredients
INSERT INTO public.ingredients (name, category, is_default) VALUES
-- Grains
('Atta (Wheat Flour)', 'Grains', true),
('Basmati Rice', 'Grains', true),
('Suji (Semolina)', 'Grains', true),
('Poha (Flattened Rice)', 'Grains', true),
('Bread', 'Grains', true),
('Maida (All Purpose Flour)', 'Grains', true),
-- Pulses
('Chana Dal', 'Pulses', true),
('Arhar Dal (Toor Dal)', 'Pulses', true),
('Moong Dal', 'Pulses', true),
('Rajma (Kidney Beans)', 'Pulses', true),
('Chole (Chickpeas)', 'Pulses', true),
('Urad Dal', 'Pulses', true),
-- Vegetables
('Onion', 'Vegetables', true),
('Tomato', 'Vegetables', true),
('Potato', 'Vegetables', true),
('Capsicum (Bell Pepper)', 'Vegetables', true),
('Spinach (Palak)', 'Vegetables', true),
('Carrot', 'Vegetables', true),
('Peas', 'Vegetables', true),
('Cauliflower (Gobi)', 'Vegetables', true),
('Green Beans', 'Vegetables', true),
('Eggplant (Baingan)', 'Vegetables', true),
-- Dairy & Protein
('Milk', 'Dairy & Protein', true),
('Curd (Yogurt)', 'Dairy & Protein', true),
('Paneer', 'Dairy & Protein', true),
('Cheese', 'Dairy & Protein', true),
('Egg', 'Dairy & Protein', true),
('Chicken', 'Dairy & Protein', true),
('Butter', 'Dairy & Protein', true),
-- Spices & Oils
('Haldi (Turmeric)', 'Spices & Oils', true),
('Jeera (Cumin)', 'Spices & Oils', true),
('Garam Masala', 'Spices & Oils', true),
('Red Chilli Powder', 'Spices & Oils', true),
('Dhania Powder (Coriander)', 'Spices & Oils', true),
('Oil', 'Spices & Oils', true),
('Ghee', 'Spices & Oils', true),
('Mustard Seeds', 'Spices & Oils', true),
('Curry Leaves', 'Spices & Oils', true),
('Ginger', 'Spices & Oils', true),
('Garlic', 'Spices & Oils', true);