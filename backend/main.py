import uvicorn, copy, csv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from uuid import uuid4
from sqlmodel import Field, Session , SQLModel, create_engine, select, ForeignKey, Relationship, Table, Column

class IngredientRecipeLink(SQLModel, table=True):
    ingredient_id: int | None = Field(default=None, foreign_key="ingredientdb.id", primary_key=True)
    recipe_id: int | None = Field(default=None, foreign_key="recipedb.id", primary_key=True)

    quantity: float | None = Field(default=None)
    unit: str | None = Field(default=None)

    ingredient: "IngredientDB" = Relationship(back_populates="recipe_links")
    recipe: "RecipeDB" = Relationship(back_populates="ingredient_links")

class RecipeDB(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field()
    ingredient_links: list[IngredientRecipeLink] = Relationship(back_populates="recipe")

class IngredientDB(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    recipe_links: list[IngredientRecipeLink] = Relationship(back_populates="ingredient")

class Ingredient(BaseModel):
    id: int
    name: str 
    quantity:Optional[float] = None
    unit: Optional[str] = None

class Recipe(BaseModel):
    id: int
    name: str
    ingredients: List[Ingredient]

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def read_db():
    with Session(engine) as session:
        statement = select(RecipeDB, IngredientDB, IngredientRecipeLink).join(RecipeDB).join(IngredientDB)
        results = session.exec(statement)
        recipe_db = {}
        ingredients_db = {}
        for ing in results:
            new_ingredient = Ingredient(id=ing.IngredientDB.id,
                                        name=ing.IngredientDB.name,
                                        quantity=ing.IngredientRecipeLink.quantity,
                                        unit=ing.IngredientRecipeLink.unit
                                        )
            if ing.RecipeDB.id not in recipe_db:
                recipe_db[ing.RecipeDB.id] = Recipe(id=ing.RecipeDB.id,                                                
                                                  name=ing.RecipeDB.name, 
                                                  ingredients=[new_ingredient])
            else:
                recipe_db[ing.RecipeDB.id].ingredients.append(new_ingredient)

            if ing.IngredientDB.id not in ingredients_db:
                ingredients_db[ing.IngredientDB.id] = Ingredient(id=ing.IngredientDB.id, name=ing.IngredientDB.name)
    return recipe_db, ingredients_db

def write_db(recipe):
    with Session(engine) as session:

        if recipe.id == 0:
            cur_recipe = RecipeDB(name=recipe.name)  #Create new recipe DB object if required
            session.add(cur_recipe)
        else:
            statement = select(RecipeDB).where(RecipeDB.id == recipe.id)
            results = session.exec(statement).all()
            cur_recipe = results[0]

        ing_map = set()
        for i in recipe.ingredients:
            ing_map.add(i.id)

        for ing in recipe.ingredients:
            statement = select(IngredientDB).where(IngredientDB.name == ing.name)
            results = session.exec(statement).all()
            if len(results) == 0:
                new_ingredient = IngredientDB(name=ing.name)
                session.add(new_ingredient)  
                ingredient_recipe_link = IngredientRecipeLink(recipe=cur_recipe, ingredient=new_ingredient, quantity=ing.quantity, unit=ing.unit)
                session.add(ingredient_recipe_link)
            elif ing.id not in ing_map:
                ingredient_recipe_link = IngredientRecipeLink(recipe=cur_recipe, ingredient=new_ingredient, quantity=ing.quantity, unit=ing.unit)
                session.add(ingredient_recipe_link)
            
        session.commit()

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

def clean_shopping_list(recipe_ids):
    shopping_list = {}
    for id in recipe_ids:
        recipe = recipe_db[id]
        ingredients = recipe.ingredients
        for ing in ingredients:
            if ing.id not in shopping_list:
                shopping_list[ing.id] = copy.copy(ing)
            elif ing.unit == shopping_list[ing.id].unit:
                shopping_list[ing.id].quantity += ing.quantity
    return shopping_list

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
    recipe_db, _ = read_db()
    return recipe_db

# Update an existing recipe given its ID and a recipe object (passed from frontend)
@app.post("/recipes/{recipe_id}/update")
def update_recipe(recipe_id: str, recipe: Recipe):
    write_db(recipe)
    recipe_db, ingredients_db = read_db()

#Delete an existing recipe by its ID
@app.post("/recipes/{recipe_id}/delete")
def delete_recipe(recipe_id: str):
    del recipe_db[recipe_id]

@app.post("/create-shopping-list/", response_model=Dict[str, Ingredient])
def create_shopping_list(added_recipes: List[str]):
    shopping_list = clean_shopping_list(added_recipes)
    return shopping_list

@app.post("/ingredients-list/", response_model=List[Ingredient])
def ingredients_list():
    return ingredients_db.values()

if __name__ == "__main__":
    create_db_and_tables()
    recipe_db, ingredients_db = read_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)