function criarMensagem(usuarioID, texto, usuarioIP) {
    let msgDiv = document.createElement("div");
    msgDiv.className = "message";
    msgDiv.innerHTML = `<b>${usuarioID}:</b> ${texto} <span class="denounce-btn" onclick="denunciar('${usuarioID}','${usuarioIP}')">🚨</span>`;
    document.getElementById("messages").appendChild(msgDiv);
}