import { authenticate, saveSession } from '../auth/auth.js';

// Inicializa el formulario de login y maneja el submit
export function initLogin(onSuccess) {
  document.getElementById('btn-login').addEventListener('click', handleLogin);

  // También con Enter
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');

    const user = authenticate(email, pass);

    if (!user) {
      errEl.style.display = 'block'; // mostrar mensaje de error
      return;
    }

    errEl.style.display = 'none';
    saveSession(user);   // persistir en localStorage
    onSuccess(user);
  }
}
