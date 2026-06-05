// src/views/login.js
import { loginUser } from "../services/api.js";
import { saveSession } from "../services/auth.js";
import { navigate } from "../utils/router.js";
import { showToast } from "../utils/toast.js";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-card">

        <!-- Yeti animado -->
        <div class="yeti-stage" id="yetiStage">
          <svg class="yeti-svg" width="160" height="160" viewBox="0 0 160 160">
            <!-- Body -->
            <ellipse cx="80" cy="130" rx="38" ry="28" fill="#dde8f5"/>
            <ellipse cx="80" cy="130" rx="38" ry="10" fill="#c8d8ee"/>
            <!-- Head -->
            <circle cx="80" cy="72" r="44" fill="#eef3fb"/>
            <!-- Fur bumps -->
            <ellipse cx="56" cy="34" rx="10" ry="7" fill="#dde8f5"/>
            <ellipse cx="80" cy="30" rx="10" ry="7" fill="#dde8f5"/>
            <ellipse cx="104" cy="34" rx="10" ry="7" fill="#dde8f5"/>
            <!-- Ears -->
            <ellipse cx="36" cy="72" rx="10" ry="13" fill="#d2e0f3"/>
            <ellipse cx="124" cy="72" rx="10" ry="13" fill="#d2e0f3"/>
            <ellipse cx="36" cy="72" rx="5" ry="8" fill="#b8c8e8"/>
            <ellipse cx="124" cy="72" rx="5" ry="8" fill="#b8c8e8"/>
            <!-- Eyes white -->
            <ellipse cx="62" cy="70" rx="14" ry="13" fill="white"/>
            <ellipse cx="98" cy="70" rx="14" ry="13" fill="white"/>
            <!-- Pupils -->
            <g id="yeti-pupils">
              <circle cx="62" cy="71" r="7" fill="#2a2a3a"/>
              <circle cx="98" cy="71" r="7" fill="#2a2a3a"/>
              <circle cx="65" cy="68" r="2.5" fill="white"/>
              <circle cx="101" cy="68" r="2.5" fill="white"/>
            </g>
            <!-- Blink overlays -->
            <ellipse id="yeti-blinkL" cx="62" cy="70" rx="14" ry="13" fill="#eef3fb" style="transform-origin:62px 70px; transform:scaleY(0); transition:transform 0.08s;"/>
            <ellipse id="yeti-blinkR" cx="98" cy="70" rx="14" ry="13" fill="#eef3fb" style="transform-origin:98px 70px; transform:scaleY(0); transition:transform 0.08s;"/>
            <!-- Nose -->
            <ellipse cx="80" cy="83" rx="9" ry="6" fill="#b8c8e8"/>
            <ellipse cx="77" cy="82" rx="3" ry="2" fill="#8aa0cc" opacity="0.6"/>
            <ellipse cx="83" cy="82" rx="3" ry="2" fill="#8aa0cc" opacity="0.6"/>
            <!-- Mouth -->
            <path id="yeti-mouth-normal" d="M70 95 Q80 103 90 95" stroke="#8aa0cc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path id="yeti-mouth-sad"    d="M70 100 Q80 94 90 100" stroke="#8aa0cc" stroke-width="2.5" fill="none" stroke-linecap="round" style="display:none"/>
            <path id="yeti-mouth-happy"  d="M68 95 Q80 107 92 95" stroke="#8aa0cc" stroke-width="3" fill="none" stroke-linecap="round" style="display:none"/>
            <!-- Normal arms -->
            <ellipse id="yeti-armL" cx="42" cy="118" rx="12" ry="24" fill="#d2e0f3" transform="rotate(-15 42 118)"/>
            <ellipse id="yeti-armR" cx="118" cy="118" rx="12" ry="24" fill="#d2e0f3" transform="rotate(15 118 118)"/>
            <!-- Cover arms (hidden by default) -->
            <g id="yeti-cover" style="display:none">
              <path d="M36 60 Q50 45 70 60" stroke="#c0d0ec" stroke-width="20" stroke-linecap="round" fill="none"/>
              <path d="M124 60 Q110 45 90 60" stroke="#c0d0ec" stroke-width="20" stroke-linecap="round" fill="none"/>
              <circle cx="68" cy="60" r="13" fill="#d2e0f3"/>
              <circle cx="92" cy="60" r="13" fill="#d2e0f3"/>
              <circle cx="60" cy="52" r="6" fill="#c0d0ec"/>
              <circle cx="68" cy="48" r="6" fill="#c0d0ec"/>
              <circle cx="76" cy="50" r="6" fill="#c0d0ec"/>
              <circle cx="100" cy="52" r="6" fill="#c0d0ec"/>
              <circle cx="92" cy="48" r="6" fill="#c0d0ec"/>
              <circle cx="84" cy="50" r="6" fill="#c0d0ec"/>
            </g>
          </svg>
        </div>

        <!-- Encabezado -->
        <div class="login-header" style="margin-top: 8px;">
          <h1 class="login-title">ProjectHub</h1>
          <p class="login-subtitle">Gestión interna de proyectos</p>
        </div>

        <!-- Formulario -->
        <div class="login-form">
          <div class="form-group">
            <label class="form-label" for="email">Correo electrónico</label>
            <input type="email" id="email" class="form-input"
              placeholder="usuario@empresa.com" autocomplete="email"/>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <div style="position:relative;">
              <input type="password" id="password" class="form-input"
                placeholder="••••••••" autocomplete="current-password"
                style="padding-right: 40px;"/>
              <button id="yeti-toggle-pw" type="button"
                style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
                       background:none;border:none;cursor:pointer;padding:0;
                       color:var(--text-muted);font-size:18px;line-height:1;">👁</button>
            </div>
          </div>

          <p id="login-error" class="login-error hidden"></p>

          <button id="login-btn" class="btn-primary btn-full">
            Iniciar sesión
          </button>
        </div>

        <div class="login-hints">
          <p class="hints-title">Usuarios de prueba:</p>
          <p class="hint">👔 Manager: <code>manager@test.com</code> / <code>123456</code></p>
          <p class="hint">👤 Colaborador: <code>user@test.com</code> / <code>123456</code></p>
        </div>

      </div>
    </div>
  `;

  // ── Referencias DOM ──────────────────────────────────────
  const emailInput    = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn      = document.getElementById("login-btn");
  const errorMsg      = document.getElementById("login-error");
  const togglePwBtn   = document.getElementById("yeti-toggle-pw");

  const coverArms   = document.getElementById("yeti-cover");
  const armL        = document.getElementById("yeti-armL");
  const armR        = document.getElementById("yeti-armR");
  const blinkL      = document.getElementById("yeti-blinkL");
  const blinkR      = document.getElementById("yeti-blinkR");
  const mouthNormal = document.getElementById("yeti-mouth-normal");
  const mouthSad    = document.getElementById("yeti-mouth-sad");
  const mouthHappy  = document.getElementById("yeti-mouth-happy");

  // ── Estado interno del yeti ──────────────────────────────
  let isCovering = false;
  let blinkTimer = null;

  // ── Helpers del yeti ─────────────────────────────────────

  function coverEyes() {
    if (isCovering) return;
    isCovering = true;
    armL.style.display   = "none";
    armR.style.display   = "none";
    coverArms.style.display = "block";
  }

  function uncoverEyes() {
    if (!isCovering) return;
    isCovering = false;
    armL.style.display   = "";
    armR.style.display   = "";
    coverArms.style.display = "none";
  }

  function setMouth(type) {
    mouthNormal.style.display = type === "normal" ? "" : "none";
    mouthSad.style.display    = type === "sad"    ? "" : "none";
    mouthHappy.style.display  = type === "happy"  ? "" : "none";
  }

  function doBlink() {
    // No parpadea si está tapándose los ojos
    if (isCovering) return;
    blinkL.style.transform = "scaleY(1)";
    blinkR.style.transform = "scaleY(1)";
    setTimeout(() => {
      blinkL.style.transform = "scaleY(0)";
      blinkR.style.transform = "scaleY(0)";
    }, 120);
  }

  // Parpadeo aleatorio cada ~2.5s
  blinkTimer = setInterval(() => {
    if (Math.random() > 0.4) doBlink();
  }, 2500);

  // Limpiamos el intervalo si el router reemplaza la vista
  // (evita memory leaks en navegaciones)
  container._yetiCleanup = () => clearInterval(blinkTimer);

  // ── Eventos del campo contraseña ─────────────────────────

  // Al enfocar el campo de contraseña → yeti se tapa los ojos
  passwordInput.addEventListener("focus", () => {
    // Solo se tapa si el campo sigue siendo tipo "password"
    if (passwordInput.type === "password") {
      coverEyes();
    }
  });

  // Al salir del foco → yeti destapa los ojos
  passwordInput.addEventListener("blur", () => {
    if (passwordInput.type === "password") {
      uncoverEyes();
    }
  });

  // ── Botón mostrar / ocultar contraseña ───────────────────
  togglePwBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      // Mostrar contraseña → yeti destapa y "mira"
      passwordInput.type = "text";
      togglePwBtn.textContent = "🙈";
      uncoverEyes();
    } else {
      // Ocultar contraseña → yeti vuelve a taparse si el campo tiene foco
      passwordInput.type = "password";
      togglePwBtn.textContent = "👁";
      if (document.activeElement === passwordInput) {
        coverEyes();
      }
    }
    // Devolvemos el foco al input después del click
    passwordInput.focus();
  });

  // ── Helpers de error / validación ────────────────────────

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");

    // Yeti pone cara triste
    setMouth("sad");
    setTimeout(() => setMouth("normal"), 1800);

    // Botón tiembla
    loginBtn.classList.add("yeti-shake");
    loginBtn.addEventListener(
      "animationend",
      () => loginBtn.classList.remove("yeti-shake"),
      { once: true }
    );
  }

  function hideError() {
    errorMsg.classList.add("hidden");
  }

  // ── Lógica de login ───────────────────────────────────────
  loginBtn.addEventListener("click", async () => {
    hideError();

    const email    = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validaciones del cliente
    if (!email) {
      showError("El correo electrónico es requerido");
      emailInput.focus();
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showError("Ingresa un correo electrónico válido");
      emailInput.focus();
      return;
    }

    if (!password) {
      showError("La contraseña es requerida");
      passwordInput.focus();
      return;
    }

    if (password.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      passwordInput.focus();
      return;
    }

    // Llamada al servidor
    loginBtn.disabled    = true;
    loginBtn.textContent = "Verificando...";

    try {
      const user = await loginUser(email, password);

      if (!user) {
        showError("Credenciales incorrectas. Verifica tu email y contraseña.");
        uncoverEyes();
        loginBtn.disabled    = false;
        loginBtn.textContent = "Iniciar sesión";
        return;
      }

      // Login exitoso → yeti feliz
      uncoverEyes();
      setMouth("happy");
      saveSession(user);
      showToast(`¡Bienvenido, ${user.name}!`, "success");

      // Pequeña pausa para que se vea la cara feliz antes de navegar
      setTimeout(() => navigate("#dashboard"), 700);

    } catch (error) {
      showError("Error de conexión. ¿Está json-server corriendo?");
      console.error("Error de login:", error);
      loginBtn.disabled    = false;
      loginBtn.textContent = "Iniciar sesión";
    }
  });

  // Enviar con Enter desde el campo contraseña
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });
}