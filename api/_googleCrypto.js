import crypto from "node:crypto";

function secretKey(){
  const raw=process.env.GOOGLE_SESSION_SECRET||process.env.GOOGLE_CLIENT_SECRET||"";
  if(!raw) throw new Error("Google secret missing");
  return crypto.createHash("sha256").update(raw).digest();
}
export function seal(payload){
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv("aes-256-gcm",secretKey(),iv);
  const enc=Buffer.concat([cipher.update(JSON.stringify(payload),"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return Buffer.concat([iv,tag,enc]).toString("base64url");
}
export function open(token){
  const buf=Buffer.from(token,"base64url");
  const iv=buf.subarray(0,12),tag=buf.subarray(12,28),enc=buf.subarray(28);
  const decipher=crypto.createDecipheriv("aes-256-gcm",secretKey(),iv);
  decipher.setAuthTag(tag);
  const dec=Buffer.concat([decipher.update(enc),decipher.final()]).toString("utf8");
  return JSON.parse(dec);
}
export async function refreshAccess(refreshToken){
  const body=new URLSearchParams({
    client_id:process.env.GOOGLE_CLIENT_ID||"",
    client_secret:process.env.GOOGLE_CLIENT_SECRET||"",
    refresh_token:refreshToken,
    grant_type:"refresh_token"
  });
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  if(!r.ok) throw new Error("refresh_failed");
  return await r.json();
}
