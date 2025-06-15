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

recipe_db, ingredients_db = read_db()

@app.get("/recipe")
def get_ingredients():
    return recipe_db

@app.post("/recipes/{recipe_id}/deleteingredient")
def delete_ingredient(recipe_id: str, ingredient: Ingredient):
    recipe = recipe_db.get(recipe_id)
    recipe.ingredients = [ing for ing in recipe.ingredients if ing.id != ingredient.id]
    write_db()

@app.post("/recipes/new")
def new_recipe():
    new_id = str(uuid4())
    recipe_db[new_id] = Recipe(id=new_id, name="", ingredients =[])
    write_db()

@app.post("/recipes/{recipe_id}/update")
def update_recipe(recipe_id: str, recipe: Recipe):
    for ing in recipe.ingredients:
        # If new ingredient, add it to the ingredients database (need to add logic to check for duplicate ingredients here)
        if ing.id == '':
            new_id = str(uuid4())
            ing.id = new_id
            new_ingredient = copy.copy(ing)
            new_ingredient.quantity=None # remove quantity from ingredient being copied to db (set to default None)
            ingredients_db[new_id] = new_ingredient

    recipe_db[recipe_id] = recipe
    write_db()

@app.post("/recipes/{recipe_id}/delete")
def delete_recipe(recipe_id: str):
    del recipe_db[recipe_id]
    write_db()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)