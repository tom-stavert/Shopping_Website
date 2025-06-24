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
        <h3 className="text-center mb-4 text-4xl font-bold dark:text-white">Shopping List</h3>
        <ul className="list-none p-0 divide-y divide-gray-400">
          {Object.values(shoppingList)?.map((ingredient, ingredientId) => (
            <li key={ingredientId} className="">
              <div className="flex flex-row justify-between items-center m-2 p-2 text-lg">
                <input className="strikethrough m-2 w-8 h-8 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" type="checkbox" value="" id={ingredientId}></input>
                <span> {`${ingredient.name} `} </span>
                <span> {`(${ingredient.quantity} ${ingredient.unit})`} </span>
              </div>
            </li>
          ))
          }
        </ul>
      </div>
      <div className="flex items-center justify-center  m-4"> 
        <Link to="/" className="btn btn-primary">
          <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Back </button>
        </Link>
      </div>
    </div>
  );
};

export default ShoppingList;
