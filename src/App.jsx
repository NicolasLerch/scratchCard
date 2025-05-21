import ScratchCardsPage from './ScratchCards/ScratchCards';
import { Routes, Route } from 'react-router-dom';
import FormPage from './FormPage/FormPage';

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<ScratchCardsPage />} />
      <Route path="/form" element={<FormPage />} />
    </Routes>
  );
  
}

export default App;