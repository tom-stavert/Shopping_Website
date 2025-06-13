import React from 'react';
import './App.css';
import RecipeList from './components/Recipe';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <div>
      <header>
        <h1>Create Shopping List</h1>
      </header>
      <main>
        <RecipeList />
      </main>
    </div>
  );
};

export default App;