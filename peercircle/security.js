const LIMITE_DENUNCIAS = 3;
let denuncias = {};
let ipsBanidos = [];

function denunciar(usuarioID, usuarioIP) {
    denuncias[usuarioIP] = (denuncias[usuarioIP] || 0) + 1;
    broadcastDenuncia(usuarioID, usuarioIP);

    if (denuncias[usuarioIP] >= LIMITE_DENUNCIAS) {
        expulsarUsuario(usuarioID, usuarioIP);
    }
}

function expulsarUsuario(usuarioID, usuarioIP) {
    participantes = participantes.filter(u => u.id !== usuarioID);
    ipsBanidos.push(usuarioIP);
    atualizarUI();
    enviarMensagemSistema(`Usuário ${usuarioID} expulso por denúncias.`);
}

function broadcastDenuncia(usuarioID, usuarioIP) {
    conexoes.forEach(conn => {
        conn.send({
            tipo: "denuncia",
            usuarioID: usuarioID,
            usuarioIP: usuarioIP
        });
    });
}

function enviarMensagemSistema(texto) {
    criarMensagem("Sistema", texto, "system");
}