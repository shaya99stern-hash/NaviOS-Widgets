import './styles.css';

type Screen='home'|'widgets'|'sets'|'lock';
type WidgetType='tasks'|'clock'|'agenda'|'dashboard'|'focus'|'status'|'compact'|'today'|'split'|'weekly'|'progress'|'morning'|'night'|'followup'|'calendar'|'minimalclock'|'utility'|'controlcenter'|'launcher'|'note'|'quickadd'|'completed'|'essentials'|'countdown'|'overview'|'chatgpt'|'caseactivity'|'nextevent'|'daytimeline'|'weekcalendar'|'upnext'|'briefing'|'priority'|'workday'|'personalday'|'casepulse'|'syncstatus'|'batteryfocus'|'quickcapture'|'inbox'|'latestemail'|'driveactivity'|'recentfiles'|'googlebrief';
type ListType='personal'|'business';
type ThemeType='graphite'|'editorial'|'noir'|'glass'|'stone'|'luxe'|'edgeglow'|'matrix'|'softglass'|'copper';
type Family='all'|'minimal'|'dashboard'|'editorial'|'luxe'|'utility';
type SetId=
  'slate'|'editorial'|'modular'|'split'|'luxe'|'utility'|
  'glassstack'|'calendar'|'focus'|'carbon'|'stonegallery'|'ledger';

type SetPreset={
  id:SetId;
  name:string;
  family:Exclude<Family,'all'>;
  familyLabel:string;
  description:string;
  theme:ThemeType;
  primaryType:WidgetType;
  list:ListType;
  wallpaper:[string,string,string];
  layout:string[];
  lock:string;
  accent:string;
};

const themes:Array<[ThemeType,string,string,string]> = [
  ['graphite','Graphite Minimal','#121214','#27272A'],
  ['editorial','Matte Editorial','#111112','#1D1D20'],
  ['noir','Dashboard Noir','#0B0B0D','#202024'],
  ['glass','Monochrome Glass','#161619','#2A2A2E'],
  ['stone','Soft Stone','#171614','#2A2723'],
  ['luxe','Luxe Panel','#101011','#242426'],
  ['edgeglow','Edge Glow','#06070A','#151927'],
  ['matrix','Control Matrix','#040506','#15181B'],
  ['softglass','Soft Glass Mono','#090A0C','#202328'],
  ['copper','Warm Copper','#0A0807','#231913']
];

const widgetTypes:Array<[WidgetType,string,string,string]> = [
  ['tasks','Tasks','Personal and business to-dos','○'],
  ['clock','Clock','Large time and date','◷'],
  ['agenda','Agenda','Upcoming reminders','≡'],
  ['dashboard','Dashboard','Time, counts, quick status','▦'],
  ['focus','Focus','Next task and progress','◎'],
  ['status','Status','Battery, time, and task counts','◉'],
  ['compact','Compact','Date plus a tight task summary','—'],
  ['today','Today','Today-focused task list','●'],
  ['split','Personal / Business','Both lists in one widget','◫'],
  ['weekly','Weekly','Seven-day task strip','7'],
  ['progress','Progress','Completion percentage and counts','%'],
  ['morning','Morning Setup','Time plus first tasks of the day','☀'],
  ['night','Night Reset','Tomorrow plus today completion','☾'],
  ['followup','Follow Ups','Business calls, replies, and outreach','↗'],
  ['calendar','Calendar + Tasks','Date strip with upcoming work','▤'],
  ['minimalclock','Minimal Clock','Oversized clock with tiny metadata','◷'],
  ['utility','Utility Grid','Battery, time, Personal, Business','▦'],
  ['controlcenter','Control Center','Dense dark modular status deck','◉'],
  ['launcher','Launcher','Quick links into NaviOS actions','⌁'],
  ['note','Daily Note','One large note or next intention','”'],
  ['quickadd','Quick Add','One-tap Personal or Business add','＋'],
  ['completed','Recently Completed','Latest finished tasks','✓'],
  ['essentials','Personal Essentials','Personal-only essentials list','◇'],
  ['countdown','Countdown','Time remaining to next timed task','⌛'],
  ['overview','Overview','Personal + Business summary','◎'],
  ['chatgpt','ChatGPT','Dictate, ask, and open connected files','✦'],
  ['caseactivity','Case Activity','Live Drive updates, recent changes, and working status','▣'],
  ['nextevent','Next Event','Your next Google Calendar event','→'],
  ['daytimeline','Day Timeline','Today’s Google Calendar timeline','│'],
  ['weekcalendar','Week Calendar','Seven-day Google Calendar overview','7'],
  ['upnext','Up Next','Next calendar event plus next task','↗'],
  ['briefing','Daily Briefing','Calendar, tasks, and activity in one view','☰'],
  ['priority','Priority','Top open tasks only','!'],
  ['workday','Workday','Business tasks + Google Calendar + activity','W'],
  ['personalday','Personal Day','Personal tasks + Google Calendar + activity','P'],
  ['casepulse','Case Pulse','Compact recent activity pulse','◉'],
  ['syncstatus','Sync Status','Latest case-feed refresh status','↻'],
  ['batteryfocus','Battery Focus','Large battery and charging status','⚡'],
  ['quickcapture','Quick Capture','Fast local task capture','＋'],
  ['inbox','Inbox','Live Gmail inbox summary','✉'],
  ['latestemail','Latest Email','Most recent Gmail message','↙'],
  ['driveactivity','Drive Activity','Recently modified Google Drive files','▣'],
  ['recentfiles','Recent Files','Recent Google Drive file count and list','□'],
  ['googlebrief','Google Brief','Gmail, Drive and Calendar together','G']
];

