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
    name: str = Field()
    recipe_links: list[IngredientRecipeLink] = Relationship(back_populates="ingredient")

sqlite_file_name = "test.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def main():
    create_db_and_tables()

    with Session(bind=engine) as session:

        statement = select(RecipeDB).where(RecipeDB.name == "Bolognese")
        results = session.exec(statement).one()
        print(results)

        # recipe1 = RecipeDB(name="Bolognese")
        # recipe2 = RecipeDB(name="Burgers")

        # ingredient1 = IngredientDB(name="Beef Mince")
        # ingredient2 = IngredientDB(name="Chopped Tomatoes")
        # ingredient3 = IngredientDB(name="Burger Bun")

        # link1 = IngredientRecipeLink(
        #     recipe=recipe1,
        #     ingredient=ingredient1,
        #     quantity=500,
        #     unit="g")
        
        # link2 = IngredientRecipeLink(
        #     recipe=recipe1,
        #     ingredient=ingredient2,
        #     quantity=400,
        #     unit="g"
        # )

        # link3 = IngredientRecipeLink(
        #     recipe=recipe2,
        #     ingredient=ingredient1,
        #     quantity=250,
        #     unit="g"
        # )

        # link4 = IngredientRecipeLink(
        #     recipe=recipe2,
        #     ingredient=ingredient3,
        #     quantity=2
        # )

        # session.add_all([recipe1, recipe2, ingredient1, ingredient2, ingredient3, link1, link2, link3, link4])
        # session.commit()

if __name__ == "__main__":
    main()