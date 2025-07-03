import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import api from '../api';
import AddIngredient from './AddIngredient';

const RecipeList = ({recipes, setRecipes, addedRecipes, setAddedRecipes}) => {
  
  const emptyIngredient = {
    id: 0,
    name: '',
    quantity: 0,
    unit: ''
  };

  const emptyRecipe = {
    id: 0,
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
    if (newIngredient.name && newIngredient.quantity > 0) {
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
    if (ingredient.id === 0) {   
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
    recipes[''] = {...newRecipe, id:0}
    editRecipeToggle(0, "");
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
      editRecipeToggle(recipe.id, recipe.name);
    }
  }

  const handleCancelRecipeEdit = (recipe) => {
    editRecipeToggle(false, "");
    fetchRecipe();
  }

  const handleDeleteRecipe = async(recipeId) => {
    if (recipeId !== 0) {
      try {
        await deleteRecipe(recipeId);
      }
      catch (error) {
        console.error("Error deleting recipe", error);
      }     
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
          <Link to="/shopping-list">
            <button type="button" to="/shopping-list" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Create shopping list!</button>
          </Link>
        </div>
      )}
      {Object.values(recipes).map((recipe, recipeId) => (
      <div className="border rounded p-4 m-4 " key={recipeId}>
          {ToggleEditRecipe === recipe.id && (
          <div className="flex flex-row">
            <input
              type="text"
              className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Recipe Name"
              id="recipeNameInput"
              autoComplete='off'
            />         
          </div>
            )}
          {ToggleEditRecipe !== recipe.id && (
          <h3 className="text-center mb-4 text-2xl font-bold dark:text-white">{ recipe.name }</h3>
          )}
          <div className="flex-1">           
            {recipe.ingredients.map((ingredient, ingredientId) => (
              <div className="flex flex-row items-center p-2 border-bottom border-gray-300" key={ingredientId}>
                <span className="grow">{ingredient.name}</span>
                <span className="text-end">{ingredient.quantity}</span>
                <span className="text-start"> {ingredient.unit} </span>
                {ToggleEditRecipe === recipe.id && (
                  <button onClick={() => handleDeleteIngredient(ingredient, ingredientId, recipe.id)} type="button" className="delete-icon m-2 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                    <img
                      src="delete_icon.svg"
                      alt="Delete Ingredient"
                      height="40px"
                      width="40px"
                    />
                  </button>
                )}
              </div>
              ))}
            {ToggleEditRecipe === recipe.id && (             
              pendingIngredients.map((ingredient, pendingIngredientId) => (
                <div className="flex flex-row items-center p-2 border-bottom border-gray-300" key={pendingIngredientId}>
                  <span className="grow">{ingredient.name}</span>
                  <span className="text-end">{ingredient.quantity}</span>
                  <span className="text-start"> {ingredient.unit} </span>
                  {ToggleEditRecipe === recipe.id && (
                    <button onClick={() => handleDeleteIngredient(ingredient, pendingIngredientId)} type="button" className="delete-icon m-2 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                      <img
                        src="delete_icon.svg"
                        alt="Delete Ingredient"
                        height="40px"
                        width="40px"
                    />
                    </button>
                  )}
                </div>
              )))}
          </div>
            {ToggleEditRecipe === recipe.id && (
            <AddIngredient
              newIngredient={newIngredient}
              setNewIngredient={setNewIngredient}
              addPendingIngredients={addPendingIngredients}
            />
            )}
              {ToggleEditRecipe === recipe.id && (     
                <div className="flex justify-between mt-2" role="group">
                  <div>      
                    <button onClick={() => handleCancelRecipeEdit(recipe)} type="submit" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Cancel</button>
                  </div>
                  <div>
                    <button onClick={() => handleRecipeSave(recipe, recipeId, pendingIngredients)} type="submit" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Save Changes</button>
                  </div>
                  <div>
                    <button onClick={() => handleDeleteRecipe(recipe.id)} type="submit" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Delete Recipe</button>
                  </div>
                </div>
              )}
              {ToggleEditRecipe !== recipe.id && (
              <div className="flex justify-between mt-2" role="group">
                <div>
                  <button onClick={() => editRecipeToggle(recipe.id, recipe.name)} type="button" className="button-icon text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                    <img
                      src="edit_icon.svg"
                      alt="Edit Recipe"
                      height="40px"
                      width="40px"
                    />
                  </button>
                </div>
                  {!addedRecipes.includes(recipe.id) && (
                  <div>
                    <button onClick={() => updateShoppingList(recipe.id)} type="button" className="button-icon text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                      <img
                        src="plus_icon.svg"
                        alt="Add Recipe to Shopping List"
                        height="40px"
                        width="40px"
                      />
                    </button>
                  </div>
                  )}
                  {addedRecipes.includes(recipe.id) && (
                  <div>
                    <button onClick={() => updateShoppingList(recipe.id)} type="button" className="button-icon focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                      <img
                        src="tick_icon.svg"
                        alt="Remove Recipe from Shopping List"
                        height="20px"
                        width="40px"
                      />
                    </button>
                  </div>
                  )}
              </div>
              )}
      </div>
      ))}
      <div className="text-center mb-4">
        <button onClick= {() => newRecipe(recipes)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Add new recipe </button>
      </div>
    </div>
  );
};

export default RecipeList;