const sets:SetPreset[] = [
  {
    id:'slate',name:'Slate Grid',family:'dashboard',familyLabel:'Modular dashboard',
    description:'Dense black-and-charcoal modules inspired by your monochrome control-panel references.',
    theme:'graphite',primaryType:'dashboard',list:'personal',
    wallpaper:['#121214','#18181B','#0D0D0F'],layout:['Clock','Tasks','Dashboard'],lock:'Large date + sparse utility row',accent:'#D97757'
  },
  {
    id:'editorial',name:'Editorial Black',family:'editorial',familyLabel:'Minimal editorial',
    description:'Open black space, tiny labels, serif hierarchy, and restrained white details.',
    theme:'editorial',primaryType:'agenda',list:'personal',
    wallpaper:['#0E0E0F','#171719','#111112'],layout:['Date','Agenda','Search'],lock:'Serif date + two compact widgets',accent:'#B9B3AA'
  },
  {
    id:'modular',name:'Noir Modules',family:'dashboard',familyLabel:'Modular dashboard',
    description:'Stacked rounded modules with clock, task status, and utility-style cards.',
    theme:'noir',primaryType:'dashboard',list:'business',
    wallpaper:['#0A0A0C','#202024','#141416'],layout:['Clock','Business','Status'],lock:'Circular utility + compact info block',accent:'#C2C0B7'
  },
  {
    id:'split',name:'Split Mono',family:'minimal',familyLabel:'Architectural split',
    description:'Strong geometric black/charcoal paneling based on the dramatic split-screen references.',
    theme:'glass',primaryType:'clock',list:'personal',
    wallpaper:['#08090B','#24262A','#111214'],layout:['Clock','Personal','Dock'],lock:'Oversized clock + split tone',accent:'#C2C0B7'
  },
  {
    id:'luxe',name:'Luxe Charcoal',family:'luxe',familyLabel:'Luxury matte',
    description:'Soft charcoal, warm-gray text, subtle depth, and rounded premium cards.',
    theme:'luxe',primaryType:'tasks',list:'personal',
    wallpaper:['#12110F','#25221E','#0E0E0D'],layout:['Tasks','Clock','Focus'],lock:'Warm charcoal + thin serif date',accent:'#D0C7BA'
  },
  {
    id:'utility',name:'Mono Utility',family:'utility',familyLabel:'Utility grid',
    description:'A practical control-center look with compact status tiles, battery, time, and task counts.',
    theme:'graphite',primaryType:'status',list:'personal',
    wallpaper:['#101012','#1C1C20','#0B0B0D'],layout:['Status','Battery','Tasks'],lock:'Battery + date + two utility pills',accent:'#D97757'
  },
  {
    id:'glassstack',name:'Glass Stack',family:'luxe',familyLabel:'Soft glass',
    description:'Layered charcoal panels with gentle transparency and softer rounded geometry.',
    theme:'glass',primaryType:'compact',list:'personal',
    wallpaper:['#151619','#25272C','#0E0F11'],layout:['Compact','Clock','Personal'],lock:'Soft glass date + compact stack',accent:'#C8C9CC'
  },
  {
    id:'calendar',name:'Quiet Calendar',family:'editorial',familyLabel:'Calendar editorial',
    description:'Sparse calendar-first layout with small date labels and large breathing room.',
    theme:'editorial',primaryType:'agenda',list:'business',
    wallpaper:['#101011','#171719','#0D0D0E'],layout:['Calendar','Agenda','Business'],lock:'Calendar date + agenda line',accent:'#C4BEB4'
  },
  {
    id:'focus',name:'Deep Focus',family:'minimal',familyLabel:'Focus minimal',
    description:'One dominant next-task card, minimal time, and almost no visual noise.',
    theme:'graphite',primaryType:'focus',list:'personal',
    wallpaper:['#0B0B0D','#151518','#080809'],layout:['Focus','Clock','Dock'],lock:'Single focus line + oversized time',accent:'#D97757'
  },
  {
    id:'carbon',name:'Carbon Control',family:'dashboard',familyLabel:'Dark control deck',
    description:'Tighter modules, stronger contrast, and compact utility blocks like a dark control surface.',
    theme:'noir',primaryType:'status',list:'business',
    wallpaper:['#060607','#17181B','#0D0E10'],layout:['Status','Business','Clock'],lock:'Compact status deck',accent:'#AEB0B5'
  },
  {
    id:'stonegallery',name:'Stone Gallery',family:'luxe',familyLabel:'Warm gallery',
    description:'Warm charcoal and stone-gray panels with calm spacing and understated luxury.',
    theme:'stone',primaryType:'compact',list:'personal',
    wallpaper:['#15130F','#24211C','#0C0B0A'],layout:['Compact','Agenda','Focus'],lock:'Warm stone date + slim widgets',accent:'#C5BCAF'
  },
  {
    id:'ledger',name:'Night Ledger',family:'utility',familyLabel:'Structured utility',
    description:'A disciplined information layout with small labels, clear rows, and precise spacing.',
    theme:'graphite',primaryType:'tasks',list:'business',
    wallpaper:['#101012','#18181B','#0A0A0C'],layout:['Business','Agenda','Status'],lock:'Ledger-style date + status row',accent:'#B8B3AB'
  }
];

const state={
  screen:(localStorage.getItem('navios-screen') as Screen)||'home',
  type:(localStorage.getItem('navios-type') as WidgetType)||'tasks',
  list:(localStorage.getItem('navios-list') as ListType)||'personal',
  theme:(localStorage.getItem('navios-theme') as ThemeType)||'graphite',
  set:(localStorage.getItem('navios-set') as SetId)||'slate',
  family:(localStorage.getItem('navios-family') as Family)||'all',
  slot:Math.max(1,Math.min(12,Number(localStorage.getItem('navios-slot')||'1')))
};

