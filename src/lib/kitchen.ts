export const MENU_AVOIDS = [
  "Milk and dairy",
  "Peanuts",
  "Tree nuts",
  "Eggs",
  "Beef",
  "Chicken",
  "Pork",
  "Strawberries",
] as const;

export type MenuPart = {
  title: string;
  ingredients: string[];
  steps: string[];
};

export type MenuDish = {
  id: string;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Birthday";
  name: string;
  summary: string;
  serves: string;
  book?: { title: string; where: string };
  glutenFree: string;
  notes: string[];
  parts: MenuPart[];
};

export const MENU_SWAPS = [
  {
    instead: "Milk",
    use: "Oat, rice, soy, or hemp milk",
    note: "Skip almond, cashew, and other nut milks.",
  },
  {
    instead: "Butter",
    use: "A dairy-free buttery stick, or coconut, flax, and sunflower oils",
    note: "Many plant butters are made from cashews or almonds. Read the list.",
  },
  {
    instead: "Eggs in baking",
    use: "No egg, or 3 tablespoons of applesauce per egg",
    note: "The cookbooks also mention flaxseed or a packaged replacer. Skip banana if it is a problem.",
  },
  {
    instead: "Peanut butter",
    use: "Sunflower seed butter",
    note: "SunButter is made in a peanut-free and tree-nut-free facility. Still read the jar.",
  },
  {
    instead: "Chicken broth",
    use: "Vegetable broth",
    note: "Check that it is labeled free of chicken and beef.",
  },
  {
    instead: "Ground beef or pork",
    use: "Plain ground turkey",
    note: "Skip seasoned blends. They can hide pork.",
  },
  {
    instead: "Strawberries",
    use: "Blueberries, raspberries, peaches, or apricot jam",
    note: "Mixed-berry jams and pink frostings often use strawberry.",
  },
] as const;

