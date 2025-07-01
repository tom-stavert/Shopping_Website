--@block
CREATE TABLE ingredients (
    IngredientID INT PRIMARY KEY AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    
);

--@block
CREATE TABLE recipes (
    RecipeID  INT PRIMARY KEY AUTO_INCREMENT,
    Name varchar(255) NOT NULL
);

--@block
CREATE TABLE IngredientsRecipes (
    IngredientRecipeID INT NOT NULL AUTO_INCREMENT,
    IngredientID INT NOT NULL,
    RecipeID INT NOT NULL,
    Quantity FLOAT,
    Unit varchar(255),
    PRIMARY KEY (IngredientRecipeID),
    FOREIGN KEY (RecipeID) REFERENCES recipes(RecipeID),
    FOREIGN KEY (IngredientID) REFERENCES ingredients(IngredientID)
);

--@block
INSERT INTO recipes (Name)
VALUES 
("Spaghetti Bolognese"),
("Apple Pie");

--@block
INSERT INTO ingredients (Name)
VALUES
("Beef Mince"),
("Onion"),
("Chopped Tomatoes"),
("Flour"),
("Sugar"),
("Apple");

--@block
INSERT INTO IngredientsRecipes (IngredientID, RecipeID, Quantity, Unit)
VALUES
(1,1,500, 'g'),
(2,1, 1, NULL),
(3,1, 400, 'g'),
(4,2, 350, 'g'),
(5,2, 190, 'g'),
(6,2, 1, 'kg');

--@block
SELECT RecipeID 
FROM recipes
WHERE Name = "Spaghetti Bolognese";

--@block
SELECT IngredientID
FROM ingredients
WHERE 
Name = "Beef Mince" OR 
Name = "Onion" OR 
Name = "Chopped Tomatoes";

--@block
SELECT *
FROM recipes INNER JOIN ingredients
ON recipes.recipe_id = ingredients.ingredient_id;

--@block
SELECT 
    r.Name AS Recipe,
    i.Name AS Ingredient,
    ir.Quantity,
    ir.Unit
FROM IngredientsRecipes ir
JOIN recipes r ON ir.RecipeID = r.RecipeID
JOIN ingredients i ON ir.IngredientID = i.IngredientID;