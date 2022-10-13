import React from 'react'
import './App.scss'
import AddEventPage from './pages/AddEvent.page'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/Home.page'
import NavBar from './components/NavBar'
import ConfirmationPage from './pages/EventDetails.page'
import MintPage from './pages/Mint.page'
import { HederaProvider } from './context/HederaProvider'
import { HederaAPIProvider } from './context/HederaAPIProvider'

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
    path: '/event/:code',
    element: <ConfirmationPage />
  },
  {
    path: '/mint/:code',
    element: <MintPage />
  }
])
const App = () => {
  return (
    <div className="App bg">
      <HederaAPIProvider>
        <HederaProvider>
          <NavBar />
          <RouterProvider router={router} />
        </HederaProvider>
      </HederaAPIProvider>
    </div>
  )
}

export default App
