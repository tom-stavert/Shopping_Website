import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import copy

class Ingredient(BaseModel):
    id: int
    name: str 
    quantity:Optional[int] = None
    unit: Optional[str] = None

class Recipe(BaseModel):
    id: int
    name: str
    ingredients: List[Ingredient]

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

ingredients_db = {
    1: Ingredient(id= 1, name="Beef Mince", unit="g"),
    2: Ingredient(id= 2, name="Chopped Tomatoes", unit="g"),
    3: Ingredient(id= 3, name="Onion"),
    4: Ingredient(id= 4, name="Flour", unit="g"),
    5: Ingredient(id= 5, name="Apple"),
    6: Ingredient(id= 6, name="Sugar", unit="g")
}

recipe_db = {
    1:  Recipe(id= 1, name="Bolognese", ingredients=[
            copy.copy(ingredients_db[1]),
            copy.copy(ingredients_db[2]),
            copy.copy(ingredients_db[3])
]),
    2:  Recipe(id= 2, name="Apple Pie", ingredients=[
            copy.copy(ingredients_db[4]),
            copy.copy(ingredients_db[5]),
            copy.copy(ingredients_db[6])
])
}

quantities = [[500, 400, 1],[400, 10, 300]]

for i, recipe in enumerate(recipe_db.values()):
    for j, ingredient in enumerate(recipe.ingredients):
        ingredient.quantity=quantities[i][j]

@app.get("/recipe")
def get_ingredients():
    return recipe_db

@app.post("/recipes/{recipe_id}/deleteingredient")
def delete_ingredient(recipe_id: int, ingredient: Ingredient):
    recipe = recipe_db.get(recipe_id)
    recipe.ingredients = [ing for ing in recipe.ingredients if ing.id != ingredient.id]

@app.post("/recipes/new")
def new_recipe():
    new_id = len(recipe_db)+1
    recipe_db[new_id] = Recipe(id=new_id, name="", ingredients =[])

@app.post("/recipes/{recipe_id}/update")
def update_recipe(recipe_id: int, recipe: Recipe):
    for ing in recipe.ingredients:
        if ing.id == 0:
            ing.id = len(ingredients_db)+1
            new_ingredient = copy.copy(ing)
            new_ingredient.quantity=None # remove quantity from ingredient (set to default None)
            ingredients_db[len(ingredients_db)+1] = new_ingredient

    recipe_db[recipe_id] = recipe

@app.post("/recipes/{recipe_id}/delete")
def delete_recipe(recipe_id: int):
    del recipe_db[recipe_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)