export const DISHES: MenuDish[] = [
  {
    id: "blueberry-pancakes",
    meal: "Breakfast",
    name: "Blueberry pancakes",
    summary:
      "A no-egg pancake. Oil, water, and baking powder lift the batter, and the blueberries go in at the end.",
    serves: "About 11 pancakes",
    book: {
      title: "What's to Eat?",
      where: "Linda Marienhoff Coss, page 137",
    },
    glutenFree:
      "A gluten-free pancake is in The Kid-Friendly ADHD & Autism Cookbook under the name No Yolking Around. That page also lists almond milk and almond oil. Skip both.",
    notes: [
      "Serve with a dairy-free spread, maple syrup, or blueberry or apricot jam. Banana slices and extra blueberries sit beside the plate.",
      "A double batch freezes. Reheat in the toaster.",
    ],
    parts: [
      {
        title: "Pancakes",
        ingredients: [
          "1 1/2 cups all-purpose flour",
          "2 1/2 tbsp sugar",
          "3 tsp baking powder",
          "2/3 cup vanilla soy milk (rice or oat milk works too)",
          "3/4 cup water",
          "Egg replacer mix: 2 1/2 tbsp water, 2 1/2 tbsp vegetable oil, and 1 1/2 tsp baking powder, stirred together",
          "1 cup fresh blueberries, washed and drained",
        ],
        steps: [
          "Put everything except the blueberries in a mixing bowl and stir until smooth.",
          "Fold in the blueberries.",
          "Heat a large nonstick skillet over medium-high heat. Pour batter into 4-inch rounds.",
          "Cook until bubbles form and pop across the top, then flip. Cook until the second side is golden.",
          "Serve with a dairy-free buttery spread, maple syrup, or blueberry or apricot jam.",
        ],
      },
    ],
  },
  {
    id: "turkey-sausage-oatmeal",
    meal: "Breakfast",
    name: "Maple turkey sausage with cinnamon apple oatmeal",
    summary:
      "Homemade patties, so there is no pork casing and no chicken blend. The oatmeal cooks while the patties brown.",
    serves: "4 people, about 25 minutes",
    glutenFree: "Use oats labeled certified gluten-free.",
    notes: [
      "Freeze cooked patties between parchment.",
      "For a smoother bowl, leave the apple chunks out and stir in 1/2 cup of applesauce.",
    ],
    parts: [
      {
        title: "Turkey sausage, 8 patties",
        ingredients: [
          "1 lb plain ground turkey",
          "1 tbsp maple syrup",
          "1 tsp dried sage",
          "1/2 tsp dried thyme",
          "3/4 tsp salt",
          "1/4 tsp black pepper",
          "1/4 tsp garlic powder",
          "Pinch of nutmeg",
          "1 tbsp vegetable oil, for the pan",
        ],
        steps: [
          "Mix everything except the oil gently. Do not pack it.",
          "Shape 8 thin patties, about 3 inches across. Press a dimple in the center of each.",
          "Cook in the oil over medium heat, 3 to 4 minutes a side, to 165°F inside.",
        ],
      },
      {
        title: "Cinnamon apple oatmeal",
        ingredients: [
          "2 cups old-fashioned rolled oats",
          "2 cups oat milk and 1 1/2 cups water",
          "1 apple, peeled and diced small",
          "1 tsp cinnamon",
          "2 tbsp maple syrup",
          "Pinch of salt",
          "Toppings: raisins, sunflower seeds, hemp hearts, or more apple",
        ],
        steps: [
          "Simmer the oat milk, water, apple, cinnamon, and salt.",
          "Stir in the oats and cook over medium-low heat for 5 minutes, until creamy.",
          "Stir in the maple syrup and add toppings.",
        ],
      },
    ],
  },
  {
    id: "spinach-wraps",
    meal: "Lunch",
    name: "Spinach hummus veggie wraps",
    summary:
      "A spinach hummus with no tahini, so sesame stays out, rolled with vegetables and optional turkey.",
    serves: "4 wraps, about 1 1/2 cups of hummus",
    book: {
      title: "The Kid-Friendly ADHD & Autism Cookbook",
      where: "Spinach hummus, adapted there from Lisa Barnes",
    },
    glutenFree: "Use gluten-free tortillas, or rice crackers.",
    notes: [
      "Check the tortillas for milk.",
      "Deli turkey can contain dairy or be sliced on shared equipment. Use a brand labeled free of milk, or roast the turkey yourself.",
      "A picky plate works too: hummus in the middle, each food in its own spot.",
    ],
    parts: [
      {
        title: "Spinach hummus, about 1 1/2 cups",
        ingredients: [
          "1 can (15 oz) chickpeas, drained and rinsed",
          "1 clove garlic",
          "1 cup packed fresh spinach",
          "1 tbsp fresh lemon juice",
          "1/2 tsp ground cumin",
          "1 tsp kosher salt",
          "1/2 tsp black pepper",
          "1/4 cup extra virgin olive oil",
        ],
        steps: [
          "In a blender or food processor, puree the chickpeas and garlic until smooth.",
          "Add the spinach, lemon juice, cumin, salt, and pepper. Blend thoroughly.",
          "With the motor running, pour in the olive oil and process until smooth. Taste and adjust seasoning.",
        ],
      },
      {
        title: "Build the wraps",
        ingredients: [
          "4 large flour tortillas",
          "1 cup shredded carrots",
          "1 cucumber, cut in thin sticks",
          "1 red bell pepper, sliced",
          "Optional: 8 oz sliced roasted turkey breast",
        ],
        steps: [
          "Spread about 3 tablespoons of hummus on each tortilla, leaving an inch at the edge.",
          "Line the vegetables and turkey down the middle.",
          "Fold in the sides, roll tight, and cut in half.",
          "Extra hummus, pretzels, and apple slices or grapes go on the side.",
        ],
      },
    ],
  },
  {
    id: "sunflower-bowls",
    meal: "Lunch",
    name: "Sunflower noodle bowls",
    summary:
      "Rice noodles with cabbage, carrot, and edamame or leftover turkey, coated in a sunflower seed butter sauce.",
    serves: "4 people, about 20 minutes",
    book: {
      title: "The Kid-Friendly ADHD & Autism Cookbook",
      where: "Thai peanut sauce, made with sunflower seed butter and vegetable broth",
    },
    glutenFree: "Use rice noodles and gluten-free tamari.",
    notes: [
      "Good hot or cold. Cold leftovers pack for a lunchbox.",
      "Leave the cayenne out when heat is a problem.",
    ],
    parts: [
      {
        title: "Sunflower sauce, about 1 cup",
        ingredients: [
          "1/2 cup sunflower seed butter, smooth",
          "1/4 cup warm water",
          "2 tbsp lime juice",
          "1 tbsp brown sugar",
          "1 tbsp tamari or soy sauce",
          "1 small garlic clove, minced",
          "Pinch of cayenne, optional",
        ],
        steps: [
          "Whisk the sunflower seed butter and water together, then stir in everything else.",
          "Chill 20 minutes for a dip, or use right away for noodles.",
        ],
      },
      {
        title: "Bowls",
        ingredients: [
          "8 oz rice noodles or spaghetti",
          "1 tbsp vegetable oil",
          "2 cups shredded cabbage or coleslaw mix",
          "1 cup shredded carrots",
          "1 cup shelled edamame, or 2 cups leftover cooked turkey",
          "1/2 cup vegetable broth",
          "Toppings: cucumber, green onion, cilantro, lime",
        ],
        steps: [
          "Cook the noodles, drain, and rinse with warm water.",
          "Stir-fry the cabbage, carrots, and edamame or turkey in the oil for 3 to 4 minutes.",
          "Whisk the vegetable broth into the sauce to thin it. Toss the noodles with the sauce until coated and hot.",
          "Top with cucumber, green onion, cilantro, and lime.",
        ],
      },
    ],
  },
  {
    id: "turkey-meatloaf",
    meal: "Dinner",
    name: "Sweet and sour turkey meatloaf",
    summary:
      "Apricot jam and chili sauce hold a turkey loaf together, so it needs no egg. Potatoes and green beans roast beside it.",
    serves: "4 people, about 55 minutes",
    book: {
      title: "What's to Eat?",
      where: "Linda Marienhoff Coss, poultry chapter",
    },
    glutenFree:
      "Use certified gluten-free quick oats, or gluten-free breadcrumbs, in place of ordinary breadcrumbs.",
    notes: [
      "Breadcrumbs often contain milk or egg. Plain unsalted crackers, crushed fine, also work.",
      "Leftover slices make a next-day sandwich.",
    ],
    parts: [
      {
        title: "Meatloaf",
        ingredients: [
          "1/4 cup apricot jam",
          "1/4 cup bottled chili sauce (check the label)",
          "1/2 tsp bottled minced garlic",
          "1/2 cup fine dry breadcrumbs, free of milk, egg, and nuts (or 1/2 cup quick oats)",
          "1 tbsp dried onion flakes",
          "1 lb extra lean ground turkey",
        ],
        steps: [
          "Heat the oven to 350°F. Lightly grease an 8 x 8 inch baking dish with vegetable oil or dairy-free cooking spray.",
          "In a large bowl, mix the jam, chili sauce, and garlic. Stir in the breadcrumbs and onion flakes.",
          "Add the turkey and mix until well blended. Shape into a loaf in the dish.",
          "Bake uncovered 50 minutes, until it reaches 165°F in the center. Rest 5 minutes before slicing.",
        ],
      },
      {
        title: "Roasted potatoes and green beans",
        ingredients: [
          "1 1/2 lb baby potatoes, halved",
          "12 oz fresh green beans, trimmed",
          "3 tbsp olive oil, divided",
          "3/4 tsp salt, 1/2 tsp garlic powder, 1/4 tsp pepper",
        ],
        steps: [
          "Heat the oven to 350°F with the meatloaf.",
          "Toss the potatoes with 2 tablespoons of oil and half the seasoning. Roast 45 to 50 minutes, stirring once.",
          "When 20 minutes remain, toss the beans with the rest of the oil and seasoning and add them to the pan.",
        ],
      },
    ],
  },
  {
    id: "honey-garlic-salmon",
    meal: "Dinner",
    name: "Honey garlic salmon with broccoli and rice",
    summary:
      "One pan, and a break from turkey. Salmon is not on this menu's avoid list.",
    serves: "4 people, about 30 minutes",
    glutenFree: "Use gluten-free tamari in the glaze.",
    notes: [
      "If someone is trying salmon for the first time, start with a small portion.",
      "Turkey breast tenderloin can take the same glaze: roast 25 to 30 minutes, to 165°F.",
      "For a plain plate, set one fillet aside before it is glazed.",
    ],
    parts: [
      {
        title: "Sheet pan",
        ingredients: [
          "4 salmon fillets, about 5 oz each",
          "4 cups broccoli florets",
          "2 tbsp olive oil, divided",
          "1/2 tsp salt, divided",
          "1 1/2 cups long-grain white or brown rice",
          "Glaze: 3 tbsp honey, 2 tbsp tamari or soy sauce, 1 tbsp lemon juice, 2 minced garlic cloves",
        ],
        steps: [
          "Start the rice. Heat the oven to 400°F and line a sheet pan.",
          "Toss the broccoli with 1 tablespoon of oil and 1/4 teaspoon of salt. Roast 10 minutes.",
          "Whisk the glaze and set aside 2 tablespoons for the table.",
          "Pat the salmon dry, brush with the rest of the oil, salt it, and spoon on the glaze.",
          "Roast 12 to 15 minutes, until it flakes and reads 145°F. Serve over rice with the reserved glaze.",
        ],
      },
    ],
  },
  {
    id: "chocolate-cake",
    meal: "Birthday",
    name: "Chocolate layer cake",
    summary:
      "Vinegar and baking soda do the rising, so the cake needs no eggs and no milk. The frosting uses a dairy-free buttery stick.",
    serves: "One 9-inch double layer, 12 to 16 slices",
    book: {
      title: "What's to Eat?",
      where: "Linda Marienhoff Coss, pages 147 and 148",
    },
    glutenFree:
      "Use a gluten-free flour blend that contains xanthan or guar, and add the extra leavening the cookbook's baking notes call for.",
    notes: [
      "The same batter makes 24 cupcakes, or a 9 by 13 sheet cake that can be frosted in the pan.",
      "Decorate with dairy-free chocolate chips, blueberries, and raspberries. No strawberries.",
      "Check candles, sprinkles, and store-bought decorations. Pink and red pieces can be strawberry flavored, and candy melts often contain milk.",
    ],
    parts: [
      {
        title: "Cake",
        ingredients: [
          "3 cups all-purpose flour",
          "2 cups sugar",
          "1/2 cup dairy-free 100% cocoa powder",
          "2 tsp baking soda",
          "1 tsp salt",
          "2 cups water",
          "2/3 cup vegetable oil",
          "2 tbsp distilled white vinegar",
          "2 tsp vanilla extract",
        ],
        steps: [
          "Heat the oven to 350°F. Grease two 9-inch round pans with 100% vegetable shortening, then dust with flour.",
          "In a large bowl, combine the flour, sugar, cocoa, baking soda, and salt.",
          "Add the water, oil, vinegar, and vanilla. Beat with a spoon or whisk just until smooth and blended.",
          "Pour into the pans. Bake 35 minutes, or until a toothpick in the center comes out clean.",
          "Cool in the pans 10 minutes, then turn out onto wire racks and cool completely before frosting.",
        ],
      },
      {
        title: "Chocolate frosting, about 2 1/2 cups",
        ingredients: [
          "1/2 cup (1 stick) dairy-free buttery stick, at room temperature",
          "2 1/2 tbsp honey",
          "1 tsp vanilla extract",
          "1/2 cup dairy-free 100% cocoa powder",
          "2 1/2 tbsp water",
          "2 1/2 cups powdered sugar",
          "Dairy-free chocolate chips for decorating",
        ],
        steps: [
          "Put the buttery stick, honey, and vanilla in a mixing bowl. Sift in the cocoa.",
          "Beat on low speed until creamed together.",
          "Add the water and sift in the powdered sugar. Beat on medium speed until smooth.",
          "Place one layer upside down on a serving plate. Spread frosting over the top.",
          "Set the second layer on top, right side up. Frost the top and sides.",
          "Press chocolate chips around the bottom edge or scatter them on top. Add blueberries and raspberries for color.",
        ],
      },
    ],
  },
];

