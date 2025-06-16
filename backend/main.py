import uvicorn, copy, csv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4

class Ingredient(BaseModel):
    id: str
    name: str 
    quantity:Optional[int] = None
    unit: Optional[str] = None

class Recipe(BaseModel):
    id: str
    name: str
    ingredients: List[Ingredient]

# Writing to db when new recipes are made, recipes are deleted, or recipes are updated
def write_db():
    with open("recipes.csv", mode='w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["recipe_id", "recipe_name"])
        for recipe in recipe_db.values():
            writer.writerow([recipe.id, recipe.name])

    with open("ingredients.csv", mode='w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["recipe_id", "ingredient_id", "ingredient_name", "quantity", "unit"])
        for recipe in recipe_db.values():
            for ingredient in recipe.ingredients:
                writer.writerow([
                    recipe.id,
                    ingredient.id,
                    ingredient.name,
                    ingredient.quantity,
                    ingredient.unit
                ])

# Read csv files to populate recipe_db and ingredients_db when backend server is started
def read_db():
    with open("recipes.csv", mode='r') as csvfile:
        recipe_db = {}
        reader = csv.DictReader(csvfile)
        for row in reader:
            recipe_id = row['recipe_id']
            recipe_db[recipe_id] = Recipe(id=recipe_id, 
                                          name=row['recipe_name'], 
                                          ingredients=[])
    with open("ingredients.csv", mode='r') as csvfile:
        ingredients_db = {}
        reader = csv.DictReader(csvfile)
        for row in reader:
            ingredient_id = row["ingredient_id"]
            ingredient = Ingredient(
                id=ingredient_id,
                name=row["ingredient_name"],
                quantity=float(row["quantity"]),
                unit=row["unit"]
            )
            ingredients_db[ingredient_id] = ingredient
            recipe_id = row["recipe_id"]
            if recipe_id in recipe_db:
                recipe_db[recipe_id].ingredients.append(ingredient)
            else:
                print(f"Warning: recipe_id {recipe_id} not found in recipe_db.")
    
    return recipe_db, ingredients_db

# Updates the ingredients database to add new ingredients from a list, and if the ingredients are already in the database, updates their ID to match
def update_ingredients_db(ingredients_list):
    for n, ing in enumerate(ingredients_list):    # For each ingredient in the new recipe
        if ing.id == '':    # If new ingredient
            for i, db_ing in enumerate(list(ingredients_db.values())):
                if db_ing.name == ing.name:     # If ingredient with same name exists in the database
                    ingredients_list[n].id = db_ing.id      # Update id of ingredient to match database  value
                    break
                elif i == len(ingredients_db)-1:    # Else, if the end of the ingredients database is reached and no match has been found
                    new_id = str(uuid4())
                    ingredients_list[n].id = new_id
                    new_ingredient = copy.copy(ing)
                    new_ingredient.quantity=None # remove quantity from ingredient being copied to db (set to default None)
                    ingredients_db[new_id] = new_ingredient
    return ingredients_list

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get list of recipes
@app.get("/recipe")
def get_ingredients():
    return recipe_db

# Add a new (empty) recipe to the database
@app.post("/recipes/new")
def new_recipe():
    new_id = str(uuid4())
    recipe_db[new_id] = Recipe(id=new_id, name="", ingredients =[])
    write_db()

# Update an existing recipe given its ID and a recipe object (passed from frontend)
@app.post("/recipes/{recipe_id}/update")
def update_recipe(recipe_id: str, recipe: Recipe):
    recipe.ingredients = update_ingredients_db(recipe.ingredients)
    recipe_db[recipe_id] = recipe
    write_db()

#Delete an existing recipe by its ID
@app.post("/recipes/{recipe_id}/delete")
def delete_recipe(recipe_id: str):
    del recipe_db[recipe_id]
    write_db()

if __name__ == "__main__":
    recipe_db, ingredients_db = read_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)