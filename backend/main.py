import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import copy
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

id1 = str(uuid4())
id2 = str(uuid4())
id3 = str(uuid4())
id4 = str(uuid4())
id5 = str(uuid4())
id6 = str(uuid4())

ingredients_db = {
    id1: Ingredient(id= id1, name="Beef Mince", unit="g"),
    id2: Ingredient(id= id2, name="Chopped Tomatoes", unit="g"),
    id3: Ingredient(id= id3, name="Onion"),
    id4: Ingredient(id= id4, name="Flour", unit="g"),
    id5: Ingredient(id= id5, name="Apple"),
    id6: Ingredient(id= id6, name="Sugar", unit="g")
}

id7 = str(uuid4())
id8 = str(uuid4())

recipe_db = {
    id7:  Recipe(id= id7, name="Bolognese", ingredients=[
            copy.copy(ingredients_db[id1]),
            copy.copy(ingredients_db[id2]),
            copy.copy(ingredients_db[id3])
]),
    id8:  Recipe(id= id8, name="Apple Pie", ingredients=[
            copy.copy(ingredients_db[id4]),
            copy.copy(ingredients_db[id5]),
            copy.copy(ingredients_db[id6])
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
def delete_ingredient(recipe_id: str, ingredient: Ingredient):
    recipe = recipe_db.get(recipe_id)
    recipe.ingredients = [ing for ing in recipe.ingredients if ing.id != ingredient.id]

@app.post("/recipes/new")
def new_recipe():
    new_id = str(uuid4())
    recipe_db[new_id] = Recipe(id=new_id, name="", ingredients =[])

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

@app.post("/recipes/{recipe_id}/delete")
def delete_recipe(recipe_id: str):
    del recipe_db[recipe_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)