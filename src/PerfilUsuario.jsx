import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import UserSidebar from './UserSidebar';
import { getStoredUserProfile, saveStoredUserProfile } from './profileStorage';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './PerfilUsuario.css';

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const { session, role, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [usuario, setUsuario] = useState({
    idUsuario: '',
    nombreCompleto: '',
    correo: '',
    idColaborador: '',
    cargo: '',
    rol: 'Usuario',
    fotoPerfil: '',
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmacion: '',
  });
  useEffect(() => {
    const correo = session?.correo || 'usuario@empresa.com';
    const idUsuario = session?.idUsuario || '';
    const storedProfile = getStoredUserProfile({ correo, idUsuario });

    const baseProfile = {
      idUsuario,
      nombreCompleto: storedProfile?.nombreCompleto || correo.split('@')[0] || 'Usuario Smartmaint',
      correo: storedProfile?.correo || correo,
      idColaborador: session?.idColaborador || storedProfile?.idColaborador || '',
      cargo: session?.cargo || storedProfile?.cargo || '',
      rol: role || 'Usuario',
      fotoPerfil: storedProfile?.fotoPerfil || '',
    };

    setUsuario(baseProfile);
  }, [role, session]);

  const handleChange = (event) => {
    setUsuario((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFotoPerfil = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const previewUrl = URL.createObjectURL(archivo);
    setUsuario((prev) => ({ ...prev, fotoPerfil: previewUrl }));
  };

  const handlePasswordChange = (event) => {
    setPasswordData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveStoredUserProfile(usuario);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2500);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordData.actual || !passwordData.nueva || !passwordData.confirmacion) {
      alert('Completa todos los campos de contraseña.');
      return;
    }
    if (passwordData.nueva !== passwordData.confirmacion) {
      alert('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    setSaveMessage('Solicitud de cambio de contraseña registrada.');
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
        <UserSidebar visible={sidebarVisible} onLogout={handleLogout} onToggle={() => setSidebarVisible((prev) => !prev)} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="perfil-usuario-container">
            <section className="perfil-hero">
              <div>
                <p className="perfil-kicker">Perfil del usuario</p>
                <h1>Administra tu identidad, tus datos base y la seguridad de tu cuenta.</h1>
                <p className="perfil-copy">Mantén tu información operativa al día para que el historial, las notas y la trazabilidad reflejen un contexto real.</p>
              </div>
              {saveMessage && <div className="perfil-feedback">{saveMessage}</div>}
            </section>

            <div className="perfil-grid">
              <Card className="perfil-card perfil-card-form">
                <form onSubmit={handleSubmit} className="perfil-usuario-form">
                  <div className="foto-perfil-box">
                    <input
                      id="fotoPerfil"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoPerfil}
                      style={{ display: 'none' }}
                    />
                    <div
                      className="foto-preview foto-preview-clickable"
                      onClick={() => document.getElementById('fotoPerfil').click()}
                      title="Cambiar foto de perfil"
                    >
                      {usuario.fotoPerfil ? (
                        <img src={usuario.fotoPerfil} alt="Foto de perfil" />
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
                    value={usuario.nombreCompleto}
                    onChange={handleChange}
                  />

                  <label htmlFor="correo">Correo</label>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    value={usuario.correo}
                    onChange={handleChange}
                  />

                  <label htmlFor="idColaborador">Id de colaborador</label>
                  <input
                    id="idColaborador"
                    type="text"
                    name="idColaborador"
                    value={usuario.idColaborador}
                    readOnly
                    style={{ background: '#f5f7fa', cursor: 'not-allowed', color: '#555' }}
                  />

                  <label htmlFor="cargo">Cargo en la empresa</label>
                  <input
                    id="cargo"
                    type="text"
                    name="cargo"
                    value={usuario.cargo}
                    readOnly
                    style={{ background: '#f5f7fa', cursor: 'not-allowed', color: '#555' }}
                  />

                  <label htmlFor="rol">Rol dentro del sistema</label>
                  <input id="rol" type="text" value={usuario.rol} readOnly />

                  <Button type="submit" style={{ marginTop: '1.5rem' }}>Guardar cambios de perfil</Button>
                </form>
              </Card>

              <div className="perfil-side-stack">
                <Card className="perfil-card" style={{ paddingTop: '2.5rem' }}>
                  <form onSubmit={handlePasswordSubmit} className="perfil-usuario-form password-form">
                    <h2 style={{ marginBottom: '1.5rem' }}>Actualizar contraseña</h2>

                    <label htmlFor="actual">Contraseña actual</label>
                    <input id="actual" type="password" name="actual" value={passwordData.actual} onChange={handlePasswordChange} />

                    <label htmlFor="nueva">Nueva contraseña</label>
                    <input id="nueva" type="password" name="nueva" value={passwordData.nueva} onChange={handlePasswordChange} />

                    <label htmlFor="confirmacion">Confirmar nueva contraseña</label>
                    <input id="confirmacion" type="password" name="confirmacion" value={passwordData.confirmacion} onChange={handlePasswordChange} />

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

export default PerfilUsuario;