export const SHOPPING = [
  {
    group: "Protein",
    items: [
      "2 lb plain ground turkey, 1 lb of it extra lean",
      "4 salmon fillets, about 1 1/4 lb",
      "1 bag frozen shelled edamame, or 8 oz roasted turkey breast",
      "1 can chickpeas, 15 oz",
    ],
  },
  {
    group: "Produce",
    items: [
      "Blueberries, raspberries, apples, bananas, grapes",
      "Spinach, broccoli, green beans, cabbage or coleslaw mix",
      "Carrots, cucumbers, a red bell pepper, green onions, cilantro",
      "Baby potatoes, garlic, lemons, limes",
    ],
  },
  {
    group: "Pantry and the dairy-free aisle",
    items: [
      "Flour or a gluten-free blend, sugar, cocoa, oats, rice, noodles, tortillas",
      "Sunflower seed butter, apricot jam, honey, maple syrup, chili sauce",
      "Tamari, white vinegar, vegetable broth, oils",
      "Oat, soy, or rice milk, and a dairy-free buttery stick",
      "Dairy-free chocolate chips from a nut-free facility",
    ],
  },
] as const;

export function dishById(id: string) {
  return DISHES.find((dish) => dish.id === id);
}

const MENU_COVERED = new Set([
  "milk",
  "peanut",
  "peanuts",
  "tree nut",
  "tree nuts",
  "egg",
  "eggs",
  "beef",
  "chicken",
  "pork",
  "strawberry",
  "strawberries",
]);

