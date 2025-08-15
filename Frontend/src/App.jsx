import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import Navbar from './components/Navbar';
import RegisterPage from './views/RegisterPage';
import DashboardCuidador from "./views/Cuidador/DashboardCuidador";
import PerfilCuidador from "./views/Cuidador/PerfilCuidador";
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
          <Route path="/dashboard-cuidador" element={<DashboardCuidador />} />
          <Route path="/perfil-cuidador" element={<PerfilCuidador />} />
        </Routes>
      </BrowserRouter>
  );
}



export default App;