function saveState(){
  localStorage.setItem('navios-screen',state.screen);
  localStorage.setItem('navios-type',state.type);
  localStorage.setItem('navios-list',state.list);
  localStorage.setItem('navios-theme',state.theme);
  localStorage.setItem('navios-set',state.set);
  localStorage.setItem('navios-family',state.family);
  localStorage.setItem('navios-slot',String(state.slot));
  localStorage.setItem('navios-slot-'+state.slot,JSON.stringify({type:state.type,list:state.list,theme:state.theme}));
}

function activeSet(){return sets.find(item=>item.id===state.set)||sets[0];}

function loadSlot(slot:number){
  state.slot=slot;
  const raw=localStorage.getItem('navios-slot-'+slot);
  if(raw){
    try{
      const saved=JSON.parse(raw);
      if(saved.type)state.type=saved.type as WidgetType;
      if(saved.list)state.list=saved.list as ListType;
      if(saved.theme)state.theme=saved.theme as ThemeType;
    }catch{}
  }
  saveState();
}
function slotStrip(){
  return '<div class="slot-strip">'+Array.from({length:12},(_,i)=>i+1).map(n=>'<button class="'+(state.slot===n?'active':'')+'" data-slot="'+n+'"><span>SLOT</span><b>'+n+'</b></button>').join('')+'</div>';
}

function applyWidget(){
  saveState();
  const url='scriptable:///run?scriptName=NaviOS&action=configure&type='+
    encodeURIComponent(state.type)+'&list='+encodeURIComponent(state.list)+'&theme='+encodeURIComponent(state.theme)+'&slot=slot'+state.slot;
  window.location.href=url;
}

function applySet(){
  const preset=activeSet();
  state.type=preset.primaryType;
  state.list=preset.list;
  state.theme=preset.theme;
  saveState();
  applyWidget();
}

function downloadWallpaper(kind:'home'|'lock'){
  const preset=activeSet();
  const canvas=document.createElement('canvas');
  canvas.width=1290; canvas.height=2796;
  const ctx=canvas.getContext('2d'); if(!ctx)return;
  const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0,preset.wallpaper[0]); g.addColorStop(.52,preset.wallpaper[1]); g.addColorStop(1,preset.wallpaper[2]);
  ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);
  const glow=ctx.createRadialGradient(930,kind==='lock'?500:860,60,930,kind==='lock'?500:860,780);
  glow.addColorStop(0,preset.accent+'20'); glow.addColorStop(1,preset.accent+'00');
  ctx.fillStyle=glow; ctx.fillRect(0,0,canvas.width,canvas.height);
  if(['split','carbon'].includes(preset.id)){
    ctx.fillStyle='rgba(255,255,255,.035)';
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(canvas.width*.64,0);ctx.lineTo(canvas.width*.36,canvas.height);ctx.lineTo(0,canvas.height);ctx.closePath();ctx.fill();
  }
  if(['editorial','calendar','ledger'].includes(preset.id)){
    ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(110,430,2,1320);
  }
  const link=document.createElement('a');
  link.download='NaviOS-'+preset.id+'-'+kind+'.png';
  link.href=canvas.toDataURL('image/png');
  link.click();
}


