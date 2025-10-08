let peer;
let conexoes = [];

function iniciarConexao() {
    peer = new Peer(undefined, {
        host: "0.peerjs.com", // Servidor público do PeerJS
        secure: true,
        port: 443
    });

    peer.on('open', id => {
        console.log("Meu Peer ID:", id);
        entrarNaSala(id);
    });

    peer.on('connection', conn => {
        conexoes.push(conn);
        configurarConexao(conn);
    });
}

function entrarNaSala(meuID) {
    let sala = "peercircle-room";
    conexoes.push(peer.connect(sala));
    conexoes.forEach(conn => configurarConexao(conn));
}

function configurarConexao(conn) {
    conn.on('data', data => {
        if (data.tipo === "mensagem") {
            criarMensagem(data.usuarioID, data.texto, data.usuarioIP);
            mensagens.push(data);
            salvarBackup();
        }
        if (data.tipo === "denuncia") {
            denunciar(data.usuarioID, data.usuarioIP);
        }
    });
}

function enviarMensagemP2P(texto) {
    conexoes.forEach(conn => {
        conn.send({
            tipo: "mensagem",
            usuarioID: "Você",
            texto: texto,
            usuarioIP: "localIP"
        });
    });
}