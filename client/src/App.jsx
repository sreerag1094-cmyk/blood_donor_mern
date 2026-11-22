import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Donors from './pages/Donors'
import Auth from './pages/Auth'
import DonorDashboard from './pages/DonorDashboard'
import DonorProfile from './pages/DonorProfile'
import AdminDashboard from './pages/AdminDashboard'
import OrganDonation from './pages/OrganDonation'
import AIChatbot from './components/AIChatbot'
import { useApp } from './context/AppContext'

function Guard({ role, children }) { 
    const { user } = useApp(); 
    if (!user) {
      return <Navigate to={role === 'admin' ? '/admin-login' : '/login'} replace />;
    }
    if (role && user.role !== role) return <Navigate to="/" replace />; 
    return children }

    export default function App() { 
        return <>
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organ-donation" element={<OrganDonation />} />
            <Route path="/donors" element={<Donors />} />
            <Route path="/donors/:id" element={<DonorProfile />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/admin-login" element={<Auth mode="admin" />} />
            <Route path="/admin/login" element={<Auth mode="admin" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/donor" element={<Guard role="donor"><DonorDashboard /></Guard>} />
            <Route path="/admin" element={<Guard role="admin"><AdminDashboard /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AIChatbot />
            </> 
            }
