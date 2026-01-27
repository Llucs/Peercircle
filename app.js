let u="",pc=null,ch=null;
const ice={iceServers:[{urls:"stun:stun.l.google.com:19302"}]};

const $=id=>document.getElementById(id);

function msg(t){
  const d=document.createElement("div");
  d.textContent=t;
  $("messages").appendChild(d);
}

$("enterBtn").onclick=()=>{
  u=$("username").value.trim();
  if(!u)return;
  $("display-user").textContent=u;
  $("login").classList.add("hidden");
  $("menu").classList.remove("hidden");
};

$("createRoomBtn").onclick=async()=>{
  pc=new RTCPeerConnection(ice);
  ch=pc.createDataChannel("c");
  ch.onmessage=e=>msg(e.data);
  ch.onopen=()=>msg("Conectado!");
  const o=await pc.createOffer();
  await pc.setLocalDescription(o);
  pc.onicecandidate=e=>{
    if(!e.candidate){
      const code=btoa(JSON.stringify(pc.localDescription));
      const ans=prompt("Envie esse código:\n"+code+"\n\nCole a resposta aqui:");
      if(ans) pc.setRemoteDescription(JSON.parse(atob(ans)));
    }
  };
  $("menu").classList.add("hidden");
  $("chat").classList.remove("hidden");
};

$("joinRoomBtn").onclick=async()=>{
  pc=new RTCPeerConnection(ice);
  pc.ondatachannel=e=>{
    ch=e.channel;
    ch.onmessage=x=>msg(x.data);
    ch.onopen=()=>msg("Conectado!");
  };
  const off=JSON.parse(atob($("roomCodeInput").value));
  await pc.setRemoteDescription(off);
  const a=await pc.createAnswer();
  await pc.setLocalDescription(a);
  pc.onicecandidate=e=>{
    if(!e.candidate){
      const code=btoa(JSON.stringify(pc.localDescription));
      alert("Envie isso pro host:\n"+code);
    }
  };
  $("menu").classList.add("hidden");
  $("chat").classList.remove("hidden");
};

$("sendBtn").onclick=()=>{
  if(!ch||ch.readyState!=="open")return;
  const t=$("msgInput").value;
  ch.send(u+": "+t);
  msg("Você: "+t);
  $("msgInput").value="";
};