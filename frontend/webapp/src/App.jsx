import React from 'react'
import './App.scss'
import AddEventPage from './pages/AddEvent.page'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/Home.page'
import NavBar from './components/NavBar'
import ConfirmationPage from './pages/EventDetails.page'
import MintPage from './pages/Mint.page'
import { HederaAPIProvider } from './context/HederaAPIProvider'
import AuroraProvider from './context/AuroraProvider'

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
    path: '/event/:code/:collectionId',
    element: <ConfirmationPage />
  },
  {
    path: '/mint/:code/:collectionId',
    element: <MintPage />
  }
])
const App = () => {
  return (
    <div className="App bg">
      <AuroraProvider>
        <HederaAPIProvider>
          <NavBar />
          <RouterProvider router={router} />
        </HederaAPIProvider>
      </AuroraProvider>
    </div>
  )
}

export default App
