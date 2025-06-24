import React, { useEffect, useState } from 'react';
import api from '../api';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'

const AddIngredient = ({newIngredient, setNewIngredient, addPendingIngredients}) => {

  const [ingredientsList, setIngredientsList] = useState([]);

  const fetchIngredientsList = async() => {
    try {
      const response = await api.post('/ingredients-list/');
      setIngredientsList(response.data)
    } catch (error) {
      console.error("Error fetching ingredients list", error);
    }
  };

  const handleOnSearch = (string, results) => {
  // onSearch will have as the first callback parameter
  // the string searched and for the second the results.
  setNewIngredient((prev) => ({...prev, name:string}))
  }

  const handleOnSelect = (item) => {
  // the item selected
  setNewIngredient((prev) => ({...prev, name:item.name}))
  }

  useEffect(() => {
    fetchIngredientsList();
  }, []);

  return (
  <div className="grid grid-rows-2 gap-2 mt-2">
    <div className="row-span-full">
      <ReactSearchAutocomplete
        id="ingredientNameInput"
        items={ingredientsList}
        value={newIngredient.name}
        onSearch={handleOnSearch}
        onSelect={handleOnSelect}
        showIcon={false}
        placeholder="Ingredient"
      />
    </div>
    <div className="flex gap-2">
      <div className="">
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
      </div>
      <div>
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
      </div>
      <div>
        <button type="button" onClick={addPendingIngredients} className="btn btn-primary w-12 h-12 flex-none">
        <img
              src="plus_icon.svg"
              alt="Add Ingredient"
        />
        </button>
      </div>
    </div>
  </div>
  );
};

export default AddIngredient