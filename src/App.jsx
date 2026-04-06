import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { loadThemeFromStorage, loadLanguageFromStorage } from './services/themeService';
import LoadingScreen from './components/ui/LoadingScreen';
import RutaProtegida from './RutaProtegida';

const Layout = lazy(() => import('./Layout'));
const LandingPage = lazy(() => import('./LandingPage'));
const Login = lazy(() => import('./Login'));
const RecuperarContrasena = lazy(() => import('./RecuperarContrasena'));
const Planes = lazy(() => import('./Planes'));
const ConfirmacionCompra = lazy(() => import('./ConfirmacionCompra'));
const Demo = lazy(() => import('./Demo'));
const RegistroConfirmado = lazy(() => import('./RegistroConfirmado'));
const ActivarCuenta = lazy(() => import('./ActivarCuenta'));
const TareasAsignadasAdmin = lazy(() => import('./TareasAsignadasAdmin'));
const UsuarioPanel = lazy(() => import('./UsuarioPanel'));
const CrearTarea = lazy(() => import('./CrearTarea'));
const DashboardTareas = lazy(() => import('./DashboardTareas'));
const HistorialTareasAdmin = lazy(() => import('./HistorialTareasAdmin'));
const HistorialTareasUsuario = lazy(() => import('./HistorialTareasUsuario'));
const PerfilAdmin = lazy(() => import('./PerfilAdmin'));
const PerfilUsuario = lazy(() => import('./PerfilUsuario'));
const AjustesAdmin = lazy(() => import('./AjustesAdmin'));
const AjustesUsuario = lazy(() => import('./AjustesUsuario'));
const RoleRedirect = lazy(() => import('./RoleRedirect'));
const CrearUsuarioAdmin = lazy(() => import('./CrearUsuarioAdmin'));
const CambioContrasenaInicial = lazy(() => import('./CambioContrasenaInicial'));
const EliminarUsuarioAdmin = lazy(() => import('./EliminarUsuarioAdmin'));
const ExportarEliminarTareasAdmin = lazy(() => import('./ExportarEliminarTareasAdmin'));
const ExportarEliminarTareasUsuario = lazy(() => import('./ExportarEliminarTareasUsuario'));
const DashboardUsuario = lazy(() => import('./DashboardUsuario'));

function App() {
  useEffect(() => {
    // Cargar tema e idioma guardados al iniciar la aplicación
    loadThemeFromStorage();
    loadLanguageFromStorage();
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/cambiar-contrasena-inicial" element={<CambioContrasenaInicial />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/confirmacion-compra" element={<ConfirmacionCompra />} />
            <Route path="/registro-confirmado" element={<RegistroConfirmado />} />
            <Route path="/activar-cuenta" element={<ActivarCuenta />} />

            <Route path="/admin" element={<RutaProtegida rolRequerido="ADMIN"><Navigate to="/dashboard-tareas" replace /></RutaProtegida>} />
            <Route path="/super-admin" element={<RutaProtegida rolRequerido="SUPERADMIN"><Navigate to="/dashboard-tareas" replace /></RutaProtegida>} />
            <Route path="/crear-tarea" element={<RutaProtegida rolRequerido="ADMIN"><CrearTarea /></RutaProtegida>} />
            <Route path="/crear-usuario" element={<RutaProtegida rolRequerido="ADMIN"><CrearUsuarioAdmin /></RutaProtegida>} />
            <Route path="/eliminar-usuario" element={<RutaProtegida rolRequerido="ADMIN"><EliminarUsuarioAdmin /></RutaProtegida>} />
            <Route path="/tareas-asignadas" element={<RutaProtegida rolRequerido="ADMIN"><TareasAsignadasAdmin /></RutaProtegida>} />
            <Route path="/dashboard-tareas" element={<RutaProtegida rolRequerido="ADMIN"><DashboardTareas /></RutaProtegida>} />
            <Route path="/ajustes" element={<RoleRedirect target="ajustes" />} />
            <Route path="/perfil" element={<RoleRedirect target="perfil" />} />
            <Route path="/historial-tareas-admin" element={<RutaProtegida rolRequerido="ADMIN"><HistorialTareasAdmin /></RutaProtegida>} />
            <Route path="/exportar-eliminar-tareas-admin" element={<RutaProtegida rolRequerido="ADMIN"><ExportarEliminarTareasAdmin /></RutaProtegida>} />
            <Route path="/perfil-admin" element={<RutaProtegida rolRequerido="ADMIN"><PerfilAdmin /></RutaProtegida>} />
            <Route path="/ajustes-admin" element={<RutaProtegida rolRequerido="ADMIN"><AjustesAdmin /></RutaProtegida>} />

            <Route path="/usuario" element={<RutaProtegida rolRequerido="USUARIO"><Navigate to="/dashboard-usuario" replace /></RutaProtegida>} />
            <Route path="/dashboard-usuario" element={<RutaProtegida rolRequerido="USUARIO"><DashboardUsuario /></RutaProtegida>} />
            <Route path="/mis-tareas" element={<RutaProtegida rolRequerido="USUARIO"><UsuarioPanel /></RutaProtegida>} />
            <Route path="/historial-tareas-usuario" element={<RutaProtegida rolRequerido="USUARIO"><HistorialTareasUsuario /></RutaProtegida>} />
            <Route path="/exportar-eliminar-tareas-usuario" element={<RutaProtegida rolRequerido="USUARIO"><ExportarEliminarTareasUsuario /></RutaProtegida>} />
            <Route path="/perfil-usuario" element={<RutaProtegida rolRequerido="USUARIO"><PerfilUsuario /></RutaProtegida>} />
            <Route path="/ajustes-usuario" element={<RutaProtegida rolRequerido="USUARIO"><AjustesUsuario /></RutaProtegida>} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;