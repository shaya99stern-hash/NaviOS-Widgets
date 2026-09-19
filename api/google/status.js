export default function handler(req,res){
  const hasSecret=Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const clientId=process.env.GOOGLE_CLIENT_ID||"";
  const hasClient=Boolean(clientId);
  const configured=hasSecret&&hasClient;
  const suffix=clientId?clientId.slice(-24):"";
  res.setHeader("content-type","text/html; charset=utf-8");
  res.status(200).send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0b0b0d;color:#f4f2ed;font-family:-apple-system;margin:0;padding:32px}.card{max-width:560px;margin:auto;background:#151518;border:1px solid #2b2b30;border-radius:22px;padding:24px}a{display:block;background:#f2eee6;color:#111;padding:15px 18px;border-radius:13px;text-align:center;text-decoration:none;font-weight:700;margin-top:20px}.ok{color:#6ee7a8}.bad{color:#ff9b82}.row{padding:10px 0;border-top:1px solid #2b2b30}small{color:#999;line-height:1.5}</style><div class="card"><h1>Google Connection</h1><p class="${configured?"ok":"bad"}">${configured?"OAuth client configured":"Google OAuth setup incomplete"}</p><div class="row">Client ID: ${hasClient?"configured · …"+suffix:"MISSING"}</div><div class="row">Client Secret: ${hasSecret?"configured":"MISSING"}</div><small>Client ID and Client Secret must come from the same Google OAuth client.</small>${configured?'<a href="/api/google/connect">Connect Google</a>':''}</div>`);
}