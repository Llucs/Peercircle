// ui.js
import { generateKeyPair, exportPublicKey } from "./security.js";
import { saveSecret } from "./storage.js";
import { createPeerConnection } from "./webrtc.js";

const loginBtn = document.getElementById("loginBtn");
const overlay = document.getElementById("overlay");
const appDiv = document.getElementById("app");
const note = document.getElementById("login-note");

async function onLoginClick() {
  loginBtn.disabled = true;
  note.textContent = "Inicializando chaves...";

  try {
    // 1) gerar pares locais
    const { ecdh, signKey } = await generateKeyPair();

    // 2) exportar publicKey para enviar ao peer via sinalização
    const rawPub = await exportPublicKey(ecdh.publicKey || ecdh); // adapte se exportPublicKey espera key

    // 3) salvar chaves locais (apenas exportadas/cifradas) em storage
    // note: exporte private key corretamente e cifre antes de salvar - aqui salvamos apenas placeholders
    await saveSecret("ecdh_pub", rawPub);

    // 4) esconder overlay, mostrar app
    overlay.style.display = "none";
    appDiv.style.display = "block";
    note.textContent = "Conecte-se a um peer por meio da sinalização.";

    // 5) inicializar lógica webrtc (exemplo mínimo)
    // configure signalCallback para usar seu servidor signal (wss/http)
    const pc = createPeerConnection({
      signalCallback: (msg) => {
        console.log("[signal] send", msg);
        // enviar via fetch / websocket para servidor de sinalização
      },
      onDataMessage: (data) => {
        console.log("[data] recv", data);
      },
      onStateChange: (s) => {
        console.log("[state]", s);
      }
    });

    // opcional: chute para makeOffer quando quiser iniciar
    // await pc.makeOffer();
  } catch (err) {
    console.error("[ui] onLogin error", err);
    note.textContent = "Falha ao inicializar. Veja console.";
    loginBtn.disabled = false;
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", onLoginClick);
}