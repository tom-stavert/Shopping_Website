import React, { useState } from 'react';

const AddIngredientForm = ({ addIngredient, recipeId }) => {
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (ingredientName) {
      addIngredient(ingredientName, ingredientQuantity, ingredientUnit, recipeId);
      setIngredientName('');
      setIngredientQuantity('');
      setIngredientUnit('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <tr>
            <td>
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  placeholder="Ingredient"
                  id="ingredientNameInput"
                />
                <label htmlFor="ingredientNameInput">Ingredient</label>
              </div>
            </td>
            <td>
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  placeholder="Quantity"
                  id="ingredientQuantityInput"
                />
                <label htmlFor="ingredientQuantityInput">Quantity</label>
              </div>
            </td>
            <td>
              <div className="form-floating">
                <input
                type="text"
                className="form-control"
                value={ingredientUnit}
                onChange={(e) => setIngredientUnit(e.target.value)}
                placeholder="Unit"
                id="ingredientUnitInput"
                />
                <label htmlFor="ingredientUnitInput">Unit</label>
              </div>
            </td>
            <td>
              <button type="submit" className="btn">Add Ingredient</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
};

export default AddIngredientForm;