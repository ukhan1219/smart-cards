import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './components/Home';
import Upload from './components/Upload';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" Component={Home} />
        <Route exact path="/upload" Component={Upload} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
