export const USER_PROFILE_STORAGE_KEY = 'smartmaint_user_profiles';

export const getStoredUserProfile = (sessionData = {}) => {
  const correo = String(sessionData?.correo || localStorage.getItem('correoUsuario') || '').toLowerCase();
  const idUsuario = String(sessionData?.idUsuario || localStorage.getItem('idUsuario') || '');

  if (!correo && !idUsuario) return null;

  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    const profiles = raw ? JSON.parse(raw) : [];
    return profiles.find((profile) => {
      const sameCorreo = String(profile.correo || '').toLowerCase() === correo;
      const sameId = idUsuario && String(profile.idUsuario || '') === String(idUsuario);
      return sameCorreo || sameId;
    }) || null;
  } catch (error) {
    console.error('No se pudo leer el perfil almacenado:', error);
    return null;
  }
};

export const saveStoredUserProfile = (profileData) => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    const profiles = raw ? JSON.parse(raw) : [];
    const correo = String(profileData.correo || '').toLowerCase();
    const idUsuario = String(profileData.idUsuario || '');

    const updated = profiles.map((profile) => {
      const sameCorreo = String(profile.correo || '').toLowerCase() === correo;
      const sameId = idUsuario && String(profile.idUsuario || '') === idUsuario;
      return sameCorreo || sameId ? { ...profile, ...profileData } : profile;
    });

    const exists = updated.some((profile) => {
      const sameCorreo = String(profile.correo || '').toLowerCase() === correo;
      const sameId = idUsuario && String(profile.idUsuario || '') === idUsuario;
      return sameCorreo || sameId;
    });

    const nextProfiles = exists ? updated : [...updated, profileData];
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfiles));
  } catch (error) {
    console.error('No se pudo guardar el perfil almacenado:', error);
  }
};