const widgetWorks:Record<WidgetType,{source:string;action:string;home:string;lock:string;note?:string}> = {
  tasks:{source:'Local Scriptable task store',action:'Open list; task rows can complete/reopen tasks',home:'Small · Medium · Large',lock:'Inline · Circular · Rectangular'},
  clock:{source:'iPhone device time/date',action:'Open configured list',home:'Small · Medium · Large',lock:'Time summary'},
  agenda:{source:'Google Calendar via private Vercel feed',action:'Open or toggle local tasks',home:'Small · Medium · Large',lock:'Next local due item'},
  dashboard:{source:'Device time + local task counts',action:'Open manager',home:'Small · Medium · Large',lock:'Compact counts'},
  focus:{source:'Next open local task',action:'Open/toggle focus task where applicable',home:'Small · Medium · Large',lock:'Next task text'},
  status:{source:'Device battery + time + local task counts',action:'Open manager',home:'Small · Medium · Large',lock:'Battery/count summary'},
  compact:{source:'Date + first local tasks',action:'Open task list',home:'Small · Medium · Large',lock:'Open-count summary'},
  today:{source:'Local tasks due today; falls back to open tasks',action:'Open/toggle tasks',home:'Small · Medium · Large',lock:'Today open count'},
  split:{source:'Local Personal + Business lists',action:'Open manager',home:'Small · Medium · Large',lock:'Personal/business counts'},
  weekly:{source:'Local tasks with due dates over 7 days',action:'Open manager',home:'Small · Medium · Large',lock:'Scheduled count'},
  progress:{source:'Completion % from local tasks',action:'Open manager',home:'Small · Medium · Large',lock:'Completion %'},
  morning:{source:'Device time/date + first local tasks',action:'Open manager',home:'Small · Medium · Large',lock:'Morning/open summary'},
  night:{source:'Tomorrow-due local tasks + done-today count',action:'Open manager',home:'Small · Medium · Large',lock:'Done/tomorrow summary'},
  followup:{source:'Business tasks matched by follow/call/email/text/reply/contact/send',action:'Open Business list',home:'Small · Medium · Large',lock:'Next follow-up'},
  calendar:{source:'Google Calendar via private Vercel feed',action:'Open manager',home:'Small · Medium · Large',lock:'Next local due item',note:'Not Apple Calendar yet'},
  minimalclock:{source:'Device time/date + local counts',action:'Open manager',home:'Small · Medium · Large',lock:'Time'},
  utility:{source:'Device battery + time + local list counts',action:'Open manager',home:'Small · Medium · Large',lock:'Compact status'},
  controlcenter:{source:'Device time/battery + local task stats',action:'Open manager',home:'Small · Medium · Large',lock:'Compact status'},
  launcher:{source:'Scriptable action links',action:'Open/add local tasks',home:'Small · Medium · Large',lock:'Quick-action launcher'},
  note:{source:'Current first open local task',action:'Open list',home:'Small · Medium · Large',lock:'Note/next item'},
  quickadd:{source:'Local Scriptable task store',action:'Starts task-add input flow',home:'Small · Medium · Large',lock:'Tap invokes add flow',note:'iOS may open Scriptable because text input is required'},
  completed:{source:'Local completed-task history',action:'Open manager',home:'Small · Medium · Large',lock:'Done-today summary'},
  essentials:{source:'Open local Personal tasks',action:'Open Personal list',home:'Small · Medium · Large',lock:'Personal open count'},
  countdown:{source:'Next local task with a due date',action:'Open/toggle timed task',home:'Small · Medium · Large',lock:'Remaining-time summary'},
  overview:{source:'Local Personal/Business counts',action:'Open manager',home:'Small · Medium · Large',lock:'Counts'},
  chatgpt:{source:'Scriptable Dictation / typed input + ChatGPT app handoff',action:'Dictate, Ask, open ChatGPT, open connected files',home:'Small · Medium · Large',lock:'Launch Ask/Dictate action',note:'Conversation itself does not run inside the widget'},
  caseactivity:{source:'Hosted activity feed + Drive working-doc links',action:'Open working hub/checkpoint',home:'Small · Medium · Large',lock:'Latest activity summary',note:'Private direct Drive sync backend is still pending'},
  nextevent:{source:'Google Calendar via private Vercel feed',action:'Open next event',home:'Small · Medium · Large',lock:'Next event summary'},
  daytimeline:{source:'Google Calendar via private Vercel feed',action:'Open event',home:'Small · Medium · Large',lock:'Today timeline summary'},
  weekcalendar:{source:'Google Calendar via private Vercel feed',action:'Open calendar',home:'Small · Medium · Large',lock:'Week event count'},
  upnext:{source:'Google Calendar + local tasks',action:'Open event or toggle task',home:'Small · Medium · Large',lock:'Next item'},
  briefing:{source:'Google Calendar + local tasks + activity feed',action:'Open source item',home:'Small · Medium · Large',lock:'Brief summary'},
  priority:{source:'Top open local tasks',action:'Toggle task complete',home:'Small · Medium · Large',lock:'Top priority'},
  workday:{source:'Business tasks + Google Calendar + activity feed',action:'Open source item',home:'Small · Medium · Large',lock:'Workday summary'},
  personalday:{source:'Personal tasks + Google Calendar + activity feed',action:'Open source item',home:'Small · Medium · Large',lock:'Personal-day summary'},
  casepulse:{source:'Case activity feed',action:'Open connected Drive hub',home:'Small · Medium · Large',lock:'Recent update count'},
  syncstatus:{source:'Case activity feed refresh timestamp',action:'Open connected Drive hub',home:'Small · Medium · Large',lock:'Last refresh'},
  batteryfocus:{source:'iPhone battery + charging state',action:'Open configured list',home:'Small · Medium · Large',lock:'Battery %'},
  quickcapture:{source:'Local Scriptable task store',action:'Start add-task input',home:'Small · Medium · Large',lock:'Tap to add',note:'Text entry may open Scriptable'},
  inbox:{source:'Live Gmail via private Google OAuth backend',action:'Open Gmail',home:'Small · Medium · Large',lock:'Inbox summary'},
  latestemail:{source:'Latest Gmail message via private Google OAuth backend',action:'Open Gmail',home:'Small · Medium · Large',lock:'Latest sender/subject'},
  driveactivity:{source:'Live Google Drive via private Google OAuth backend',action:'Open updated Drive file',home:'Small · Medium · Large',lock:'Recent Drive update'},
  recentfiles:{source:'Live Google Drive via private Google OAuth backend',action:'Open Drive/file',home:'Small · Medium · Large',lock:'Recent file count'},
  googlebrief:{source:'Live Gmail + Drive + Google Calendar',action:'Open source item',home:'Small · Medium · Large',lock:'Combined Google summary'},
};

function capabilityPanel(type:WidgetType){
  const c=widgetWorks[type];
  return '<section class="capability-card"><div class="section-head"><span>ACTUALLY WORKS</span><b>'+widgetTypes.find(x=>x[0]===type)?.[1]+'</b></div>'+
    '<div class="cap-row"><span>DATA</span><b>'+c.source+'</b></div>'+
    '<div class="cap-row"><span>TAP</span><b>'+c.action+'</b></div>'+
    '<div class="cap-row"><span>HOME</span><b>'+c.home+'</b></div>'+
    '<div class="cap-row"><span>LOCK</span><b>'+c.lock+'</b></div>'+
    (c.note?'<p class="cap-note">'+c.note+'</p>':'')+'</section>';
}

