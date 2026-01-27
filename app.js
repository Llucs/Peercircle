// app.js — P2P Chat (melhorias: segurança, UX, compatibilidade)
(() => {
  'use strict';

  // Elements
  const loginEl = document.getElementById('login');
  const menuEl = document.getElementById('menu');
  const chatEl = document.getElementById('chat');

  const usernameInput = document.getElementById('username');
  const enterBtn = document.getElementById('enterBtn');

  const displayUser = document.getElementById('display-user');
  const createRoomBtn = document.getElementById('createRoomBtn');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const joinRoomBtn = document.getElementById('joinRoomBtn');

  const roomTitle = document.getElementById('roomTitle');
  const messagesEl = document.getElementById('messages');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');

  // State
  let username = '';
  let peer = null;
  let channel = null;

  const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };

  // Feature detection
  if (!window.RTCPeerConnection) {
    alert('Seu navegador não suporta WebRTC (RTCPeerConnection). Use um navegador moderno (Chrome, Edge, Firefox).');
  }

  // Helpers
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  // Use safe DOM insertion to avoid XSS
  function addMessage(msg) {
    const container = document.createElement('div');
    container.className = 'msg-item';

    const userSpan = document.createElement('span');
    userSpan.className = 'msg-user';
    userSpan.textContent = `${msg.user}:`;

    const textSpan = document.createElement('span');
    textSpan.className = 'msg-text';
    textSpan.textContent = ` ${msg.text}`;

    container.appendChild(userSpan);
    container.appendChild(textSpan);

    messagesEl.appendChild(container);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setSendEnabled(enabled) {
    sendBtn.disabled = !enabled;
    msgInput.disabled = !enabled;
    if (!enabled) msgInput.value = '';
  }

  // Data channel events
  function setupChannelEvents() {
    if (!channel) return;

    channel.onopen = () => {
      addMessage({ user: 'SISTEMA', text: 'Conexão estabelecida! Podem conversar.' });
      setSendEnabled(true);
    };

    channel.onclose = () => {
      addMessage({ user: 'SISTEMA', text: 'Canal fechado.' });
      setSendEnabled(false);
    };

    channel.onerror = (err) => {
      console.error('Channel error', err);
      addMessage({ user: 'SISTEMA', text: 'Erro no canal de dados.' });
    };

    channel.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data && data.user && data.text) addMessage(data);
      } catch (err) {
        // se a mensagem não for JSON, exibe como texto simples
        addMessage({ user: 'REMOTE', text: String(e.data) });
      }
    };
  }

  // Host (cria oferta)
  async function startHost() {
    try {
      peer = new RTCPeerConnection(rtcConfig);

      channel = peer.createDataChannel('chat');
      setupChannelEvents();

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // aguarda finalização do gather de ICE
      peer.onicecandidate = (e) => {
        if (!e.candidate) {
          // ICE gathering complete; localDescription agora tem ICE candidates agregados
          const finalOffer = btoa(JSON.stringify(peer.localDescription));

          // Tenta copiar para a área de transferência e também logar no console
          console.log('Oferta (copie e envie ao amigo):', finalOffer);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(finalOffer).catch(() => {});
          }

          const answerCode = prompt(
            '1) Copie ESTE código (já foi copiado ao clipboard quando possível) e envie ao amigo:\n\n' +
              finalOffer +
              '\n\n2) Após o amigo enviar o código de RESPOSTA, cole-o aqui:'
          );

          if (answerCode) {
            try {
              const remote = JSON.parse(atob(answerCode));
              // setRemoteDescription aceita objeto ou RTCSessionDescription
              peer.setRemoteDescription(remote).catch((err) => {
                alert('Falha ao aplicar a resposta do amigo: ' + err);
              });
            } catch (err) {
              alert('Código de resposta inválido!');
            }
          } else {
            addMessage({ user: 'SISTEMA', text: 'Sala criada — aguardando código de resposta.' });
          }
        }
      };

      openChat('Host (aguardando conexões)');
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar como Host: ' + err);
    }
  }

  // Cliente (recebe oferta e cria resposta)
  async function joinRoom() {
    const offerCode = roomCodeInput.value.trim();
    if (!offerCode) return alert('Cole o código do host primeiro!');

    try {
      peer = new RTCPeerConnection(rtcConfig);

      peer.ondatachannel = (e) => {
        channel = e.channel;
        setupChannelEvents();
      };

      const offer = JSON.parse(atob(offerCode));
      await peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      peer.onicecandidate = (e) => {
        if (!e.candidate) {
          const finalAnswer = btoa(JSON.stringify(peer.localDescription));
          console.log('Resposta gerada (copie e envie ao Host):', finalAnswer);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(finalAnswer).catch(() => {});
          }
          alert('Envie este código de RESPOSTA de volta para o Host (foi copiado se o navegador permitir):\n\n' + finalAnswer);
        }
      };

      openChat('Conectando...');
    } catch (err) {
      console.error(err);
      alert('Código de convite inválido ou erro ao conectar.');
    }
  }

  function openChat(title) {
    hide(menuEl);
    show(chatEl);
    roomTitle.textContent = title;
  }

  // UI handlers
  function enter() {
    const value = usernameInput.value.trim();
    if (!value) return alert('Digite um nome');
    username = value;
    displayUser.textContent = username;
    hide(loginEl);
    show(menuEl);
    usernameInput.blur();
  }

  function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;
    if (!channel || channel.readyState !== 'open') {
      alert('Canal não está aberto ainda.');
      return;
    }

    const msg = { user: username, text };
    try {
      channel.send(JSON.stringify(msg));
      addMessage(msg);
      msgInput.value = '';
      msgInput.focus();
    } catch (err) {
      console.error('Erro enviando mensagem', err);
      alert('Erro ao enviar mensagem.');
    }
  }

  // event listeners (sem inline onclicks)
  enterBtn.addEventListener('click', enter);
  usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') enter(); });

  createRoomBtn.addEventListener('click', startHost);

  joinRoomBtn.addEventListener('click', joinRoom);
  roomCodeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') joinRoom(); });

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // expose some things for debugging in console (optional)
  window._p2pDebug = {
    getPeer: () => peer,
    getChannel: () => channel
  };

  // initial state
  setSendEnabled(false);
})();