import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import Navbar from './components/Navbar';
import RegisterPage from './views/RegisterPage';
import ListaMascotas from './components/ListaMascotas';



function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mascotas" element={<ListaMascotas />} /> 
        </Routes>
      </BrowserRouter>
  );
}



export default App;