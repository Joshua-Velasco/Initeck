import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import BaseServiceManager from './pages/BaseServiceManager';
import Finanzas from './pages/Finanzas';
import ModuleManagement from './pages/ModuleManagement';
import Login from './pages/Login';
import Inventario from './pages/Inventario';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper to handle dynamic service routes
const DynamicServiceWrapper = () => {
  const { slug } = useParams();
  
  if (!slug) return null;

  const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ') + ' TV';
  return <BaseServiceManager serviceType={slug.toUpperCase()} serviceName={name} />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Dynamic route for any service module */}
          <Route path="service/:slug" element={<DynamicServiceWrapper />} />
          
          {/* Backwards compatibility for existing links if any */}
          <Route path="elite-tv" element={<Navigate to="/service/elite" replace />} />
          <Route path="future-tv" element={<Navigate to="/service/future" replace />} />
          
          <Route path="finanzas" element={<Finanzas />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="configuracion" element={<ModuleManagement />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
