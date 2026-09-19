export default async function handler(req,res){
  const clientId=process.env.GOOGLE_CLIENT_ID||"832962466747-p6fsln32h3lsu7ag0icblklikebkrv0e0.apps.googleusercontent.com";
  if(!clientId) return res.status(503).json({ok:false,error:"google_client_not_configured"});
  const base=process.env.PUBLIC_BASE_URL||("https://"+req.headers.host);
  const redirect=base+"/api/google/callback";
  const scopes=[
    "openid","email","profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.activity.readonly",
    "https://www.googleapis.com/auth/calendar.readonly"
  ].join(" ");
  const u=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id",clientId);
  u.searchParams.set("redirect_uri",redirect);
  u.searchParams.set("response_type","code");
  u.searchParams.set("scope",scopes);
  u.searchParams.set("access_type","offline");
  u.searchParams.set("prompt","consent");
  u.searchParams.set("include_granted_scopes","true");
  u.searchParams.set("state","navios-widgets");
  return res.redirect(302,u.toString());
}
