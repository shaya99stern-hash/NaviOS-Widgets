import {open,refreshAccess} from "../_googleCrypto.js";

async function gj(url,access,init={}){
  const r=await fetch(url,{...init,headers:{...(init.headers||{}),authorization:"Bearer "+access}});
  if(!r.ok) throw new Error("google_api_"+r.status);
  return await r.json();
}
function hdr(msg,name){return (msg.payload?.headers||[]).find(h=>h.name?.toLowerCase()===name.toLowerCase())?.value||""}
export default async function handler(req,res){
  const auth=String(req.headers.authorization||"");
  const token=auth.startsWith("Bearer ")?auth.slice(7):String(req.query.token||"");
  if(!token) return res.status(401).json({ok:false,error:"missing_connection_token"});
  try{
    const sess=open(token);
    const refreshed=await refreshAccess(sess.rt);
    const access=refreshed.access_token;
    const out={ok:true,updated_at:new Date().toISOString(),gmail:[],drive:[],calendar:[]};

    // Gmail: latest inbox metadata
    const gm=await gj("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12&q=in:inbox",access);
    for(const m of (gm.messages||[]).slice(0,8)){
      const msg=await gj("https://gmail.googleapis.com/gmail/v1/users/me/messages/"+m.id+"?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date",access);
      out.gmail.push({id:m.id,from:hdr(msg,"From"),subject:hdr(msg,"Subject"),date:hdr(msg,"Date"),snippet:msg.snippet||""});
    }

    // Drive: recently modified files
    const q=encodeURIComponent("trashed=false");
    const du="https://www.googleapis.com/drive/v3/files?q="+q+"&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,mimeType,modifiedTime,createdTime,webViewLink,parents)";
    const dr=await gj(du,access);
    out.drive=(dr.files||[]).slice(0,12);

    // Calendar: next 14 days
    const tmin=encodeURIComponent(new Date().toISOString());
    const tmax=encodeURIComponent(new Date(Date.now()+14*86400000).toISOString());
    const cu="https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=30&timeMin="+tmin+"&timeMax="+tmax;
    const cal=await gj(cu,access);
    out.calendar=(cal.items||[]).map(e=>({id:e.id,title:e.summary||"Untitled",start:e.start?.dateTime||e.start?.date,end:e.end?.dateTime||e.end?.date,location:e.location||null,htmlLink:e.htmlLink||null}));

    return res.status(200).json(out);
  }catch(e){
    return res.status(401).json({ok:false,error:"google_connection_invalid"});
  }
}
