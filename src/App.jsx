import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './components/Home';
import Upload from './components/Upload';
import Items from './components/Items';
import Insights from './components/Insights'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" Component={Home} />
        <Route exact path="/upload" Component={Upload} />
        <Route exact path="/items" Component={Items} />
        <Route exact path="/insights" Component={Insights} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
