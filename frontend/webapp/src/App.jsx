import React from 'react'
import './App.scss'
import AddEventPage from './pages/AddEvent.page'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/Home.page'
import NavBar from './components/NavBar'
import ConfirmationPage from './pages/EventDetails.page'
import MintPage from './pages/Mint.page'
// import TestPage from './pages/Test.page'
import { HederaAPIProvider } from './context/HederaAPIProvider'
import HashiesProvider from './context/HashiesProvider'
import ListPage from './pages/ListPage'

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
  },
  {
    path: '/list',
    element: <ListPage />
  }
  // {
  //   path: '/test',
  //   element: <TestPage />
  // }
])
const App = () => {
  return (
    <div className="App bg">
      <HashiesProvider>
        <HederaAPIProvider>
          <NavBar />
          <RouterProvider router={router} />
        </HederaAPIProvider>
      </HashiesProvider>
    </div>
  )
}

export default App
