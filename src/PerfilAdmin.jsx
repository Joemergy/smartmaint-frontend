import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { useAuth } from './hooks/useAuth';
import { getStoredUserProfile, saveStoredUserProfile } from './profileStorage';
import './Panel.css';
import './PerfilAdmin.css';

const PerfilAdmin = () => {
  const navigate = useNavigate();
  const { session, role, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [admin, setAdmin] = useState({
    idUsuario: '',
    nombreCompleto: '',
    correo: '',
    idColaborador: '',
    cargo: '',
    rol: 'Administrador',
    fotoPerfil: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({ actual: '', nueva: '', confirmacion: '' });

  useEffect(() => {
    const storedProfile = getStoredUserProfile({ correo: session?.correo, idUsuario: session?.idUsuario });
    const datosBase = {
      idUsuario: session?.idUsuario || '',
      nombreCompleto: storedProfile?.nombreCompleto || session?.nombre || session?.correo?.split('@')[0] || 'Administrador SmartMaint',
      correo: storedProfile?.correo || session?.correo || 'admin@empresa.com',
      idColaborador: session?.idColaborador || storedProfile?.idColaborador || 'ADM-001',
      cargo: session?.cargo || storedProfile?.cargo || '',
      rol: role === 'SUPERADMIN' ? 'Superadministrador' : 'Administrador',
      fotoPerfil: storedProfile?.fotoPerfil || '',
    };
    setAdmin(datosBase);
  }, [role, session]);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleFotoPerfil = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const previewUrl = URL.createObjectURL(archivo);
    setAdmin((prev) => ({ ...prev, fotoPerfil: previewUrl }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveStoredUserProfile(admin);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.nueva !== passwordData.confirmacion) return;
    setPasswordData({ actual: '', nueva: '', confirmacion: '' });
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      <div className="admin-body">
        <Sidebar
          visible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          onLogout={handleLogout}
        />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="perfil-admin-container">
            <section className="perfil-hero perfil-hero-admin">
              <div>
                <p className="perfil-kicker">Perfil administrativo</p>
                <h1>Actualiza o verifica los datos de tu cuenta.</h1>
                <p className="perfil-copy">Los cambios que guardes aquí se reflejan en tu sesión activa y en la trazabilidad del sistema.</p>
              </div>
            </section>

            <div className="perfil-grid">
            <Card className="perfil-card perfil-form-shell">
              <form onSubmit={handleSubmit} className="perfil-form">
                <div className="foto-perfil-box">
                  <input
                    id="fotoPerfilAdmin"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoPerfil}
                    style={{ display: 'none' }}
                  />
                  <div
                    className="foto-preview foto-preview-clickable"
                    onClick={() => document.getElementById('fotoPerfilAdmin').click()}
                    title="Cambiar foto de perfil"
                  >
                    {admin.fotoPerfil ? (
                      <img src={admin.fotoPerfil} alt="Foto de perfil" />
                    ) : (
                      <span>Sin foto</span>
                    )}
                    <div className="foto-overlay"></div>
                  </div>
                </div>

                <label htmlFor="nombreCompleto">Nombre completo</label>
                <input
                  id="nombreCompleto"
                  type="text"
                  name="nombreCompleto"
                  value={admin.nombreCompleto}
                  onChange={handleChange}
                />

                <label htmlFor="correo">Correo electronico</label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  value={admin.correo}
                  onChange={handleChange}
                />

                <label htmlFor="idColaborador">Id de Colaborador</label>
                <input
                  id="idColaborador"
                  type="text"
                  name="idColaborador"
                  value={admin.idColaborador}
                  readOnly
                  style={{ background: '#f5f7fa', cursor: 'not-allowed', color: '#555' }}
                />

                <label htmlFor="cargo">Cargo en la empresa</label>
                <input
                  id="cargo"
                  type="text"
                  name="cargo"
                  value={admin.cargo}
                  readOnly
                  style={{ background: '#f5f7fa', cursor: 'not-allowed', color: '#555' }}
                />

                <label htmlFor="rol">Rol dentro del sistema</label>
                <input id="rol" type="text" value={admin.rol} readOnly />

                <Button type="submit" style={{ marginTop: '1.5rem' }}>Guardar cambios de perfil</Button>
              </form>
            </Card>

            <div className="perfil-side-stack">
              <Card className="perfil-card" style={{ paddingTop: '2.5rem' }}>
                <form onSubmit={handlePasswordSubmit} className="perfil-form password-form">
                  <h2 style={{ marginBottom: '1.5rem' }}>Actualizar contraseña</h2>

                  <label htmlFor="actualAdmin">Contraseña actual</label>
                  <input id="actualAdmin" type="password" name="actual" value={passwordData.actual} onChange={handlePasswordChange} />

                  <label htmlFor="nuevaAdmin">Nueva contraseña</label>
                  <input id="nuevaAdmin" type="password" name="nueva" value={passwordData.nueva} onChange={handlePasswordChange} />

                  <label htmlFor="confirmacionAdmin">Confirmar nueva contraseña</label>
                  <input id="confirmacionAdmin" type="password" name="confirmacion" value={passwordData.confirmacion} onChange={handlePasswordChange} />

                  <Button type="submit" variant="secondary" style={{ marginTop: '1.5rem' }}>Actualizar contraseña</Button>
                </form>
              </Card>
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    {showSuccess && (
      <div className="perfil-success-overlay" onClick={() => setShowSuccess(false)}>
        <div className="perfil-success-modal" onClick={(e) => e.stopPropagation()}>
          <p className="perfil-success-texto">¡Cambios guardados con éxito!</p>
          <div className="perfil-success-circulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0b4f99" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PerfilAdmin;
