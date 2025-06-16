import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ShoppingList = ({recipes, addedRecipes}) => {
  
  const [shoppingList, setShoppingList] = useState([]);

  const fetchShoppingList = (recipes, addedRecipes) => {
    const newItems = addedRecipes.flatMap(
      id => recipes[id]?.ingredients || []
      );

    setShoppingList(newItems)
  }

  useEffect(() => {
    fetchShoppingList(recipes, addedRecipes);
  }, [recipes, addedRecipes]);

  return(
    <div className="card border-primary">
      <div className="card-body">
        <h5 className="card-title text-center">Shopping List</h5>
          <table className="table table-sm">
            <tbody>
              {shoppingList?.map((ingredient, ingredientId) => (
                <tr key={ingredientId}>
                  <td>{ingredient.name}</td>
                  <td className="text-end">{ingredient.quantity}</td>
                  <td className="text-start"> {ingredient.unit} </td>
                  <td>
                    <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                  </td>
                </tr>
              ))
              }
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default ShoppingList;