/** Dishes written to leave these allergens out. An allergen outside that list returns none. */
export function dishesAvoiding(allergens: string[]): MenuDish[] {
  if (allergens.length === 0) return [];
  if (!allergens.every((name) => MENU_COVERED.has(name.toLowerCase()))) return [];
  return DISHES;
}

export const COOKBOOKS = [
  {
    id: "whats-to-eat",
    title: "What's to Eat? The Milk-Free, Egg-Free, Nut-Free Food Allergy Cookbook",
    by: "Linda Marienhoff Coss",
    note: "The blueberry pancakes, turkey meatloaf, and chocolate cake in this menu come from this book.",
  },
  {
    id: "adhd-autism",
    title:
      "The Kid-Friendly ADHD & Autism Cookbook, 3rd Edition: The Ultimate Guide to the Most Effective Diets — What They Are, Why They Work, How to Do Them",
    by: "",
    note: "The spinach hummus, the peanut-sauce pattern behind the sunflower bowls, and the gluten-free baking notes come from this book.",
  },
  {
    id: "neurodivergent",
    title:
      "The Neurodivergent Cookbook: Easy Sensory-Friendly Meals Designed for Picky Eaters, ARFID, OCD, ADHD, and Autistic Children and Adults",
    by: "",
    note: "A third cookbook for sensory-friendly meals. It is not the source of this week's menu.",
  },
] as const;
