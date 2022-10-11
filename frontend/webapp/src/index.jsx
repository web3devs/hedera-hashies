import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css';
import './theme.css';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
