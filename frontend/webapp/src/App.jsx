import { useState } from 'react';
import './App.scss';
import AddEventPage from './pages/AddEvent.page';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';
import HomePage from './pages/Home.page';
import NavBar from './componeont/NavBar';
import ConfirmationPage from './pages/Confirmation.page';
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
      <NavBar />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