function lockAccessoryPreviews(type:WidgetType){
  const label=widgetTypes.find(x=>x[0]===type)?.[1]||'Widget';
  const c=widgetWorks[type];
  return '<section class="accessory-preview-grid">'+
    '<div class="accessory-card inline"><small>INLINE</small><div>'+label+' · '+c.lock+'</div></div>'+
    '<div class="accessory-card circular"><small>CIRCULAR</small><div class="circle-demo">'+(type==='chatgpt'?'✦':type==='status'?'78%':'3')+'</div></div>'+
    '<div class="accessory-card rectangular"><small>RECTANGULAR</small><b>'+label+'</b><span>'+c.lock+'</span></div>'+
    '</section>';
}

function widgetPreview(type:WidgetType,themeName:ThemeType,list:ListType){
  const t=themes.find(item=>item[0]===themeName)||themes[0];
  const label=list==='personal'?'Personal':'Business';
  const style='--preview-bg:'+t[2]+';--preview-card:'+t[3];

  if(type==='clock')return '<div class="widget-preview" style="'+style+'"><div class="micro">FRI · SEP 18</div><div class="preview-time">7:42</div><div class="preview-sub">3 PERSONAL · 1 BUSINESS</div></div>';
  if(type==='dashboard')return '<div class="widget-preview" style="'+style+'"><div class="preview-top"><div><div class="micro">STATUS</div><div class="preview-serif">Dashboard</div></div><span>◆</span></div><div class="metric-grid"><div><b>7:42</b><span>TIME</span></div><div><b>3</b><span>'+label.toUpperCase()+'</span></div><div><b>1</b><span>DONE</span></div></div></div>';
  if(type==='agenda')return '<div class="widget-preview" style="'+style+'"><div class="micro">'+label.toUpperCase()+'</div><div class="preview-serif">Agenda</div><div class="thin-rule"></div><div class="preview-row"><span>9:00</span><b>Prepare for the day</b></div><div class="preview-row"><span>OPEN</span><b>Follow up</b></div></div>';
  if(type==='focus')return '<div class="widget-preview" style="'+style+'"><div class="micro">'+label.toUpperCase()+' · FOCUS</div><div class="focus-card"><span>NEXT</span><b>Prepare for the day</b></div><div class="preview-sub">3 OPEN · 1 DONE TODAY</div></div>';
  if(type==='status')return '<div class="widget-preview" style="'+style+'"><div class="micro">STATUS · '+label.toUpperCase()+'</div><div class="metric-grid two"><div><b>78%</b><span>BATTERY</span></div><div><b>3</b><span>OPEN</span></div></div><div class="status-row"><span>Personal 3</span><span>Business 1</span><span>7:42</span></div></div>';
  if(type==='compact')return '<div class="widget-preview compact-preview" style="'+style+'"><div class="preview-top"><span class="micro">FRI · SEP 18</span><span class="micro">3 OPEN</span></div><div class="preview-serif">'+label+'</div><div class="preview-row"><span>○</span><b>Relax</b></div><div class="preview-row"><span>○</span><b>Prepare suit / shirts</b></div></div>';
  if(type==='today')return '<div class="widget-preview" style="'+style+'"><div class="micro">TODAY · '+label.toUpperCase()+'</div><div class="preview-serif">Friday</div><div class="thin-rule"></div><div class="preview-row"><span>9:00</span><b>Prepare for the day</b></div><div class="preview-row"><span>OPEN</span><b>Follow up</b></div></div>';
  if(type==='split')return '<div class="widget-preview" style="'+style+'"><div class="micro">PERSONAL / BUSINESS</div><div class="metric-grid two"><div><b>3</b><span>PERSONAL</span></div><div><b>1</b><span>BUSINESS</span></div></div><div class="status-row"><span>P · Relax</span><span>B · Follow up</span></div></div>';
  if(type==='weekly')return '<div class="widget-preview" style="'+style+'"><div class="micro">NEXT 7 DAYS</div><div class="week-preview"><span>F<br><b>18</b></span><span>S<br><b>19</b></span><span>S<br><b>20</b></span><span>M<br><b>21</b></span><span>T<br><b>22</b></span><span>W<br><b>23</b></span><span>T<br><b>24</b></span></div><div class="preview-row"><span>2</span><b>Upcoming tasks</b></div></div>';
  if(type==='progress')return '<div class="widget-preview" style="'+style+'"><div class="micro">PROGRESS · '+label.toUpperCase()+'</div><div class="preview-time">68%</div><div class="progress-bar"><i></i></div><div class="preview-sub">7 COMPLETED · 3 OPEN</div></div>';
  if(type==='morning')return '<div class="widget-preview" style="'+style+'"><div class="preview-serif">Good morning</div><div class="preview-time small">7:42</div><div class="preview-row"><span>○</span><b>First task</b></div><div class="preview-row"><span>○</span><b>Second task</b></div></div>';
  if(type==='night')return '<div class="widget-preview" style="'+style+'"><div class="micro">NIGHT RESET</div><div class="preview-serif">Tomorrow</div><div class="preview-row"><span>○</span><b>Prepare for tomorrow</b></div><div class="preview-sub">4 completed today</div></div>';
  if(type==='followup')return '<div class="widget-preview" style="'+style+'"><div class="micro">BUSINESS</div><div class="preview-serif">Follow Ups</div><div class="thin-rule"></div><div class="preview-row"><span>↗</span><b>Email Peter</b></div><div class="preview-row"><span>↗</span><b>Call back</b></div></div>';
  if(type==='calendar')return '<div class="widget-preview" style="'+style+'"><div class="micro">SEPTEMBER</div><div class="week-preview"><span>F<br><b>18</b></span><span>S<br><b>19</b></span><span>S<br><b>20</b></span><span>M<br><b>21</b></span><span>T<br><b>22</b></span><span>W<br><b>23</b></span><span>T<br><b>24</b></span></div><div class="preview-row"><span>9:00</span><b>Next task</b></div></div>';
  if(type==='minimalclock')return '<div class="widget-preview" style="'+style+'"><div class="micro">FRIDAY, SEPTEMBER 18</div><div class="preview-time huge">7:42</div><div class="preview-sub">3 PERSONAL · 1 BUSINESS</div></div>';
  if(type==='utility')return '<div class="widget-preview" style="'+style+'"><div class="micro">UTILITY</div><div class="metric-grid two"><div><b>78%</b><span>BATTERY</span></div><div><b>7:42</b><span>TIME</span></div><div><b>3</b><span>PERSONAL</span></div><div><b>1</b><span>BUSINESS</span></div></div></div>';
  if(type==='controlcenter')return '<div class="widget-preview" style="'+style+'"><div class="micro">CONTROL CENTER</div><div class="metric-grid"><div><b>7:42</b><span>TIME</span></div><div><b>78%</b><span>BATTERY</span></div><div><b>3</b><span>OPEN</span></div><div><b>3</b><span>PERSONAL</span></div><div><b>1</b><span>BUSINESS</span></div><div><b>4</b><span>DONE</span></div></div></div>';
  if(type==='launcher')return '<div class="widget-preview" style="'+style+'"><div class="micro">LAUNCHER</div><div class="launcher-preview"><span>＋ Personal</span><span>＋ Business</span><span>○ Tasks</span><span>□ Business</span></div></div>';
  if(type==='note')return '<div class="widget-preview" style="'+style+'"><div class="micro">DAILY NOTE</div><div class="preview-serif quote">Keep the day clear. Do the next thing well.</div><div class="preview-sub">'+label.toUpperCase()+'</div></div>';
  if(type==='quickadd')return '<div class="widget-preview" style="'+style+'"><div class="micro">QUICK ADD</div><div class="quickadd-preview"><span>＋ Personal task</span><span>＋ Business task</span></div></div>';
  if(type==='completed')return '<div class="widget-preview" style="'+style+'"><div class="micro">RECENTLY COMPLETED</div><div class="preview-row"><span>✓</span><b>Finished task</b></div><div class="preview-row"><span>✓</span><b>Sent follow-up</b></div></div>';
  if(type==='essentials')return '<div class="widget-preview" style="'+style+'"><div class="micro">PERSONAL</div><div class="preview-serif">Essentials</div><div class="preview-row"><span>○</span><b>Prepare suit / shirts</b></div><div class="preview-row"><span>○</span><b>Reading material</b></div></div>';
  if(type==='countdown')return '<div class="widget-preview" style="'+style+'"><div class="micro">COUNTDOWN</div><div class="preview-time">2h 18m</div><div class="preview-sub">NEXT TIMED TASK</div></div>';
  if(type==='overview')return '<div class="widget-preview" style="'+style+'"><div class="micro">OVERVIEW</div><div class="metric-grid two"><div><b>3</b><span>PERSONAL</span></div><div><b>1</b><span>BUSINESS</span></div></div><div class="preview-row"><span>○</span><b>Next task</b></div></div>';
  if(type==='chatgpt')return '<div class="widget-preview chatgpt-preview" style="'+style+'"><div class="preview-top"><div><div class="micro">CHATGPT</div><div class="preview-serif">Ask anything</div></div><span class="chatgpt-mark">✦</span></div><div class="metric-grid two"><div><b>MIC</b><span>DICTATE</span></div><div><b>TEXT</b><span>ASK</span></div></div><div class="preview-row"><span>DRIVE</span><b>Connected files</b></div></div>';
  if(type==='caseactivity')return '<div class="widget-preview" style="'+style+'"><div class="preview-top"><div><div class="micro">CASE ACTIVITY</div><div class="preview-serif">Recent Activity</div></div><span>●</span></div><div class="thin-rule"></div><div class="preview-row"><span>2m</span><b>Working hub updated</b></div><div class="preview-row"><span>12m</span><b>Checkpoint changed</b></div><div class="preview-row"><span>1h</span><b>Drive sync complete</b></div></div>';
  return '<div class="widget-preview" style="'+style+'"><div class="micro">FRI · SEP 18</div><div class="preview-serif">'+label+'</div><div class="thin-rule"></div><div class="preview-row"><span>○</span><b>Relax</b></div><div class="preview-row"><span>○</span><b>Prepare suit / shirts</b></div><div class="preview-row"><span>○</span><b>Reading material</b></div></div>';
}

