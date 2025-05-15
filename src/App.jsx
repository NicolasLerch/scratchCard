import ScratchCardsPage from './ScratchCards/ScratchCards';
import { Routes, Route } from 'react-router-dom';
import FormPage from './FormPage/FormPage';

function App() {
  
  return (
    <Routes>
      <Route path="/game" element={<ScratchCardsPage />} />
      <Route path="/" element={<FormPage />} />
    </Routes>
  );
  
}

export default App;