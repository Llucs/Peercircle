// webrtc.js
// Implementação WebRTC simplificada e robusta para o Peercircle
// ✅ Usa STUN público (Google) — não precisa configurar TURN
// ✅ Trata erros e estados de conexão
// ✅ Pronto para enviar/receber mensagens via DataChannel

export function createPeerConnection({ signalCallback, onDataMessage, onStateChange }) {
  // Servidor STUN público (Google)
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" }
  ];

  // Cria PeerConnection
  const pc = new RTCPeerConnection({ iceServers });

  // Cria canal de dados para mensagens (ordenado e confiável)
  const dataChannel = pc.createDataChannel("peercircle-data", { ordered: true });

  dataChannel.onopen = () => {
    console.log("[webrtc] Canal de dados aberto");
    onStateChange && onStateChange({ type: "datachannel", state: "open" });
  };

  dataChannel.onmessage = (event) => {
    try {
      onDataMessage && onDataMessage(event.data);
    } catch (err) {
      console.error("[webrtc] Erro ao processar mensagem:", err);
    }
  };

  dataChannel.onerror = (err) => {
    console.error("[webrtc] Erro no canal de dados:", err);
  };

  // Envia candidatos ICE via sinalização
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signalCallback({ type: "ice", candidate: event.candidate });
    }
  };

  // Monitora estados de conexão
  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    console.log("[webrtc] ICE state:", state);
    onStateChange && onStateChange({ type: "ice", state });
  };

  pc.onconnectionstatechange = () => {
    const state = pc.connectionState;
    console.log("[webrtc] Connection state:", state);
    onStateChange && onStateChange({ type: "connection", state });
  };

  // Cria uma oferta para iniciar a conexão
  async function makeOffer() {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signalCallback({ type: "offer", sdp: pc.localDescription });
    } catch (err) {
      console.error("[webrtc] Erro ao criar oferta:", err);
    }
  }

  // Recebe e aplica a resposta do outro peer
  async function handleRemoteAnswer(answer) {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("[webrtc] Erro ao aplicar resposta:", err);
    }
  }

  // Recebe uma oferta e responde automaticamente
  async function handleRemoteOffer(offer) {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signalCallback({ type: "answer", sdp: pc.localDescription });
    } catch (err) {
      console.error("[webrtc] Erro ao responder oferta:", err);
    }
  }

  // Adiciona candidatos ICE recebidos
  async function addIceCandidate(candidate) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("[webrtc] Falha ao adicionar candidato ICE:", err);
    }
  }

  // Envia mensagens pelo canal de dados
  function sendMessage(msg) {
    if (dataChannel.readyState === "open") {
      dataChannel.send(msg);
    } else {
      console.warn("[webrtc] Canal não está aberto:", dataChannel.readyState);
    }
  }

  // Fecha a conexão com segurança
  function close() {
    try { dataChannel.close(); } catch {}
    try { pc.close(); } catch {}
  }

  return {
    pc,
    dataChannel,
    makeOffer,
    handleRemoteAnswer,
    handleRemoteOffer,
    addIceCandidate,
    sendMessage,
    close
  };
}