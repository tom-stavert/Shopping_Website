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

  const newRecipe = async() => {
    try{
      await api.post(`recipes/new`);
      fetchRecipe();
      editRecipeToggle(recipes.length, "")
    } catch (error) {
      console.error("Error creating recipe", error);
    }
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
    // If the recipe hasn't been saved, delete it
    if (recipe.name == '') {
      deleteRecipe(recipe.id)
    }
    editRecipeToggle(false, "");
    fetchRecipe();
  }

  const handleDeleteRecipe = async(recipeId) => {
    deleteRecipe(recipeId);
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
          {ToggleEditRecipe === recipeId && (
          <div className="">
            <input
              type="text"
              className="form-control"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Recipe Name"
              id="recipeNameInput"
            />
            <label htmlFor="recipeNameInput">Recipe Name</label>            
          </div>
            )}
          {ToggleEditRecipe !== recipeId && (
          <h3 className="text-center mb-4">{ recipe.name }</h3>
          )}
            <table className="table table-sm">
              <tbody>
              {recipe.ingredients.map((ingredient, ingredientId) => (
                <tr key={ingredientId}>
                  <td>{ingredient.name}</td>
                  <td className="text-end">{ingredient.quantity}</td>
                  <td className="text-start"> {ingredient.unit} </td>
                  {ToggleEditRecipe === recipeId && (
                  <td>
                    <button onClick={() => handleDeleteIngredient(ingredient, ingredientId, recipe.id)} type="button" className="btn btn-danger">Delete</button>
                  </td>
                  )}
                </tr>
                ))}
                {ToggleEditRecipe === recipeId && (             
                  pendingIngredients.map((ingredient, pendingIngredientId) => (
                  <tr key={pendingIngredientId}>
                    <td>{ingredient.name}</td>
                    <td className="text-end">{ingredient.quantity}{ingredient.unit}</td>
                    {ToggleEditRecipe === recipeId && (
                    <td>
                      <button onClick={() => handleDeleteIngredient(ingredient, pendingIngredientId)} type="button" className="btn btn-danger">Delete</button>
                    </td>
                    )}
                  </tr>
                  )))}
              </tbody>
            </table>
            {ToggleEditRecipe === recipeId && (
            <table>
              <tbody>
                <tr>
                  <td>
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        value={newIngredient.name}
                        onChange={(e) => 
                          setNewIngredient((prev) => ({...prev, name:e.target.value}))
                        }
                        placeholder="Ingredient"
                        id="ingredientNameInput"
                        autoComplete="off"
                      />
                      <label htmlFor="ingredientNameInput">Ingredient</label>
                    </div>
                  </td>
                  <td>
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        value={newIngredient.quantity}
                        onChange={(e) => 
                          setNewIngredient((prev) => ({...prev, quantity:e.target.value}))
                        }
                        placeholder="Quantity"
                        id="ingredientQuantityInput"
                        autoComplete="off"
                      />
                      <label htmlFor="ingredientQuantityInput">Quantity</label>
                    </div>
                  </td>
                  <td>
                    <div className="form-floating">
                      <input
                      type="text"
                      className="form-control"
                        value={newIngredient.unit}
                        onChange={(e) => 
                          setNewIngredient((prev) => ({...prev, unit:e.target.value}))
                        }
                      placeholder="Unit"
                      id="ingredientUnitInput"
                      autoComplete="off"
                      />
                      <label htmlFor="ingredientUnitInput">Unit</label>
                    </div>
                  </td>
                  <td>
                    <button type="button" onClick={addPendingIngredients} className="btn">Add Ingredient</button>
                  </td>
                </tr>
              </tbody>
            </table>
            )}
              {ToggleEditRecipe === recipeId && (     
                <div className="d-flex justify-content-between" role="group">      
                  <button onClick={() => handleCancelRecipeEdit(recipe)} type="submit" className="btn btn-secondary">Cancel</button>
                  <button onClick={() => handleRecipeSave(recipe, recipeId, pendingIngredients)} type="submit" className="btn btn-success">Save Changes</button>
                  <button onClick={() => handleDeleteRecipe(recipe.id)} type="submit" className="btn btn-danger">Delete Recipe</button>
                </div>
              )}
              {ToggleEditRecipe !== recipeId && (
              <div className="d-flex justify-content-between" role="group">
                  <button onClick={() => editRecipeToggle(recipeId, recipe.name)} type="button" className="btn btn-secondary p-2">
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
        <button onClick= {() => newRecipe()} className="btn btn-primary"> Add new recipe </button>
      </div>
    </div>
  );
};

export default RecipeList;