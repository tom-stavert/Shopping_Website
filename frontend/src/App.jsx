import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css';
import RecipeList from './components/RecipeList';
import ShoppingList from './components/ShoppingList';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {

  const [recipes, setRecipes] = useState({});
  const [shoppingList, setShoppingList] = useState([]);

  return (
    <Router>
      <header>
        <h1>What's for dinner?</h1>
      </header>
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <RecipeList 
                recipes={recipes}
                setRecipes={setRecipes}
                shoppingList={shoppingList}
                setShoppingList={setShoppingList}
              />
            }
          />
          <Route 
            path="/shopping-list" 
            element={
              <ShoppingList
                recipes={recipes}
                shoppingList={shoppingList}
              />
            } 
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;