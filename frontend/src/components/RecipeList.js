import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import api from '../api';

const RecipeList = ({recipes, setRecipes, addedRecipes, setAddedRecipes}) => {
  
  const emptyIngredient = {
    id: '',
    name: '',
    quantity: 0,
    unit: ''
  };

  const emptyRecipe = {
    id: '',
    name: '',
    ingredients: []
  }

  const [ToggleEditRecipe, setToggleEditRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [pendingIngredients, setPendingIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({...emptyIngredient});

  const fetchRecipe = async () => {
    try {
      const response = await api.get('/recipe');
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching ingredients", error);
    }
  };

  const addPendingIngredients = () => {
    if (newIngredient.name) {
      setPendingIngredients([...pendingIngredients, newIngredient]);
      setNewIngredient({...emptyIngredient})
    }
  }

  const editRecipeToggle = (id, name) => {
    setToggleEditRecipe(prev => (prev === id ? null: id));
    setRecipeName(name);
    setPendingIngredients([]);
  };

  const handleDeleteIngredient = (ingredient, ingredientId, recipeId) => {
    // If the deleted ingredient was a pending ingredient, remove it
    if (ingredient.id === '') {   
      setPendingIngredients(prev => prev.filter((_, i) => i !== ingredientId));
    }
    // If ingredient was in recipe already, set to delete on save and remove locally
    else {
      setRecipes(prevRecipes => {
        const updatedIngredients = prevRecipes[recipeId].ingredients.filter((_, i) => i !== ingredientId);
        return {
          ...prevRecipes,
          [recipeId]: {
            ...prevRecipes[recipeId],
            ingredients: updatedIngredients
          }
        };
      });
    }
  };

  const newRecipe = (recipes) => {
    const newRecipe = emptyRecipe;
    recipes[''] = {...newRecipe, id:'new'}
    editRecipeToggle("new", "");
  }

  const handleRecipeSave = (recipe, recipeId, pendingIngredients) => {

    // If there are no ingredients, do nothing
    if (recipe.ingredients.length == 0 && pendingIngredients.length == 0) {
      return
    }
    // If there are pending ingredients, add to recipe
    else if (pendingIngredients.length != 0) {
      recipe.ingredients = [...recipe.ingredients, ...pendingIngredients];
      setPendingIngredients([])
    }

    // If the recipe has a name, update it, save recipe, and close edit window
    if (recipeName) {
      recipe.name = recipeName
      updateRecipe(recipe.id, recipe);
      editRecipeToggle(recipeId, recipe.name);
    }
  }

  const handleCancelRecipeEdit = (recipe) => {
    editRecipeToggle(false, "");
    fetchRecipe();
  }

  const handleDeleteRecipe = async(recipeId) => {
    if (recipeId !== "new") {
      deleteRecipe(recipeId);
    }
    editRecipeToggle(false, "");
    fetchRecipe();
  }

  const updateRecipe = async(recipeId, recipe) => {
    try{
      await api.post(`recipes/${recipeId}/update`, recipe);
      fetchRecipe();
    } catch (error) {
      console.error("Error updating recipe", error);
    }
  }

  const deleteRecipe = async(recipeId) => {
      try{
      await api.post(`recipes/${recipeId}/delete`);
    } catch (error) {
      console.error("Error deleting recipe", error);
    } 
  }

  const updateShoppingList = (recipeId) => {
    if (addedRecipes.includes(recipeId)) {
      setAddedRecipes(prev => prev.filter((i) => i !== recipeId))
    }
    else {
      setAddedRecipes([...addedRecipes, recipeId]);
    }
  }

  useEffect(() => {
    fetchRecipe();
  }, []);

  return (
    <div className="flex-1 items-center justify-center max-w-md h-screen">     
      {addedRecipes?.length > 0 && (
        <div className="text-center mb-4">
          <Link to="/shopping-list" className="btn btn-success justify-self-center">Create shopping list!</Link>
        </div>
      )}
      {Object.values(recipes).map((recipe, recipeId) => (
      <div className="border rounded p-4 m-4 " key={recipeId}>
          {ToggleEditRecipe === recipe.id && (
          <div className="flex flex-row">
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Recipe Name"
              id="recipeNameInput"
            />         
          </div>
            )}
          {ToggleEditRecipe !== recipe.id && (
          <h3 className="text-center mb-4">{ recipe.name }</h3>
          )}
          <div className="flex-1">           
            {recipe.ingredients.map((ingredient, ingredientId) => (
              <div className="flex flex-row items-center p-2 border-bottom border-gray-300" key={ingredientId}>
                <span className="grow">{ingredient.name}</span>
                <span className="text-end">{ingredient.quantity}</span>
                <span className="text-start"> {ingredient.unit} </span>
                {ToggleEditRecipe === recipe.id && (
                  <button onClick={() => handleDeleteIngredient(ingredient, ingredientId, recipe.id)} type="button" className="btn btn-danger m-2">Delete</button>
                )}
              </div>
              ))}
            {ToggleEditRecipe === recipe.id && (             
              pendingIngredients.map((ingredient, pendingIngredientId) => (
                <div className="flex flex-row items-center p-2 border-bottom border-gray-300">
                  <span className="grow">{ingredient.name}</span>
                  <span className="text-end">{ingredient.quantity}</span>
                  <span className="text-start"> {ingredient.unit} </span>
                  {ToggleEditRecipe === recipe.id && (
                    <button onClick={() => handleDeleteIngredient(ingredient, pendingIngredientId)} type="button" className="btn btn-danger m-2">Delete</button>
                  )}
                </div>
              )))}
          </div>
            {ToggleEditRecipe === recipe.id && (
            <div className="flex justify-between items-center">
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={newIngredient.name}
                  onChange={(e) => 
                    setNewIngredient((prev) => ({...prev, name:e.target.value}))
                  }
                  placeholder="Ingredient"
                  id="ingredientNameInput"
                  autoComplete="off"
                />
                <input
                  type="number"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={newIngredient.quantity}
                  onChange={(e) => 
                    setNewIngredient((prev) => ({...prev, quantity:e.target.value}))
                  }
                  placeholder="Quantity"
                  id="ingredientQuantityInput"
                  autoComplete="off"
                />
                <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={newIngredient.unit}
                  onChange={(e) => 
                    setNewIngredient((prev) => ({...prev, unit:e.target.value}))
                  }
                placeholder="Unit"
                id="ingredientUnitInput"
                autoComplete="off"
                />
              <button type="button" onClick={addPendingIngredients} className="btn btn-primary w-12 h-12 flex-none">
                <img
                  src="plus_icon.svg"
                  alt="Add Ingredient"
                />
              </button>
            </div>
            )}
              {ToggleEditRecipe === recipe.id && (     
                <div className="d-flex justify-content-between" role="group">      
                  <button onClick={() => handleCancelRecipeEdit(recipe)} type="submit" className="btn btn-secondary">Cancel</button>
                  <button onClick={() => handleRecipeSave(recipe, recipeId, pendingIngredients)} type="submit" className="btn btn-success">Save Changes</button>
                  <button onClick={() => handleDeleteRecipe(recipe.id)} type="submit" className="btn btn-danger">Delete Recipe</button>
                </div>
              )}
              {ToggleEditRecipe !== recipe.id && (
              <div className="flex justify-between mt-2" role="group">
                  <button onClick={() => editRecipeToggle(recipe.id, recipe.name)} type="button" className="btn btn-secondary p-2">
                    <img
                      src="edit_icon.svg"
                      alt="Edit Recipe"
                      height="20px"
                      width="40px"
                    />
                  </button>
                  {!addedRecipes.includes(recipe.id) && (
                  <button onClick={() => updateShoppingList(recipe.id)} type="button" className="btn btn-primary p-2">
                    <img
                      src="plus_icon.svg"
                      alt="Add Recipe to Shopping List"
                      height="20px"
                      width="40px"
                    />
                  </button>
                  )}
                  {addedRecipes.includes(recipe.id) && (
                  <button onClick={() => updateShoppingList(recipe.id)} type="button" className="btn btn-success p-2">
                    <img
                      src="tick_icon.svg"
                      alt="Remove Recipe from Shopping List"
                      height="20px"
                      width="40px"
                    />
                  </button>
                  )}
              </div>
              )}
      </div>
      ))}
      <div className="text-center mb-4">
        <button onClick= {() => newRecipe(recipes)} className="btn btn-primary"> Add new recipe </button>
      </div>
    </div>
  );
};

export default RecipeList;