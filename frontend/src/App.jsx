import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css';
import RecipeList from './components/RecipeList';
import ShoppingList from './components/ShoppingList';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {

  const [recipes, setRecipes] = useState({});
  const [addedRecipes, setAddedRecipes] = useState([]);

  return (
    <Router>
      <header className="text-center">
        <h1 className="mb-4">What's for dinner?</h1>
      </header>
      <main className="flex justify-center">
        <Routes>
          <Route 
            path="/" 
            element={
              <RecipeList 
                recipes={recipes}
                setRecipes={setRecipes}
                addedRecipes={addedRecipes}
                setAddedRecipes={setAddedRecipes}
              />
            }
          />
          <Route 
            path="/shopping-list" 
            element={
              <ShoppingList
                recipes={recipes}
                addedRecipes={addedRecipes}
              />
            } 
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;