import {seal} from "../_googleCrypto.js";

export default async function handler(req,res){
  const code=req.query.code;
  if(!code) return res.status(400).send("Missing code");
  const base=process.env.PUBLIC_BASE_URL||("https://"+req.headers.host);
  const redirect=base+"/api/google/callback";
  const body=new URLSearchParams({
    code:String(code),
    client_id:process.env.GOOGLE_CLIENT_ID||"832962466747-p6fsln32h3lsu7ag0icblklikebkrv0e0.apps.googleusercontent.com",
    client_secret:process.env.GOOGLE_CLIENT_SECRET||"",
    redirect_uri:redirect,
    grant_type:"authorization_code"
  });
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  const tok=await r.json();
  if(!r.ok||!tok.refresh_token) return res.status(500).send("Google authorization failed. Revoke the app and reconnect so Google issues a refresh token.");
  let email="";
  try{
    const me=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:"Bearer "+tok.access_token}});
    const profile=await me.json(); email=profile.email||"";
  }catch{}
  const sealed=seal({rt:tok.refresh_token,email,created:Date.now()});
  const deep="scriptable:///run?scriptName=NaviOS&action=googleConnect&token="+encodeURIComponent(sealed);
  res.setHeader("content-type","text/html; charset=utf-8");
  return res.status(200).send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0b0b0d;color:#f4f2ed;font-family:-apple-system;padding:32px}a{display:block;background:#222226;color:#fff;padding:16px 18px;border-radius:14px;text-decoration:none;margin-top:20px}small{color:#999}</style><h1>Google connected</h1><p>${email||"Your Google account"} is authorized for Gmail, Drive and Calendar.</p><a href="${deep}">Finish connection in Scriptable</a><small>Tap once. Scriptable will save the private connection token on this iPhone.</small>`);
}
