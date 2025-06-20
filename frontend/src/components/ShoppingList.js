import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ShoppingList = ({addedRecipes}) => {
  
  const [shoppingList, setShoppingList] = useState([]);

  const fetchShoppingList = async(addedRecipes) => {
    try {
      const response = await api.post('/create-shopping-list/', addedRecipes);
      setShoppingList(response.data)
    } catch (error) {
      console.error("Error creating shopping list", error);
    }
  };

  useEffect(() => {
    fetchShoppingList(addedRecipes);
  }, [addedRecipes]);

  return(
    <div className="flex-1 items-center justify-center max-w-md h-screen">
      <div className="border rounded p-4">
        <h3 className="text-center mb-4">Shopping List</h3>
          <ul className="list-none p-0">
            {Object.values(shoppingList)?.map((ingredient, ingredientId) => (
              <li key={ingredientId}>
                <div className="basis-full border-bottom border-gray-300 m-2 p-2 text-lg">
                  <input className="form-check-input m-2" type="checkbox" value="" id={ingredientId}></input>
                  <span> {`${ingredient.name} `} </span>
                  <span className='float-right'> {`(${ingredient.quantity} ${ingredient.unit})`} </span>
                </div>
              </li>
            ))
            }
          </ul>
      <div className="row">
      <Link to="/" className="btn btn-primary">Back</Link>
      </div>
    </div>
  </div>
  );
};

export default ShoppingList;