function phonePreview(p:SetPreset,mode:'home'|'lock'){
  if(mode==='lock'){
    return '<div class="phone phone-lock set-'+p.id+'"><div class="island"></div><div class="lock-date">FRIDAY, SEPTEMBER 18</div><div class="lock-time">7:42</div><div class="lock-stack"><div class="lock-pill">'+p.layout[0]+'</div><div class="lock-pill">'+p.layout[1]+'</div></div><div class="lock-note">'+p.lock+'</div></div>';
  }
  const cells=p.layout.map((item,index)=>{
    const cls=index===0?'wide':'';
    return '<div class="home-module '+cls+'"><span>'+item+'</span><b>'+(item==='Clock'||item==='Date'?'7:42':item==='Tasks'||item==='Business'?'3 open':'NaviOS')+'</b></div>';
  }).join('');
  return '<div class="phone set-'+p.id+'"><div class="island"></div><div class="home-grid">'+cells+'<div class="icon-row"><i></i><i></i><i></i><i></i></div></div><div class="dock"><i></i><i></i><i></i><i></i></div></div>';
}

function topBar(title:string,subtitle:string){
  return '<header class="topbar"><div><div class="brand-line">NAVI OS</div><h1>'+title+'</h1><p>'+subtitle+'</p></div><div class="brand-mark">◆</div></header>';
}

