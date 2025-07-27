import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import Navbar from './components/Navbar';
import RegisterPage from './views/RegisterPage';



function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
  );
}



export default App;