import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RankingsPage from './pages/RankingsPage.jsx';
import BuscarPage from './pages/BuscarPage.jsx';
import StudentGrades from './pages/StudentGrades.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

export default function App() {
  return (
    <DataProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/buscar" element={<BuscarPage />} />
            <Route path="/student/:codigo" element={<StudentGrades />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </DataProvider>
  );
}