function nav(){
  const items:Array<[Screen,string,string]>=[['home','Home','⌂'],['widgets','Widgets','◫'],['sets','Sets','▦'],['lock','Lock','◉']];
  return '<nav class="bottom-nav">'+items.map(([id,label,icon])=>'<button class="'+(state.screen===id?'active':'')+'" data-screen="'+id+'"><span>'+icon+'</span><b>'+label+'</b></button>').join('')+'</nav>';
}

function familyFilters(){
  const families:Array<[Family,string]>=[['all','All'],['minimal','Minimal'],['dashboard','Dashboard'],['editorial','Editorial'],['luxe','Luxe'],['utility','Utility']];
  return '<div class="filter-strip">'+families.map(([id,label])=>'<button class="'+(state.family===id?'active':'')+'" data-family="'+id+'">'+label+'</button>').join('')+'</div>';
}

function homeScreen(){
  const p=activeSet();
  return topBar('Home','Your current NaviOS setup')+
    '<section class="current-card"><div class="current-copy"><div class="eyebrow">CURRENT SET</div><h2>'+p.name+'</h2><p>'+p.description+'</p><div class="chips"><span>'+p.familyLabel+'</span><span>'+p.layout.join(' · ')+'</span></div></div><div class="mini-phone-wrap">'+phonePreview(p,'home')+'</div></section>'+
    '<section class="google-connect-card"><div><span>GOOGLE</span><b>Gmail · Drive · Calendar</b><small>Connect once. Stay signed in through the private Vercel backend.</small></div><a href="https://navi-os-widgets.vercel.app/api/google/status">Connect Google</a></section>'+'<section class="quick-grid"><button data-go="widgets"><span>◫</span><b>Widget Library</b><small>44 live types · 440 style combinations</small></button><button data-go="sets"><span>▦</span><b>12 Home Sets</b><small>Reference-driven full setups</small></button><button data-go="lock"><span>◉</span><b>Lock Screen</b><small>12 matching lock styles</small></button><button id="apply-current"><span>↗</span><b>Apply current widget</b><small>Send to Scriptable</small></button></section>'+
    '<section class="collection-strip">'+sets.slice(0,6).map(item=>'<button data-set="'+item.id+'" data-go="sets"><div class="collection-thumb set-'+item.id+'"></div><b>'+item.name+'</b><span>'+item.familyLabel+'</span></button>').join('')+'</section>'+
    '<section class="status-note"><b>Reference-led system</b><p>The new library expands the exact dark, monochrome, editorial, modular, and luxury directions from the screens you sent while keeping Scriptable as the live widget renderer.</p></section>';
}

function widgetsScreen(){
  return topBar('Widgets','12 independent slots · 44 live types · 10 styles')+
    '<section><div class="section-head"><span>MULTI-SLOT</span><b>Each Home / Lock widget can keep its own setup</b></div>'+slotStrip()+'</section>'+
    '<section><div class="section-head"><span>TYPE</span><b>What should Slot '+state.slot+' show?</b></div><div class="widget-library">'+widgetTypes.map(([id,name,desc,icon])=>'<button class="widget-choice '+(state.type===id?'active':'')+'" data-type="'+id+'"><span class="widget-icon">'+icon+'</span><div><b>'+name+'</b><small>'+desc+'</small></div></button>').join('')+'</div></section>'+
    '<section><div class="section-head"><span>LIST</span><b>Which side of your life?</b></div><div class="segmented"><button class="'+(state.list==='personal'?'active':'')+'" data-list="personal">Personal</button><button class="'+(state.list==='business'?'active':'')+'" data-list="business">Business</button></div></section>'+
    '<section><div class="section-head"><span>STYLE</span><b>Dark reference families</b></div><div class="theme-list">'+themes.map(([id,name,bg,card])=>'<button class="theme-row '+(state.theme===id?'active':'')+'" data-theme="'+id+'"><span class="swatch" style="--a:'+bg+';--b:'+card+'"></span><b>'+name+'</b><span>›</span></button>').join('')+'</div></section>'+
    '<section><div class="section-head"><span>PREVIEW</span><b>Live widget preview</b></div>'+widgetPreview(state.type,state.theme,state.list)+'</section>'+capabilityPanel(state.type)+
    '<button class="primary-action" id="apply-widget">Apply to Scriptable</button>'+
    '<a class="engine-link" href="/NaviOS-v4.3.0.scriptable" download="NaviOS-v4.3.0.scriptable">Install / Update Widget Engine v4.3.0</a>';
}


function setMiniPreview(item:SetPreset){
  const accent=item.accent;
  const bg=item.wallpaper[0];
  const mid=item.wallpaper[1];
  const first=item.layout[0]||'Widget';
  const second=item.layout[1]||'Status';
  const third=item.layout[2]||'Tasks';

  if(item.id==='split'){
    return '<div class="set-mini set-mini-split" style="--mini-bg:'+bg+';--mini-mid:'+mid+';--mini-accent:'+accent+'"><div class="mini-clock">7:42</div><div class="mini-side"><span>'+second+'</span><b>3</b></div><div class="mini-dock"><i></i><i></i><i></i><i></i></div></div>';
  }
  if(item.id==='editorial'||item.id==='calendar'){
    return '<div class="set-mini set-mini-editorial" style="--mini-bg:'+bg+';--mini-mid:'+mid+';--mini-accent:'+accent+'"><div class="mini-date">FRI<br><b>18</b></div><div class="mini-copy"><small>'+first.toUpperCase()+'</small><strong>'+second+'</strong><span>9:00 · next item</span></div></div>';
  }
  if(item.id==='luxe'||item.id==='stonegallery'){
    return '<div class="set-mini set-mini-luxe" style="--mini-bg:'+bg+';--mini-mid:'+mid+';--mini-accent:'+accent+'"><div class="mini-orb"></div><div class="mini-luxe-copy"><small>'+first.toUpperCase()+'</small><strong>'+second+'</strong><span>'+third+'</span></div></div>';
  }
  return '<div class="set-mini set-mini-grid" style="--mini-bg:'+bg+';--mini-mid:'+mid+';--mini-accent:'+accent+'"><div class="mini-wide"><span>'+first+'</span><b>7:42</b></div><div class="mini-tile"><span>'+second+'</span><b>3</b></div><div class="mini-tile"><span>'+third+'</span><b>78%</b></div></div>';
}

