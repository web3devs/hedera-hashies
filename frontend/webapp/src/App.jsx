import { useState } from 'react';
import './App.scss';
import AddEventPage from './pages/AddEvent.page';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <AddEventPage />
    </div>
  );
}

export default App;
