function salvarBackup() {
    const data = {
        mensagens: mensagens,
        denuncias: denuncias,
        banidos: ipsBanidos,
        timestamp: Date.now()
    };
    localStorage.setItem("peerCircleBackup", JSON.stringify(data));
}

function carregarBackup() {
    const data = JSON.parse(localStorage.getItem("peerCircleBackup") || "{}");
    if (data.timestamp && (Date.now() - data.timestamp) < 48 * 60 * 60 * 1000) {
        mensagens = data.mensagens || [];
        denuncias = data.denuncias || {};
        ipsBanidos = data.banidos || [];
    } else {
        localStorage.removeItem("peerCircleBackup");
    }
}

setInterval(salvarBackup, 5000);