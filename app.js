let mensagens = [];
let participantes = [];

function entrarNoChat() {
    document.getElementById("aviso").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
    carregarBackup();
    atualizarUI();
    iniciarConexao();
}

document.getElementById("sendBtn").addEventListener("click", () => {
    let texto = document.getElementById("messageInput").value;
    if (texto.trim()) {
        enviarMensagem("Você", texto, "localIP");
        enviarMensagemP2P(texto);
        document.getElementById("messageInput").value = "";
    }
});

function enviarMensagem(usuarioID, texto, usuarioIP) {
    criarMensagem(usuarioID, texto, usuarioIP);
    mensagens.push({usuarioID, texto, usuarioIP});
    salvarBackup();
}

function atualizarUI() {
    document.getElementById("messages").innerHTML = "";
    mensagens.forEach(m => criarMensagem(m.usuarioID, m.texto, m.usuarioIP));