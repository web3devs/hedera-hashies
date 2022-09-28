import { useState } from 'react';
import './App.scss';
import AddEventPage from './pages/AddEvent.page';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';
import HomePage from './pages/Home.page';
import NavBar from './componeont/NavBar';
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/add-event',
    element: <AddEventPage />
  }
]);
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <NavBar />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
