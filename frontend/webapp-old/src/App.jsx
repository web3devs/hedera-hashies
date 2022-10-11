import React, { useState } from 'react';
import './App.scss';
import AddEventPage from './pages/AddEvent.page';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';
import HomePage from './pages/Home.page';
import NavBar from './componeont/NavBar';
import ConfirmationPage from './pages/Confirmation.page';
import { HederaProvider } from './context/HederaProvider';
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/add-event',
    element: <AddEventPage />
  },
  {
    path: '/confirmation/:code',
    element: <ConfirmationPage />
  }
]);
function App() {
  return (
    <div className="App bg">
      <HederaProvider>
        <NavBar />
        <RouterProvider router={router} />
      </HederaProvider>
    </div>
  );
}

export default App;
