let username;
let roomId;
let peer;
let channel;

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

function enter() {
  username = document.getElementById("username").value;
  if (!username) return alert("Digite um nome");
  document.getElementById("display-user").textContent = username;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

// --- LÓGICA DO HOST ---
async function startHost() {
  peer = new RTCPeerConnection(rtcConfig);
  
  // Criamos o canal de dados
  channel = peer.createDataChannel("chat");
  setupChannelEvents();

  // Gerar a oferta
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  // ESPERAR PELOS CANDIDATOS ICE (Isso torna o chat "real")
  peer.onicecandidate = (e) => {
    if (!e.candidate) {
      const finalOffer = btoa(JSON.stringify(peer.localDescription));
      console.log("Oferta pronta:", finalOffer);
      alert("CÓDIGO GERADO! Copie o código no console (F12) ou no próximo prompt e envie ao amigo.");
      const answerCode = prompt("1. ENVIE este código para seu amigo:\n\n" + finalOffer + "\n\n2. DEPOIS, cole o código de RESPOSTA dele aqui:");
      
      if (answerCode) {
        try {
          peer.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(answerCode))));
        } catch (err) { alert("Código de resposta inválido!"); }
      }
    }
  };

  openChat("Host Local");
}

// --- LÓGICA DO CLIENTE ---
async function joinRoom() {
  const offerCode = document.getElementById("roomCodeInput").value.trim();
  if (!offerCode) return alert("Cole o código do host primeiro!");

  peer = new RTCPeerConnection(rtcConfig);
  
  // O cliente recebe o canal do host
  peer.ondatachannel = (e) => {
    channel = e.channel;
    setupChannelEvents();
  };

  try {
    const offer = JSON.parse(atob(offerCode));
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    // Esperar candidatos ICE do cliente
    peer.onicecandidate = (e) => {
      if (!e.candidate) {
        const finalAnswer = btoa(JSON.stringify(peer.localDescription));
        prompt("Envie este código de RESPOSTA de volta para o Host:", finalAnswer);
      }
    };

    openChat("Conectado");
  } catch (err) {
    alert("Código de convite inválido!");
  }
}

function setupChannelEvents() {
  channel.onopen = () => {
    addMessage({user: "SISTEMA", text: "Conexão estabelecida! Podem conversar."});
  };
  channel.onmessage = (e) => {
    const data = JSON.parse(e.data);
    addMessage(data);
  };
}

function sendMessage() {
  const input = document.getElementById("msgInput");
  if (!input.value || !channel || channel.readyState !== "open") return;

  const msg = { user: username, text: input.value };
  channel.send(JSON.stringify(msg));
  addMessage(msg);
  input.value = "";
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.className = "msg-item";
  div.innerHTML = `<span class="msg-user">${msg.user}:</span> ${msg.text}`;
  document.getElementById("messages").appendChild(div);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

function openChat(title) {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
  document.getElementById("roomTitle").textContent = title;
}

function createRoom() { startHost(); }
