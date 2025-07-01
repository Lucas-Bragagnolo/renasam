
  // Extraer el id_token desde la URL (sea en query o en hash)
  function getTokenFromURL() {
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    const queryParams = new URLSearchParams(window.location.search);

    return hashParams.get("id_token") || queryParams.get("id_token");
  }

  const idToken = getTokenFromURL();

  if (idToken) {
    const payload = JSON.parse(atob(idToken.split('.')[1]));

    // Guardar datos en sessionStorage
    sessionStorage.setItem('user', JSON.stringify({
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: payload.token
    }));

    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Mostrar datos del usuario
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user) {
    document.getElementById('user-picture').src = user.picture;
    document.getElementById('user-picture2').src = user.picture;
    document.getElementById('foto-perfil').src = user.picture;
  }
