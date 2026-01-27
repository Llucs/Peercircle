let username;
let roomId;
let isHost = false;

let peer;
let channel;
let messages = [];

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

function enter() {
  username = document.getElementById("username").value;
  if (!username) return alert("Digite um nome");

  document.getElementById("login").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function createRoom() {
  isHost = true;
  roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

  alert("Código da sala: " + roomId);
  startHost();
}

function joinRoom() {
  roomId = document.getElementById("roomCodeInput").value.trim();
  if (!roomId) return alert("Digite o código da sala");

  startClient();
}

function startHost() {
  peer = new RTCPeerConnection(rtcConfig);
  channel = peer.createDataChannel("chat");

  channel.onmessage = onMessage;

  peer.createOffer().then(offer => {
    peer.setLocalDescription(offer);
    prompt("Envie este código para quem vai entrar:", btoa(JSON.stringify(offer)));
  });

  peer.onicecandidate = e => {
    if (e.candidate) return;
    const answerCode = prompt("Cole aqui o código de resposta:");
    peer.setRemoteDescription(JSON.parse(atob(answerCode)));
  };

  openChat();
}

function startClient() {
  peer = new RTCPeerConnection(rtcConfig);

  peer.ondatachannel = e => {
    channel = e.channel;
    channel.onmessage = onMessage;
  };

  const offerCode = prompt("Cole o código do host:");
  const offer = JSON.parse(atob(offerCode));
  peer.setRemoteDescription(offer);

  peer.createAnswer().then(answer => {
    peer.setLocalDescription(answer);
    prompt("Envie este código de volta ao host:", btoa(JSON.stringify(answer)));
  });

  openChat();
}

function openChat() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
  document.getElementById("roomTitle").textContent = "Sala " + roomId;
}

function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value;
  if (!text) return;

  const msg = { user: username, text };
  messages.push(msg);
  addMessage(msg);

  channel.send(JSON.stringify({ type: "msg", data: msg }));
  input.value = "";
}

function onMessage(e) {
  const packet = JSON.parse(e.data);

  if (packet.type === "msg") {
    messages.push(packet.data);
    addMessage(packet.data);
  }

  if (packet.type === "history") {
    packet.data.forEach(addMessage);
  }
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.textContent = msg.user + ": " + msg.text;
  document.getElementById("messages").appendChild(div);
}