function setsScreen(){
  const p=activeSet();
  const visible=state.family==='all'?sets:sets.filter(x=>x.family===state.family);
  return topBar('Home Screen Sets','Coordinated widget layouts + matching generated wallpapers')+
    familyFilters()+
    '<section class="preset-grid">'+visible.map(item=>'<button class="preset-card '+(item.id===state.set?'active':'')+'" data-set="'+item.id+'">'+setMiniPreview(item)+'<b>'+item.name+'</b><span>'+item.familyLabel+'</span></button>').join('')+'</section>'+
    '<section class="set-hero"><div>'+phonePreview(p,'home')+'</div><div class="set-copy"><div class="eyebrow">'+p.familyLabel.toUpperCase()+'</div><h2>'+p.name+'</h2><p>'+p.description+'</p><div class="layout-list">'+p.layout.map(item=>'<span>'+item+'</span>').join('')+'</div></div></section>'+
    '<section class="action-stack"><button class="primary-action" id="apply-set">Use this widget style</button><button class="secondary-action" id="download-home">Save matching Home Screen wallpaper</button></section>';
}

function lockScreen(){
  const p=activeSet();
  const visible=state.family==='all'?sets:sets.filter(x=>x.family===state.family);
  return topBar('Lock Screen','Real Scriptable accessory widgets + matching wallpapers')+
    '<section><div class="section-head"><span>LOCK WIDGET TYPE</span><b>Tap one to preview</b></div><div class="lock-type-strip">'+widgetTypes.map(([id,name,,icon])=>'<button class="'+(state.type===id?'active':'')+'" data-type="'+id+'"><span>'+icon+'</span><b>'+name+'</b></button>').join('')+'</div></section>'+
    lockAccessoryPreviews(state.type)+
    capabilityPanel(state.type)+
    '<div class="section-head"><span>WALLPAPER STYLE</span><b>Match the Home Screen set</b></div>'+
    familyFilters()+
    '<section class="lock-library">'+visible.map(item=>'<button class="lock-card '+(item.id===state.set?'active':'')+'" data-set="'+item.id+'">'+phonePreview(item,'lock')+'<div><b>'+item.name+'</b><span>'+item.lock+'</span></div></button>').join('')+'</section>'+
    '<section class="lock-feature"><div>'+phonePreview(p,'lock')+'</div><div class="set-copy"><div class="eyebrow">SELECTED LOCK</div><h2>'+p.name+'</h2><p>'+p.lock+'</p></div></section>'+
    '<button class="secondary-action full" id="download-lock">Save matching Lock Screen wallpaper</button>'+
    '<section class="status-note"><b>Real Lock Screen behavior</b><p>Scriptable supports Inline, Circular, and Rectangular Lock Screen widgets. iOS controls their tint and refresh timing. Text-entry actions such as Quick Add or ChatGPT Dictation may open Scriptable because the widget itself cannot host a keyboard or microphone session.</p></section>';
}
function render(){
  const app=document.querySelector<HTMLDivElement>('#app'); if(!app)return;
  let content=homeScreen();
  if(state.screen==='widgets')content=widgetsScreen();
  if(state.screen==='sets')content=setsScreen();
  if(state.screen==='lock')content=lockScreen();
  app.innerHTML='<main class="app-shell"><div class="content">'+content+'</div>'+nav()+'</main>';

  document.querySelectorAll<HTMLElement>('[data-screen]').forEach(el=>el.onclick=()=>{state.screen=el.dataset.screen as Screen;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-go]').forEach(el=>el.onclick=()=>{state.screen=el.dataset.go as Screen;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-type]').forEach(el=>el.onclick=()=>{state.type=el.dataset.type as WidgetType;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-list]').forEach(el=>el.onclick=()=>{state.list=el.dataset.list as ListType;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-theme]').forEach(el=>el.onclick=()=>{state.theme=el.dataset.theme as ThemeType;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-set]').forEach(el=>el.onclick=()=>{state.set=el.dataset.set as SetId;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-family]').forEach(el=>el.onclick=()=>{state.family=el.dataset.family as Family;saveState();render();});
  document.querySelectorAll<HTMLElement>('[data-slot]').forEach(el=>el.onclick=()=>{loadSlot(Number(el.dataset.slot||'1'));render();});

  document.querySelector<HTMLButtonElement>('#apply-widget')?.addEventListener('click',applyWidget);
  document.querySelector<HTMLButtonElement>('#apply-current')?.addEventListener('click',applyWidget);
  document.querySelector<HTMLButtonElement>('#apply-set')?.addEventListener('click',applySet);
  document.querySelector<HTMLButtonElement>('#download-home')?.addEventListener('click',()=>downloadWallpaper('home'));
  document.querySelector<HTMLButtonElement>('#download-lock')?.addEventListener('click',()=>downloadWallpaper('lock'));
}

render();
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
