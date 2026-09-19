// NaviOS Widgets — Scriptable Theme Suite
// Real iOS Home Screen widgets hosted by Scriptable.
// No server, no Vercel, no developer account, local-first task storage.

const VERSION = "4.3.0-test-today";
const fm = FileManager.local();
const root = fm.joinPath(fm.documentsDirectory(), "NaviOS");
const dataPath = fm.joinPath(root, "tasks.json");
const configPath = fm.joinPath(root, "widget-config.json");
if (!fm.fileExists(root)) fm.createDirectory(root, true);

const nowISO = () => new Date().toISOString();
const uid = () => String(Date.now()) + "-" + String(Math.floor(Math.random() * 100000));

const THEMES = {
  graphite: {
    name: "Graphite Minimal",
    bg: "#050506", panel: "#0D0D0F", panel2: "#151518",
    text: "#F1EFEA", secondary: "#8E8B86", faint: "#454348",
    accent: "#B9B3AA", line: "#6E6963",
    serif: true, radius: 16, mark: "◆"
  },
  editorial: {
    name: "Matte Editorial",
    bg: "#090909", panel: "#111111", panel2: "#191919",
    text: "#F0EEE8", secondary: "#98948C", faint: "#4A4844",
    accent: "#CDC6BA", line: "#5E5A53",
    serif: true, radius: 8, mark: "·"
  },
  noir: {
    name: "Dashboard Noir",
    bg: "#030304", panel: "#101013", panel2: "#17171B",
    text: "#F5F5F2", secondary: "#92939A", faint: "#414149",
    accent: "#B8BAC2", line: "#52535B",
    serif: false, radius: 15, mark: "◼"
  },
  glass: {
    name: "Monochrome Glass",
    bg: "#08090B", panel: "#15171A", panel2: "#1C1F23",
    text: "#F3F4F2", secondary: "#9A9DA1", faint: "#4B4F54",
    accent: "#C0C3C7", line: "#676B70",
    serif: false, radius: 19, mark: "◌"
  },
  stone: {
    name: "Soft Stone",
    bg: "#0A0908", panel: "#151311", panel2: "#1E1B18",
    text: "#EEEAE2", secondary: "#A19A8F", faint: "#514C45",
    accent: "#C5BCAF", line: "#72695F",
    serif: true, radius: 17, mark: "◇"
  },
  luxe: {
    name: "Luxe Panel",
    bg: "#050505", panel: "#121212", panel2: "#1B1B1B",
    text: "#F6F3ED", secondary: "#96918A", faint: "#44413D",
    accent: "#D0C7BA", line: "#6B645C",
    serif: true, radius: 11, mark: "■"
  },
  edgeglow: {
    name: "Edge Glow",
    bg: "#06070A", panel: "#0E1117", panel2: "#151927",
    text: "#F4F4F7", secondary: "#A5A7B0", faint: "#4E5260",
    accent: "#8C7CFF", line: "#4D5FBF",
    serif: false, radius: 19, mark: "◈"
  },
  matrix: {
    name: "Control Matrix",
    bg: "#040506", panel: "#0B0D0F", panel2: "#15181B",
    text: "#F2F3F3", secondary: "#979CA0", faint: "#42484D",
    accent: "#9DA4AA", line: "#52585D",
    serif: false, radius: 12, mark: "▦"
  },
  softglass: {
    name: "Soft Glass Mono",
    bg: "#090A0C", panel: "#15171A", panel2: "#202328",
    text: "#F1F2F2", secondary: "#9B9EA3", faint: "#50545A",
    accent: "#C5C8CC", line: "#6D7278",
    serif: false, radius: 22, mark: "◌"
  },
  copper: {
    name: "Warm Copper",
    bg: "#0A0807", panel: "#17110E", panel2: "#231913",
    text: "#F3EAE2", secondary: "#B6A295", faint: "#5A4B43",
    accent: "#E0A074", line: "#8C624D",
    serif: true, radius: 18, mark: "◇"
  }
};

const TYPES = [
  "tasks", "clock", "agenda", "dashboard", "focus", "status", "compact",
  "today", "split", "weekly", "progress", "morning", "night", "followup",
  "calendar", "minimalclock", "utility", "controlcenter", "launcher",
  "note", "quickadd", "completed", "essentials", "countdown", "overview"
];

function widgetFamily() {
  return config.widgetFamily || "medium";
}

function familyRows(smallRows, mediumRows, largeRows) {
  const family = widgetFamily();
  if (family === "small") return smallRows;
  if (family === "large") return largeRows;
  return mediumRows;
}

function familyFont(smallSize, mediumSize, largeSize) {
  const family = widgetFamily();
  if (family === "small") return smallSize;
  if (family === "large") return largeSize;
  return mediumSize;
}

function familyPadding() {
  const family = widgetFamily();
  if (family === "small") return [12, 12, 12, 12];
  if (family === "large") return [16, 17, 15, 17];
  return [14, 15, 13, 15];
}

function C(hex, alpha) {
  return new Color(hex, alpha == null ? 1 : alpha);
}

function theme(name) {
  return THEMES[name] || THEMES.graphite;
}

function serifFont(size) {
  return new Font("Georgia", size);
}

function displayFont(t, size, weight) {
  if (t.serif) return serifFont(size);
  if (weight === "bold") return Font.boldSystemFont(size);
  if (weight === "semibold") return Font.semiboldSystemFont(size);
  return Font.regularSystemFont(size);
}

function defaultData() {
  return {
    version: 2,
    updatedAt: nowISO(),
    tasks: [
      { id: uid(), list: "personal", title: "Relax", completed: false, due: null, createdAt: nowISO() },
      { id: uid(), list: "personal", title: "Prepare suit / shirts", completed: false, due: null, createdAt: nowISO() },
      { id: uid(), list: "personal", title: "Prepare reading material for shul", completed: false, due: null, createdAt: nowISO() },
      { id: uid(), list: "business", title: "Follow up with Stephanie, Rafi, and Peter", completed: false, due: null, createdAt: nowISO() }
    ]
  };
}

function loadData() {
  if (!fm.fileExists(dataPath)) {
    const seed = defaultData();
    saveData(seed);
    return seed;
  }
  try {
    const parsed = JSON.parse(fm.readString(dataPath));
    if (!Array.isArray(parsed.tasks)) throw new Error("Invalid task file");
    parsed.version = 2;
    return parsed;
  } catch (_) {
    try { fm.copy(dataPath, dataPath + ".backup-" + Date.now()); } catch (_) {}
    const seed = defaultData();
    saveData(seed);
    return seed;
  }
}

function saveData(data) {
  data.updatedAt = nowISO();
  data.version = 2;
  fm.writeString(dataPath, JSON.stringify(data, null, 2));
}

function normalizeList(value) {
  return String(value || "").toLowerCase() === "business" ? "business" : "personal";
}

function listTitle(list) {
  return list === "business" ? "Business" : "Personal";
}

function normalizeTheme(value) {
  const v = String(value || "").toLowerCase();
  return THEMES[v] ? v : "graphite";
}

function normalizeType(value) {
  const v = String(value || "").toLowerCase();
  return TYPES.includes(v) ? v : "tasks";
}

function defaultWidgetConfig() {
  return { type: "today", list: "personal", themeName: "graphite" };
}

const SLOT_COUNT = 12;
const slotsPath = fm.joinPath(baseDir, "widget-slots.json");

function normalizeSlot(raw) {
  const m = String(raw || "").toLowerCase().match(/(?:slot)?(\d{1,2})/);
  if (!m) return "slot1";
  const n = Math.max(1, Math.min(SLOT_COUNT, parseInt(m[1], 10)));
  return "slot" + n;
}

function defaultSlots() {
  const out = {};
  for (let i = 1; i <= SLOT_COUNT; i++) out["slot" + i] = defaultWidgetConfig();
  return out;
}

function loadSlots() {
  if (!fm.fileExists(slotsPath)) {
    const legacy = loadWidgetConfigLegacy();
    const slots = defaultSlots();
    slots.slot1 = legacy;
    fm.writeString(slotsPath, JSON.stringify(slots, null, 2));
    return slots;
  }
  try {
    const raw = JSON.parse(fm.readString(slotsPath));
    const clean = defaultSlots();
    for (let i = 1; i <= SLOT_COUNT; i++) {
      const key = "slot" + i;
      const c = raw[key] || clean[key];
      clean[key] = {
        type: normalizeType(c.type),
        list: normalizeList(c.list),
        themeName: normalizeTheme(c.themeName)
      };
    }
    return clean;
  } catch (_) {
    const slots = defaultSlots();
    fm.writeString(slotsPath, JSON.stringify(slots, null, 2));
    return slots;
  }
}

function saveSlots(slots) {
  fm.writeString(slotsPath, JSON.stringify(slots, null, 2));
}

function loadWidgetConfigLegacy() {
  if (!fm.fileExists(configPath)) return defaultWidgetConfig();
  try {
    const c = JSON.parse(fm.readString(configPath));
    return {
      type: normalizeType(c.type),
      list: normalizeList(c.list),
      themeName: normalizeTheme(c.themeName)
    };
  } catch (_) {
    return defaultWidgetConfig();
  }
}

function loadWidgetConfig(slot) {
  const key = normalizeSlot(slot);
  return loadSlots()[key] || defaultWidgetConfig();
}

function saveWidgetConfig(c, slot) {
  const key = normalizeSlot(slot);
  const slots = loadSlots();
  slots[key] = {
    type: normalizeType(c.type),
    list: normalizeList(c.list),
    themeName: normalizeTheme(c.themeName)
  };
  saveSlots(slots);

  // Keep legacy slot1 config for older installs/actions.
  if (key === "slot1") {
    fm.writeString(configPath, JSON.stringify(slots[key], null, 2));
  }
}

function parseWidgetParameter(raw) {
  const parts = String(raw || "").toLowerCase().split("|").map(x => x.trim()).filter(Boolean);
  let slot = "slot1";
  for (const p of parts) {
    if (/^(?:slot)?\d{1,2}$/.test(p)) slot = normalizeSlot(p);
  }

  const saved = loadWidgetConfig(slot);
  let type = saved.type;
  let list = saved.list;
  let themeName = saved.themeName;

  for (const p of parts) {
    if (TYPES.includes(p)) type = p;
    else if (p === "personal" || p === "business") list = p;
    else if (THEMES[p]) themeName = p;
  }
  return { type, list, themeName, slot };
}

function fmtDate(date, format) {
  const df = new DateFormatter();
  df.locale = "en_US";
  df.dateFormat = format || "EEE, MMM d";
  return df.string(date || new Date());
}

function fmtDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const df = new DateFormatter();
  df.locale = "en_US";
  df.dateFormat = "MMM d · h:mm a";
  return df.string(d);
}

function fmtTime(date) {
  const df = new DateFormatter();
  df.locale = "en_US";
  df.useNoDateStyle();
  df.useShortTimeStyle();
  return df.string(date || new Date());
}

function scriptURL(params = {}) {
  const base = URLScheme.forRunningScript();
  const q = Object.entries(params)
    .map(([k,v]) => encodeURIComponent(k) + "=" + encodeURIComponent(String(v)))
    .join("&");
  return q ? base + (base.includes("?") ? "&" : "?") + q : base;
}

function openTasks(data, list) {
  return data.tasks
    .filter(t => t.list === list && !t.completed)
    .sort((a,b) => {
      if (a.due && b.due) return new Date(a.due) - new Date(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

function completedToday(data, list) {
  const today = new Date().toDateString();
  return data.tasks.filter(t =>
    t.list === list &&
    t.completed &&
    t.completedAt &&
    new Date(t.completedAt).toDateString() === today
  ).length;
}

async function scheduleTaskNotification(task) {
  if (!task.due) return;
  const when = new Date(task.due);
  if (Number.isNaN(when.getTime()) || when <= new Date()) return;
  const n = new Notification();
  n.identifier = "navios-" + task.id;
  n.title = listTitle(task.list);
  n.body = task.title;
  n.sound = "default";
  n.openURL = scriptURL({ action: "open", list: task.list });
  n.setTriggerDate(when);
  await n.schedule();
}

async function cancelTaskNotification(taskID) {
  try { await Notification.removePending(["navios-" + taskID]); } catch (_) {}
}

async function toggleTask(data, id) {
  const task = data.tasks.find(t => t.id === id);
  if (!task) return false;
  task.completed = !task.completed;
  task.completedAt = task.completed ? nowISO() : null;
  if (task.completed) await cancelTaskNotification(task.id);
  else await scheduleTaskNotification(task);
  saveData(data);
  return true;
}

async function addTaskFlow(data, initialList) {
  const a = new Alert();
  a.title = "New " + listTitle(initialList) + " Task";
  a.message = "Stored locally on this iPhone.";
  a.addTextField("Task", "");
  a.addTextField("Optional reminder: YYYY-MM-DD HH:MM", "");
  a.addAction("Add");
  a.addCancelAction("Cancel");
  const result = await a.present();
  if (result === -1) return false;

  const title = a.textFieldValue(0).trim();
  if (!title) return false;

  let due = null;
  const dueRaw = a.textFieldValue(1).trim();
  if (dueRaw) {
    const candidate = new Date(dueRaw.replace(" ", "T"));
    if (!Number.isNaN(candidate.getTime())) due = candidate.toISOString();
  }

  const task = { id: uid(), list: initialList, title, completed: false, due, createdAt: nowISO(), completedAt: null };
  data.tasks.push(task);
  saveData(data);
  await scheduleTaskNotification(task);
  return true;
}

async function editTaskFlow(data, task) {
  const a = new Alert();
  a.title = "Edit Task";
  a.addTextField("Task", task.title);
  a.addTextField("Reminder: YYYY-MM-DD HH:MM", task.due ? task.due.slice(0,16).replace("T"," ") : "");
  a.addAction("Save");
  a.addDestructiveAction("Delete");
  a.addCancelAction("Cancel");
  const result = await a.present();

  if (result === -1) return false;
  if (result === 1) {
    await cancelTaskNotification(task.id);
    data.tasks = data.tasks.filter(t => t.id !== task.id);
    saveData(data);
    return true;
  }

  const title = a.textFieldValue(0).trim();
  if (title) task.title = title;

  const dueRaw = a.textFieldValue(1).trim();
  task.due = null;
  if (dueRaw) {
    const candidate = new Date(dueRaw.replace(" ", "T"));
    if (!Number.isNaN(candidate.getTime())) task.due = candidate.toISOString();
  }

  await cancelTaskNotification(task.id);
  if (!task.completed) await scheduleTaskNotification(task);
  saveData(data);
  return true;
}

function baseWidget(t) {
  const w = new ListWidget();
  w.backgroundColor = C(t.bg);
  const p = familyPadding();
  w.setPadding(p[0], p[1], p[2], p[3]);
  w.spacing = 0;
  return w;
}

function addGradientDivider(widget, t, verticalPadding) {
  widget.addSpacer(verticalPadding == null ? 8 : verticalPadding);
  const line = widget.addStack();
  line.size = new Size(0, 1);
  const g = new LinearGradient();
  g.colors = [C(t.line, 0.52), C(t.line, 0.02)];
  g.locations = [0, 1];
  line.backgroundGradient = g;
  widget.addSpacer(verticalPadding == null ? 8 : verticalPadding);
}

function addHeader(widget, t, title, subtitle, metaURL) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const left = row.addStack();
  left.layoutVertically();

  if (subtitle) {
    const s = left.addText(subtitle.toUpperCase());
    s.font = Font.mediumSystemFont(8);
    s.textColor = C(t.secondary);
    s.lineLimit = 1;
  }

  const h = left.addText(title);
  h.font = displayFont(t, familyFont(19, 25, 30), "regular");
  h.textColor = C(t.text);
  h.lineLimit = 1;

  row.addSpacer();

  const m = row.addText(t.mark);
  m.font = Font.mediumSystemFont(8);
  m.textColor = C(t.accent);
  if (metaURL) m.url = metaURL;
}

function addCard(parent, t, padding) {
  const card = parent.addStack();
  card.backgroundColor = C(t.panel);
  card.cornerRadius = t.radius;
  const p = padding == null ? 10 : padding;
  card.setPadding(p, p, p, p);
  return card;
}

function addMetric(card, t, value, label, large) {
  card.layoutVertically();
  const v = card.addText(String(value));
  v.font = displayFont(t, large ? 25 : 18, "bold");
  v.textColor = C(t.text);
  v.lineLimit = 1;
  const l = card.addText(label.toUpperCase());
  l.font = Font.mediumSystemFont(7);
  l.textColor = C(t.secondary);
  l.lineLimit = 1;
}

function buildTasksWidget(data, opts) {
  const t = theme(opts.themeName);
  const family = config.widgetFamily || "medium";
  const w = baseWidget(t);

  addHeader(w, t, listTitle(opts.list), fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  addGradientDivider(w, t, family === "small" ? 5 : 7);

  const active = openTasks(data, opts.list);
  const maxRows = familyRows(2, 4, 7);

  if (!active.length) {
    w.addSpacer();
    const e = w.addText("Nothing pressing.");
    e.font = displayFont(t, 13, "regular");
    e.textColor = C(t.secondary);
    e.url = scriptURL({ action: "add", list: opts.list });
    w.addSpacer();
  } else {
    for (const task of active.slice(0, maxRows)) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();
      row.url = scriptURL({ action: "toggle", id: task.id, list: opts.list });
      row.setPadding(2, 0, 2, 0);

      const dot = row.addText("○");
      dot.font = Font.regularSystemFont(family === "small" ? 13 : 15);
      dot.textColor = C(t.accent);
      row.addSpacer(8);

      const col = row.addStack();
      col.layoutVertically();

      const tx = col.addText(task.title);
      tx.font = Font.mediumSystemFont(family === "small" ? 11 : 13);
      tx.textColor = C(t.text);
      tx.lineLimit = 1;
      tx.minimumScaleFactor = 0.72;

      const due = fmtDue(task.due);
      if (due && family !== "small") {
        const d = col.addText(due);
        d.font = Font.regularSystemFont(8);
        d.textColor = C(t.secondary);
      }
      row.addSpacer();
      w.addSpacer(family === "large" ? 6 : 5);
    }
  }

  if (family !== "small") {
    w.addSpacer();
    const footer = w.addStack();
    footer.layoutHorizontally();
    const add = footer.addText("＋  ADD");
    add.font = Font.semiboldSystemFont(9);
    add.textColor = C(t.secondary);
    add.url = scriptURL({ action: "add", list: opts.list });
    footer.addSpacer();
    const c = footer.addText(active.length + " OPEN");
    c.font = Font.mediumSystemFont(8);
    c.textColor = C(t.faint);
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  w.refreshAfterDate = new Date(Date.now() + 20 * 60 * 1000);
  return w;
}

function buildClockWidget(data, opts) {
  const t = theme(opts.themeName);
  const family = config.widgetFamily || "medium";
  const w = baseWidget(t);

  if (opts.themeName === "luxe" || opts.themeName === "editorial") {
    const label = w.addText(fmtDate(new Date(), "EEEE, MMMM d").toUpperCase());
    label.font = Font.mediumSystemFont(8);
    label.textColor = C(t.secondary);
    w.addSpacer(family === "small" ? 4 : 8);
  }

  const time = w.addText(fmtTime(new Date()));
  time.font = displayFont(t, family === "small" ? 38 : family === "large" ? 64 : 52, "bold");
  time.textColor = C(t.text);
  time.minimumScaleFactor = 0.65;
  time.lineLimit = 1;

  if (opts.themeName !== "luxe" && opts.themeName !== "editorial") {
    const day = w.addText(fmtDate(new Date(), "EEEE · MMM d"));
    day.font = Font.mediumSystemFont(9);
    day.textColor = C(t.secondary);
  }

  w.addSpacer();

  if (family !== "small") {
    const card = addCard(w, t, 11);
    card.layoutHorizontally();

    const left = card.addStack();
    addMetric(left, t, openTasks(data, "personal").length, "Personal", false);
    card.addSpacer();

    const mid = card.addStack();
    addMetric(mid, t, openTasks(data, "business").length, "Business", false);
    card.addSpacer();

    const right = card.addStack();
    addMetric(right, t, completedToday(data, opts.list), "Done today", false);
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  w.refreshAfterDate = new Date(Date.now() + 60 * 1000);
  return w;
}

const GOOGLE_DATA_URL = "https://navi-os-widgets.vercel.app/api/google/data";
const googleTokenPath = fm.joinPath(baseDir, "google-connection.txt");

function saveGoogleConnectionToken(token) {
  fm.writeString(googleTokenPath, String(token || "").trim());
}
function loadGoogleConnectionToken() {
  if (!fm.fileExists(googleTokenPath)) return "";
  try { return fm.readString(googleTokenPath).trim(); } catch (_) { return ""; }
}
async function loadGoogleLiveData() {
  const token = loadGoogleConnectionToken();
  if (!token) return { ok:false, error:"not_connected", gmail:[], drive:[], calendar:[] };
  try {
    const req = new Request(GOOGLE_DATA_URL + "?t=" + Date.now());
    req.headers = { Authorization: "Bearer " + token };
    req.timeoutInterval = 12;
    const payload = await req.loadJSON();
    if (!payload || payload.ok !== true) return { ok:false, error:payload && payload.error || "fetch_failed", gmail:[], drive:[], calendar:[] };
    return payload;
  } catch (_) {
    return { ok:false, error:"fetch_failed", gmail:[], drive:[], calendar:[] };
  }
}

async function loadGoogleCalendarFeed() {
  const data = await loadGoogleLiveData();
  return { ok:data.ok === true, events:Array.isArray(data.calendar)?data.calendar:[], updated_at:data.updated_at || null };
}
function eventTimeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return fmtDate(d, "h:mm a");
}

async function buildAgendaWidget(data, opts) {
  const t = theme(opts.themeName);
  const family = widgetFamily();
  const w = baseWidget(t);
  const feed = await loadGoogleCalendarFeed();

  addHeader(w, t, "Agenda", "GOOGLE CALENDAR", "https://calendar.google.com");
  addGradientDivider(w, t, 6);

  if (!feed.ok) {
    w.addSpacer();
    const title = w.addText("Google Calendar not connected");
    title.font = displayFont(t, family === "small" ? 13 : 15, "regular");
    title.textColor = C(t.text);
    const sub = w.addText("Connect the private Vercel calendar feed.");
    sub.font = Font.mediumSystemFont(8);
    sub.textColor = C(t.secondary);
    w.addSpacer();
    return w;
  }

  const events = feed.events || [];
  const maxRows = familyRows(2, 4, 6);

  if (!events.length) {
    w.addSpacer();
    const empty = w.addText("Your Google Calendar is clear.");
    empty.font = displayFont(t, 14, "regular");
    empty.textColor = C(t.secondary);
    w.addSpacer();
  } else {
    for (const event of events.slice(0,maxRows)) {
      const row=w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();
      if (event.url) row.url=event.url;

      const time=row.addText(eventTimeLabel(event.start));
      time.font=Font.semiboldSystemFont(8);
      time.textColor=C(t.accent);
      row.addSpacer(10);

      const title=row.addText(event.title || "Untitled");
      title.font=Font.mediumSystemFont(12);
      title.textColor=C(t.text);
      title.lineLimit=1;
      title.minimumScaleFactor=0.7;
      row.addSpacer();
      w.addSpacer(7);
    }
  }

  w.refreshAfterDate = new Date(Date.now() + 15*60*1000);
  return w;
}
function buildDashboardWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const label = w.addText("Today");
    label.font = displayFont(t, 18, "regular");
    label.textColor = C(t.text);
    w.addSpacer(8);
    const time = w.addText(fmtTime(new Date()));
    time.font = displayFont(t, 31, "bold");
    time.textColor = C(t.text);
    w.addSpacer();
    const meta = w.addText(openTasks(data, opts.list).length + " OPEN · " + completedToday(data, opts.list) + " DONE");
    meta.font = Font.mediumSystemFont(7);
    meta.textColor = C(t.secondary);
    w.url = scriptURL({ action: "open", list: opts.list });
    return w;
  }

  const t = theme(opts.themeName);
  const family = config.widgetFamily || "medium";
  const w = baseWidget(t);

  addHeader(w, t, "Overview", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(8);

  const top = w.addStack();
  top.layoutHorizontally();

  const clockCard = addCard(top, t, 10);
  clockCard.layoutVertically();
  const time = clockCard.addText(fmtTime(new Date()));
  time.font = displayFont(t, family === "small" ? 22 : 27, "bold");
  time.textColor = C(t.text);
  time.lineLimit = 1;
  const day = clockCard.addText(fmtDate(new Date(), "EEE · MMM d"));
  day.font = Font.mediumSystemFont(7);
  day.textColor = C(t.secondary);

  if (family !== "small") {
    top.addSpacer(8);
    const countCard = addCard(top, t, 10);
    addMetric(countCard, t, openTasks(data, opts.list).length, listTitle(opts.list) + " open", true);
  }

  w.addSpacer(8);

  if (family !== "small") {
    const bottom = w.addStack();
    bottom.layoutHorizontally();

    const personal = addCard(bottom, t, 9);
    addMetric(personal, t, openTasks(data, "personal").length, "Personal", false);
    bottom.addSpacer(8);

    const business = addCard(bottom, t, 9);
    addMetric(business, t, openTasks(data, "business").length, "Business", false);
    bottom.addSpacer(8);

    const done = addCard(bottom, t, 9);
    addMetric(done, t, completedToday(data, opts.list), "Done", false);
  }

  if (family === "large") {
    w.addSpacer(9);
    const next = openTasks(data, opts.list).slice(0, 3);
    for (const task of next) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.url = scriptURL({ action: "toggle", id: task.id, list: opts.list });
      const bullet = row.addText("○");
      bullet.textColor = C(t.accent);
      bullet.font = Font.regularSystemFont(13);
      row.addSpacer(7);
      const tx = row.addText(task.title);
      tx.font = Font.mediumSystemFont(11);
      tx.textColor = C(t.text);
      tx.lineLimit = 1;
      row.addSpacer();
      w.addSpacer(5);
    }
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
  return w;
}

function buildFocusWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const active = openTasks(data, opts.list);
  const next = active[0];

  addHeader(w, t, "Focus", listTitle(opts.list), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(10);

  const card = addCard(w, t, 12);
  card.layoutVertically();

  const label = card.addText(next ? "NEXT" : "CLEAR");
  label.font = Font.semiboldSystemFont(8);
  label.textColor = C(t.secondary);

  card.addSpacer(5);

  const title = card.addText(next ? next.title : "Nothing pressing.");
  title.font = displayFont(t, 21, "regular");
  title.textColor = C(t.text);
  title.lineLimit = 2;
  title.minimumScaleFactor = 0.72;

  if (next && next.due) {
    card.addSpacer(5);
    const due = card.addText(fmtDue(next.due) || "");
    due.font = Font.regularSystemFont(8);
    due.textColor = C(t.secondary);
  }

  w.addSpacer();

  const footer = w.addStack();
  footer.layoutHorizontally();
  const open = footer.addText(active.length + " OPEN");
  open.font = Font.mediumSystemFont(8);
  open.textColor = C(t.faint);
  footer.addSpacer();
  const done = footer.addText(completedToday(data, opts.list) + " DONE TODAY");
  done.font = Font.mediumSystemFont(8);
  done.textColor = C(t.faint);

  if (next) w.url = scriptURL({ action: "toggle", id: next.id, list: opts.list });
  else w.url = scriptURL({ action: "add", list: opts.list });

  w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  return w;
}

function buildStatusWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);

  addHeader(w, t, "Status", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(10);

  const row = w.addStack();
  row.layoutHorizontally();

  const battery = addCard(row, t, 10);
  addMetric(battery, t, Math.round(Device.batteryLevel() * 100) + "%", "Battery", true);

  row.addSpacer(8);

  const tasks = addCard(row, t, 10);
  addMetric(tasks, t, openTasks(data, opts.list).length, listTitle(opts.list) + " open", true);

  w.addSpacer(8);

  const lower = w.addStack();
  lower.layoutHorizontally();

  const personal = addCard(lower, t, 9);
  addMetric(personal, t, openTasks(data, "personal").length, "Personal", false);

  lower.addSpacer(8);

  const business = addCard(lower, t, 9);
  addMetric(business, t, openTasks(data, "business").length, "Business", false);

  lower.addSpacer(8);

  const time = addCard(lower, t, 9);
  addMetric(time, t, fmtTime(new Date()), "Time", false);

  w.url = scriptURL({ action: "open", list: opts.list });
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
  return w;
}

function buildCompactWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const active = openTasks(data, opts.list);

  const top = w.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();

  const date = top.addText(fmtDate(new Date(), "EEE · MMM d").toUpperCase());
  date.font = Font.mediumSystemFont(8);
  date.textColor = C(t.secondary);

  top.addSpacer();

  const count = top.addText(active.length + " OPEN");
  count.font = Font.mediumSystemFont(8);
  count.textColor = C(t.accent);

  w.addSpacer(8);

  const title = w.addText(listTitle(opts.list));
  title.font = displayFont(t, 25, "regular");
  title.textColor = C(t.text);

  w.addSpacer(6);

  const next = active.slice(0, 2);
  for (const task of next) {
    const row = w.addStack();
    row.layoutHorizontally();
    row.url = scriptURL({ action: "toggle", id: task.id, list: opts.list });

    const bullet = row.addText("○");
    bullet.font = Font.regularSystemFont(13);
    bullet.textColor = C(t.accent);

    row.addSpacer(7);

    const tx = row.addText(task.title);
    tx.font = Font.mediumSystemFont(11);
    tx.textColor = C(t.text);
    tx.lineLimit = 1;

    row.addSpacer();
    w.addSpacer(5);
  }

  if (!next.length) {
    const clear = w.addText("Nothing pressing.");
    clear.font = Font.regularSystemFont(11);
    clear.textColor = C(t.secondary);
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  return w;
}


function dueTodayTasks(data, list) {
  const today = new Date().toDateString();
  return openTasks(data, list).filter(t => t.due && new Date(t.due).toDateString() === today);
}

function dueTomorrowTasks(data, list) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const tomorrow = d.toDateString();
  return openTasks(data, list).filter(t => t.due && new Date(t.due).toDateString() === tomorrow);
}

function allCompleted(data, list) {
  return data.tasks
    .filter(t => t.list === list && t.completed)
    .sort((a,b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
}

function relativeDue(iso) {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "DUE";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins + "m";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h " + (mins % 60) + "m";
  return Math.floor(hrs / 24) + "d";
}

function addSimpleTaskRows(w, t, tasks, list, maxRows) {
  for (const task of tasks.slice(0, maxRows)) {
    const row = w.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    row.url = scriptURL({ action: "toggle", id: task.id, list });

    const bullet = row.addText("○");
    bullet.font = Font.regularSystemFont(13);
    bullet.textColor = C(t.accent);

    row.addSpacer(7);

    const tx = row.addText(task.title);
    tx.font = Font.mediumSystemFont(11);
    tx.textColor = C(t.text);
    tx.lineLimit = 1;
    tx.minimumScaleFactor = 0.7;

    row.addSpacer();

    if (task.due) {
      const due = row.addText(relativeDue(task.due));
      due.font = Font.mediumSystemFont(7);
      due.textColor = C(t.secondary);
    }

    w.addSpacer(5);
  }
}

function buildTodayWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const todays = dueTodayTasks(data, opts.list);
  const source = todays.length ? todays : openTasks(data, opts.list);

  addHeader(w, t, "Today", fmtDate(new Date(), "EEEE · MMM d"), scriptURL({ action: "open", list: opts.list }));
  addGradientDivider(w, t, 6);
  addSimpleTaskRows(w, t, source, opts.list, familyRows(2, 4, 6));

  w.addSpacer();
  const footer = w.addStack();
  footer.layoutHorizontally();
  const left = footer.addText(source.length + " ACTIVE");
  left.font = Font.mediumSystemFont(8);
  left.textColor = C(t.faint);
  footer.addSpacer();
  const right = footer.addText(completedToday(data, opts.list) + " DONE");
  right.font = Font.mediumSystemFont(8);
  right.textColor = C(t.faint);

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildSplitWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const p = w.addText(openTasks(data, "personal").length + "  Personal");
    p.font = displayFont(t, 17, "regular");
    p.textColor = C(t.text);
    w.addSpacer(8);
    const b = w.addText(openTasks(data, "business").length + "  Business");
    b.font = displayFont(t, 17, "regular");
    b.textColor = C(t.text);
    w.addSpacer();
    const meta = w.addText("OVERVIEW");
    meta.font = Font.mediumSystemFont(7);
    meta.textColor = C(t.secondary);
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);

  addHeader(w, t, "Personal / Business", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(9);

  const row = w.addStack();
  row.layoutHorizontally();

  const personal = addCard(row, t, 10);
  personal.layoutVertically();
  const pTitle = personal.addText("Personal");
  pTitle.font = displayFont(t, 16, "regular");
  pTitle.textColor = C(t.text);
  const pCount = personal.addText(openTasks(data, "personal").length + " open");
  pCount.font = Font.mediumSystemFont(8);
  pCount.textColor = C(t.secondary);

  row.addSpacer(8);

  const business = addCard(row, t, 10);
  business.layoutVertically();
  const bTitle = business.addText("Business");
  bTitle.font = displayFont(t, 16, "regular");
  bTitle.textColor = C(t.text);
  const bCount = business.addText(openTasks(data, "business").length + " open");
  bCount.font = Font.mediumSystemFont(8);
  bCount.textColor = C(t.secondary);

  w.addSpacer(10);

  const nextP = openTasks(data, "personal")[0];
  const nextB = openTasks(data, "business")[0];
  if (nextP) {
    const r = w.addStack(); r.layoutHorizontally();
    const l = r.addText("P"); l.font = Font.semiboldSystemFont(8); l.textColor = C(t.accent);
    r.addSpacer(8);
    const x = r.addText(nextP.title); x.font = Font.mediumSystemFont(10); x.textColor = C(t.text); x.lineLimit = 1;
    r.url = scriptURL({ action: "toggle", id: nextP.id, list: "personal" });
    w.addSpacer(5);
  }
  if (nextB) {
    const r = w.addStack(); r.layoutHorizontally();
    const l = r.addText("B"); l.font = Font.semiboldSystemFont(8); l.textColor = C(t.accent);
    r.addSpacer(8);
    const x = r.addText(nextB.title); x.font = Font.mediumSystemFont(10); x.textColor = C(t.text); x.lineLimit = 1;
    r.url = scriptURL({ action: "toggle", id: nextB.id, list: "business" });
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildWeeklyWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const title = w.addText("Week");
    title.font = displayFont(t, 20, "regular");
    title.textColor = C(t.text);
    w.addSpacer(8);
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const count = openTasks(data, opts.list).filter(x => x.due && new Date(x.due).toDateString() === d.toDateString()).length;
      const row = w.addText(fmtDate(d, "EEE d") + " · " + count);
      row.font = Font.mediumSystemFont(9);
      row.textColor = i === 0 ? C(t.accent) : C(t.secondary);
      w.addSpacer(4);
    }
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Week", "NEXT 7 DAYS", scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(10);

  const strip = w.addStack();
  strip.layoutHorizontally();

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const day = strip.addStack();
    day.layoutVertically();
    day.centerAlignContent();

    const label = day.addText(fmtDate(d, "EE").toUpperCase());
    label.font = Font.mediumSystemFont(7);
    label.textColor = C(t.secondary);

    const number = day.addText(fmtDate(d, "d"));
    number.font = displayFont(t, 15, "regular");
    number.textColor = C(t.text);

    const count = openTasks(data, opts.list).filter(x => x.due && new Date(x.due).toDateString() === d.toDateString()).length;
    const c = day.addText(count ? String(count) : "·");
    c.font = Font.semiboldSystemFont(8);
    c.textColor = count ? C(t.accent) : C(t.faint);

    if (i < 6) strip.addSpacer();
  }

  w.addSpacer(12);
  addSimpleTaskRows(w, t, openTasks(data, opts.list).filter(x => x.due), opts.list, 2);
  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildProgressWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const listTasks = data.tasks.filter(x => x.list === opts.list);
    const done = listTasks.filter(x => x.completed).length;
    const total = listTasks.length;
    const pct = total ? Math.round((done / total) * 100) : 100;
    const big = w.addText(pct + "%");
    big.font = displayFont(t, 38, "bold");
    big.textColor = C(t.text);
    const label = w.addText("PROGRESS");
    label.font = Font.mediumSystemFont(7);
    label.textColor = C(t.secondary);
    w.addSpacer();
    const meta = w.addText(openTasks(data, opts.list).length + " OPEN");
    meta.font = Font.mediumSystemFont(8);
    meta.textColor = C(t.accent);
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const listTasks = data.tasks.filter(x => x.list === opts.list);
  const done = listTasks.filter(x => x.completed).length;
  const total = listTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 100;

  addHeader(w, t, "Progress", listTitle(opts.list), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(10);

  const big = w.addText(pct + "%");
  big.font = displayFont(t, (config.widgetFamily || "medium") === "small" ? 34 : 48, "bold");
  big.textColor = C(t.text);

  const bar = w.addStack();
  bar.size = new Size(0, 5);
  bar.backgroundColor = C(t.panel2);
  bar.cornerRadius = 3;

  const fill = bar.addStack();
  fill.size = new Size(Math.max(10, 250 * pct / 100), 5);
  fill.backgroundColor = C(t.accent);
  fill.cornerRadius = 3;

  w.addSpacer(8);
  const meta = w.addText(done + " COMPLETED · " + openTasks(data, opts.list).length + " OPEN");
  meta.font = Font.mediumSystemFont(8);
  meta.textColor = C(t.secondary);
  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildMorningWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : "Day plan";

  const g = w.addText(greeting);
  g.font = displayFont(t, 25, "regular");
  g.textColor = C(t.text);

  const date = w.addText(fmtDate(new Date(), "EEEE · MMM d"));
  date.font = Font.mediumSystemFont(8);
  date.textColor = C(t.secondary);

  w.addSpacer(10);

  const time = w.addText(fmtTime(new Date()));
  time.font = displayFont(t, 34, "bold");
  time.textColor = C(t.text);

  w.addSpacer(10);
  addSimpleTaskRows(w, t, openTasks(data, opts.list), opts.list, familyRows(1, 3, 5));
  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildNightWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Tomorrow", "NIGHT RESET", scriptURL({ action: "open", list: opts.list }));
  addGradientDivider(w, t, 6);

  const tomorrow = dueTomorrowTasks(data, opts.list);
  const source = tomorrow.length ? tomorrow : openTasks(data, opts.list);

  addSimpleTaskRows(w, t, source, opts.list, familyRows(2, 4, 6));
  w.addSpacer();
  const done = w.addText(completedToday(data, opts.list) + " completed today");
  done.font = Font.mediumSystemFont(8);
  done.textColor = C(t.faint);
  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildFollowupWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Follow Ups", "BUSINESS", scriptURL({ action: "open", list: "business" }));
  addGradientDivider(w, t, 6);

  const rx = /(follow|call|email|text|reply|check|contact|send|reach)/i;
  let tasks = openTasks(data, "business").filter(x => rx.test(x.title));
  if (!tasks.length) tasks = openTasks(data, "business");

  addSimpleTaskRows(w, t, tasks, "business", familyRows(2, 4, 6));
  w.url = scriptURL({ action: "open", list: "business" });
  return w;
}

async function buildCalendarWidget(data, opts) {
  const t=theme(opts.themeName);
  const w=baseWidget(t);
  const feed=await loadGoogleCalendarFeed();

  addHeader(w,t,fmtDate(new Date(),"MMMM"),"GOOGLE CALENDAR","https://calendar.google.com");
  w.addSpacer(9);

  const strip=w.addStack();
  strip.layoutHorizontally();
  for(let i=0;i<7;i++){
    const d=new Date(); d.setDate(d.getDate()+i);
    const cell=strip.addStack();
    cell.layoutVertically(); cell.centerAlignContent();
    const a=cell.addText(fmtDate(d,"E").slice(0,1));
    a.font=Font.mediumSystemFont(7); a.textColor=C(t.secondary);
    const b=cell.addText(fmtDate(d,"d"));
    b.font=displayFont(t,14,"regular"); b.textColor=i===0?C(t.accent):C(t.text);
    if(i<6)strip.addSpacer();
  }

  w.addSpacer(12);

  if(!feed.ok){
    const x=w.addText("Google Calendar not connected");
    x.font=Font.mediumSystemFont(10); x.textColor=C(t.secondary);
    return w;
  }

  const events=(feed.events||[]).slice(0,familyRows(1,3,5));
  if(!events.length){
    const x=w.addText("No upcoming Google Calendar events.");
    x.font=Font.mediumSystemFont(10); x.textColor=C(t.secondary);
  }else{
    for(const event of events){
      const row=w.addStack(); row.layoutHorizontally(); row.centerAlignContent();
      if(event.url)row.url=event.url;
      const time=row.addText(eventTimeLabel(event.start));
      time.font=Font.semiboldSystemFont(8); time.textColor=C(t.accent);
      row.addSpacer(8);
      const title=row.addText(event.title||"Untitled");
      title.font=Font.mediumSystemFont(10); title.textColor=C(t.text); title.lineLimit=1;
      row.addSpacer(); w.addSpacer(6);
    }
  }
  w.refreshAfterDate=new Date(Date.now()+15*60*1000);
  return w;
}
function buildMinimalClockWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const family = config.widgetFamily || "medium";

  const date = w.addText(fmtDate(new Date(), "EEEE, MMMM d").toUpperCase());
  date.font = Font.mediumSystemFont(8);
  date.textColor = C(t.secondary);

  w.addSpacer(family === "small" ? 4 : 8);

  const time = w.addText(fmtTime(new Date()));
  time.font = displayFont(t, family === "small" ? 40 : 60, "bold");
  time.textColor = C(t.text);
  time.minimumScaleFactor = 0.65;

  w.addSpacer();

  const meta = w.addText(openTasks(data, "personal").length + " PERSONAL · " + openTasks(data, "business").length + " BUSINESS");
  meta.font = Font.mediumSystemFont(7);
  meta.textColor = C(t.faint);

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildUtilityWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const battery = w.addText(Math.round(Device.batteryLevel() * 100) + "%");
    battery.font = displayFont(t, 34, "bold");
    battery.textColor = C(t.text);
    const label = w.addText("BATTERY");
    label.font = Font.mediumSystemFont(7);
    label.textColor = C(t.secondary);
    w.addSpacer();
    const meta = w.addText(openTasks(data, opts.list).length + " TASKS");
    meta.font = Font.mediumSystemFont(8);
    meta.textColor = C(t.accent);
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Utility", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(8);

  const row1 = w.addStack(); row1.layoutHorizontally();
  const a = addCard(row1, t, 9); addMetric(a, t, Math.round(Device.batteryLevel() * 100) + "%", "Battery", true);
  row1.addSpacer(8);
  const b = addCard(row1, t, 9); addMetric(b, t, fmtTime(new Date()), "Time", true);

  w.addSpacer(8);

  const row2 = w.addStack(); row2.layoutHorizontally();
  const c = addCard(row2, t, 9); addMetric(c, t, openTasks(data, "personal").length, "Personal", false);
  row2.addSpacer(8);
  const d = addCard(row2, t, 9); addMetric(d, t, openTasks(data, "business").length, "Business", false);

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildControlCenterWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const label = w.addText("CONTROL");
    label.font = Font.mediumSystemFont(7);
    label.textColor = C(t.secondary);
    w.addSpacer(4);
    const time = w.addText(fmtTime(new Date()));
    time.font = displayFont(t, 29, "bold");
    time.textColor = C(t.text);
    w.addSpacer();
    const meta = w.addText(Math.round(Device.batteryLevel() * 100) + "% · " + openTasks(data, opts.list).length + " OPEN");
    meta.font = Font.mediumSystemFont(7);
    meta.textColor = C(t.accent);
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Control Center", "STATUS", scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(8);

  const grid1 = w.addStack(); grid1.layoutHorizontally();
  const time = addCard(grid1, t, 9); addMetric(time, t, fmtTime(new Date()), "Time", false);
  grid1.addSpacer(8);
  const battery = addCard(grid1, t, 9); addMetric(battery, t, Math.round(Device.batteryLevel() * 100) + "%", "Battery", false);
  grid1.addSpacer(8);
  const open = addCard(grid1, t, 9); addMetric(open, t, openTasks(data, opts.list).length, "Open", false);

  w.addSpacer(8);

  const grid2 = w.addStack(); grid2.layoutHorizontally();
  const p = addCard(grid2, t, 9); addMetric(p, t, openTasks(data, "personal").length, "Personal", false);
  grid2.addSpacer(8);
  const b = addCard(grid2, t, 9); addMetric(b, t, openTasks(data, "business").length, "Business", false);
  grid2.addSpacer(8);
  const done = addCard(grid2, t, 9); addMetric(done, t, completedToday(data, opts.list), "Done", false);

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildLauncherWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const plus = w.addText("＋");
    plus.font = displayFont(t, 38, "regular");
    plus.textColor = C(t.accent);
    const title = w.addText("Quick Add");
    title.font = displayFont(t, 17, "regular");
    title.textColor = C(t.text);
    w.addSpacer();
    const meta = w.addText("Tap to open");
    meta.font = Font.mediumSystemFont(7);
    meta.textColor = C(t.secondary);
    w.url = scriptURL({ action: "open", list: opts.list });
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Launcher", "QUICK ACTIONS", scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(9);

  const actions = [
    ["＋", "Add Personal", scriptURL({ action: "add", list: "personal" })],
    ["＋", "Add Business", scriptURL({ action: "add", list: "business" })],
    ["○", "Personal Tasks", scriptURL({ action: "open", list: "personal" })],
    ["□", "Business Tasks", scriptURL({ action: "open", list: "business" })]
  ];

  for (const item of actions) {
    const row = addCard(w, t, 8);
    row.layoutHorizontally();
    row.url = item[2];
    const icon = row.addText(item[0]); icon.font = Font.semiboldSystemFont(11); icon.textColor = C(t.accent);
    row.addSpacer(8);
    const label = row.addText(item[1]); label.font = Font.mediumSystemFont(10); label.textColor = C(t.text);
    row.addSpacer();
    w.addSpacer(6);
  }

  return w;
}

function buildNoteWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Daily Note", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(12);

  const source = openTasks(data, opts.list)[0];
  const quote = source ? source.title : "Nothing pressing. Keep the day clear.";

  const note = w.addText(quote);
  note.font = displayFont(t, 22, "regular");
  note.textColor = C(t.text);
  note.lineLimit = 4;
  note.minimumScaleFactor = 0.72;

  w.addSpacer();

  const foot = w.addText(listTitle(opts.list).toUpperCase());
  foot.font = Font.mediumSystemFont(7);
  foot.textColor = C(t.faint);
  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildQuickAddWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Quick Add", "ONE TAP", scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(10);

  const p = addCard(w, t, 12);
  p.layoutHorizontally();
  p.url = scriptURL({ action: "add", list: "personal" });
  const p1 = p.addText("＋"); p1.font = Font.semiboldSystemFont(14); p1.textColor = C(t.accent);
  p.addSpacer(10);
  const p2 = p.addText("Personal task"); p2.font = Font.mediumSystemFont(12); p2.textColor = C(t.text);

  w.addSpacer(8);

  const b = addCard(w, t, 12);
  b.layoutHorizontally();
  b.url = scriptURL({ action: "add", list: "business" });
  const b1 = b.addText("＋"); b1.font = Font.semiboldSystemFont(14); b1.textColor = C(t.accent);
  b.addSpacer(10);
  const b2 = b.addText("Business task"); b2.font = Font.mediumSystemFont(12); b2.textColor = C(t.text);

  return w;
}

function buildCompletedWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Completed", listTitle(opts.list), scriptURL({ action: "open", list: opts.list }));
  addGradientDivider(w, t, 6);

  const done = allCompleted(data, opts.list);
  if (!done.length) {
    const empty = w.addText("Nothing completed yet.");
    empty.font = Font.regularSystemFont(11);
    empty.textColor = C(t.secondary);
  } else {
    for (const task of done.slice(0, 5)) {
      const row = w.addStack(); row.layoutHorizontally();
      const check = row.addText("✓"); check.font = Font.mediumSystemFont(11); check.textColor = C(t.accent);
      row.addSpacer(8);
      const tx = row.addText(task.title); tx.font = Font.mediumSystemFont(10); tx.textColor = C(t.secondary); tx.lineLimit = 1;
      row.addSpacer();
      w.addSpacer(5);
    }
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}

function buildEssentialsWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Essentials", "PERSONAL", scriptURL({ action: "open", list: "personal" }));
  addGradientDivider(w, t, 6);
  addSimpleTaskRows(w, t, openTasks(data, "personal"), "personal", familyRows(2, 4, 6));
  w.url = scriptURL({ action: "open", list: "personal" });
  return w;
}

function buildCountdownWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  const next = openTasks(data, opts.list).find(x => x.due);

  addHeader(w, t, "Countdown", listTitle(opts.list), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(12);

  if (!next) {
    const clear = w.addText("No timed task.");
    clear.font = displayFont(t, 20, "regular");
    clear.textColor = C(t.secondary);
  } else {
    const time = w.addText(relativeDue(next.due));
    time.font = displayFont(t, 46, "bold");
    time.textColor = C(t.text);
    w.addSpacer(6);
    const title = w.addText(next.title);
    title.font = Font.mediumSystemFont(11);
    title.textColor = C(t.secondary);
    title.lineLimit = 2;
    w.url = scriptURL({ action: "toggle", id: next.id, list: opts.list });
  }
  return w;
}

function buildOverviewWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const p = w.addText(openTasks(data, "personal").length + " / " + openTasks(data, "business").length);
    p.font = displayFont(t, 34, "bold");
    p.textColor = C(t.text);
    const label = w.addText("PERSONAL / BUSINESS");
    label.font = Font.mediumSystemFont(7);
    label.textColor = C(t.secondary);
    w.addSpacer();
    const done = w.addText(completedToday(data, opts.list) + " DONE TODAY");
    done.font = Font.mediumSystemFont(8);
    done.textColor = C(t.accent);
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Overview", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(8);

  const row = w.addStack(); row.layoutHorizontally();
  const p = addCard(row, t, 10); addMetric(p, t, openTasks(data, "personal").length, "Personal", true);
  row.addSpacer(8);
  const b = addCard(row, t, 10); addMetric(b, t, openTasks(data, "business").length, "Business", true);

  w.addSpacer(9);
  addSimpleTaskRows(w, t, openTasks(data, opts.list), opts.list, familyRows(1, 3, 5));

  w.url = scriptURL({ action: "open", list: opts.list });
  return w;
}


function chatGPTURL() {
  return "com.openai.chat://";
}

async function dictateToChatGPT() {
  const spoken = await Dictation.start("en");
  const text = String(spoken || "").trim();
  if (!text) return false;

  try { Pasteboard.copyString(text); } catch (_) {}

  Safari.open(chatGPTURL());
  return true;
}

async function typeToChatGPT() {
  const a = new Alert();
  a.title = "Ask ChatGPT";
  a.addTextField("Ask anything", "");
  a.addAction("Open in ChatGPT");
  a.addCancelAction("Cancel");
  const result = await a.present();
  if (result < 0) return false;

  const text = a.textFieldValue(0).trim();
  if (!text) return false;

  try { Pasteboard.copyString(text); } catch (_) {}

  Safari.open(chatGPTURL());
  return true;
}

function buildChatGPTWidget(data, opts) {
  const t = theme(opts.themeName);
  const family = widgetFamily();
  const w = baseWidget(t);

  if (family === "small") {
    const logo = w.addText("◎");
    logo.font = displayFont(t, 30, "regular");
    logo.textColor = C(t.accent);

    w.addSpacer(6);

    const title = w.addText("Ask ChatGPT");
    title.font = displayFont(t, 18, "regular");
    title.textColor = C(t.text);

    w.addSpacer();

    const mic = w.addText("MIC · DICTATE");
    mic.font = Font.semiboldSystemFont(8);
    mic.textColor = C(t.secondary);
    mic.url = scriptURL({ action: "chatgptDictate" });

    w.url = scriptURL({ action: "chatgptDictate" });
    return w;
  }

  const top = w.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();

  const logo = top.addText("◎");
  logo.font = displayFont(t, family === "large" ? 28 : 24, "regular");
  logo.textColor = C(t.accent);

  top.addSpacer(9);

  const title = top.addText("Ask ChatGPT");
  title.font = displayFont(t, family === "large" ? 25 : 21, "regular");
  title.textColor = C(t.text);

  top.addSpacer();

  const mic = top.addText("●");
  mic.font = Font.mediumSystemFont(12);
  mic.textColor = C(t.accent);
  mic.url = scriptURL({ action: "chatgptDictate" });

  w.addSpacer(11);

  const actions = w.addStack();
  actions.layoutHorizontally();

  const dictate = addCard(actions, t, 10);
  dictate.layoutVertically();
  dictate.url = scriptURL({ action: "chatgptDictate" });
  const d1 = dictate.addText("MIC");
  d1.font = Font.semiboldSystemFont(8);
  d1.textColor = C(t.secondary);
  const d2 = dictate.addText("Dictate");
  d2.font = displayFont(t, family === "large" ? 18 : 15, "regular");
  d2.textColor = C(t.text);

  actions.addSpacer(8);

  const ask = addCard(actions, t, 10);
  ask.layoutVertically();
  ask.url = scriptURL({ action: "chatgptType" });
  const a1 = ask.addText("TEXT");
  a1.font = Font.semiboldSystemFont(8);
  a1.textColor = C(t.secondary);
  const a2 = ask.addText("Ask");
  a2.font = displayFont(t, family === "large" ? 18 : 15, "regular");
  a2.textColor = C(t.text);

  if (family === "large") {
    w.addSpacer(8);

    const lower = w.addStack();
    lower.layoutHorizontally();

    const camera = addCard(lower, t, 10);
    camera.layoutVertically();
    camera.url = "com.openai.chat://";
    const c1 = camera.addText("CAMERA");
    c1.font = Font.semiboldSystemFont(8);
    c1.textColor = C(t.secondary);
    const c2 = camera.addText("Open ChatGPT");
    c2.font = Font.mediumSystemFont(11);
    c2.textColor = C(t.text);

    lower.addSpacer(8);

    const drive = addCard(lower, t, 10);
    drive.layoutVertically();
    drive.url = "https://docs.google.com/document/d/1T2twulKoTevf4TMBxAtnkC54uixROyI_Z3nhNQjZuX4/edit";
    const g1 = drive.addText("DRIVE");
    g1.font = Font.semiboldSystemFont(8);
    g1.textColor = C(t.secondary);
    const g2 = drive.addText("Hard Rock Hub");
    g2.font = Font.mediumSystemFont(11);
    g2.textColor = C(t.text);

    w.addSpacer(8);

    const caseRow = w.addStack();
    caseRow.layoutHorizontally();

    const checkpoint = addCard(caseRow, t, 9);
    checkpoint.layoutVertically();
    checkpoint.url = "https://docs.google.com/document/d/10viUGHubi9jD12K9yIgR4IvFh3nW8UjlUfXu0k-FhIA/edit";
    const cp1 = checkpoint.addText("CHECKPOINT");
    cp1.font = Font.semiboldSystemFont(8);
    cp1.textColor = C(t.secondary);
    const cp2 = checkpoint.addText("Current case notes");
    cp2.font = Font.mediumSystemFont(10);
    cp2.textColor = C(t.text);

    caseRow.addSpacer(8);

    const chat = addCard(caseRow, t, 9);
    chat.layoutVertically();
    chat.url = scriptURL({ action: "chatgptDictate" });
    const ch1 = chat.addText("DICTATE");
    ch1.font = Font.semiboldSystemFont(8);
    ch1.textColor = C(t.secondary);
    const ch2 = chat.addText("Ask about case");
    ch2.font = Font.mediumSystemFont(10);
    ch2.textColor = C(t.text);
  }

  w.url = scriptURL({ action: "chatgptDictate" });
  return w;
}


const CASE_ACTIVITY_FEED_URL = "https://raw.githubusercontent.com/shaya99stern-hash/NaviOS-Widgets/main/data/case-activity.json";
const CASE_ACTIVITY_FALLBACK = {
  updated_at: null,
  status: "Connected",
  progress: null,
  items: [],
  links: {
    hub: "https://docs.google.com/document/d/1T2twulKoTevf4TMBxAtnkC54uixROyI_Z3nhNQjZuX4/edit",
    checkpoint: "https://docs.google.com/document/d/10viUGHubi9jD12K9yIgR4IvFh3nW8UjlUfXu0k-FhIA/edit"
  }
};

async function loadCaseActivityFeed() {
  const live = await loadGoogleLiveData();
  if (live.ok) {
    const items = [];
    for (const f of (live.drive || []).slice(0,6)) {
      items.push({
        kind:"file",
        title:f.name || "Drive file updated",
        subtitle:"Google Drive",
        timestamp:f.modifiedTime || null,
        url:f.webViewLink || null
      });
    }
    for (const m of (live.gmail || []).slice(0,4)) {
      items.push({
        kind:"message",
        title:(m.from ? "Email from " + m.from.replace(/<.*?>/g,"").trim() : "New email"),
        subtitle:m.subject || m.snippet || "",
        timestamp:m.date || null,
        url:"https://mail.google.com/"
      });
    }
    items.sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0));
    return {
      updated_at:live.updated_at || new Date().toISOString(),
      status:"Connected",
      progress:null,
      items:items.slice(0,8),
      links:{
        hub:"https://drive.google.com/drive/my-drive",
        checkpoint:"https://mail.google.com/"
      },
      source:"google-live"
    };
  }

  try {
    const req = new Request(CASE_ACTIVITY_FEED_URL + "?t=" + Date.now());
    req.timeoutInterval = 8;
    const payload = await req.loadJSON();
    if (!payload || !Array.isArray(payload.items)) return CASE_ACTIVITY_FALLBACK;
    return payload;
  } catch (_) {
    return CASE_ACTIVITY_FALLBACK;
  }
}
function relativeTimeFromISO(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "now";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

function activityIcon(kind) {
  const map = {
    file: "▣",
    doc: "□",
    message: "▢",
    sync: "✓",
    reminder: "◷",
    update: "•"
  };
  return map[kind] || "•";
}

async function buildCaseActivityWidget(opts) {
  const t = theme(opts.themeName);
  const family = widgetFamily();
  const feed = await loadCaseActivityFeed();
  const w = baseWidget(t);
  const items = (feed.items || []).slice(0, family === "small" ? 1 : family === "large" ? 5 : 2);
  const updated = feed.updated_at ? relativeTimeFromISO(feed.updated_at) : "";

  if (family === "small") {
    const top = w.addStack();
    top.layoutHorizontally();

    const folder = top.addText("▣");
    folder.font = displayFont(t, 24, "regular");
    folder.textColor = C(t.accent);

    top.addSpacer();

    const live = top.addText(feed.status || "Connected");
    live.font = Font.mediumSystemFont(8);
    live.textColor = C(t.secondary);

    w.addSpacer(10);

    const title = w.addText("Case Activity");
    title.font = displayFont(t, 18, "regular");
    title.textColor = C(t.text);

    w.addSpacer(8);

    if (items.length) {
      const item = items[0];
      const row = w.addStack();
      row.layoutHorizontally();
      const icon = row.addText(activityIcon(item.kind));
      icon.font = Font.semiboldSystemFont(10);
      icon.textColor = C(t.accent);
      row.addSpacer(7);
      const text = row.addText(item.title || "Recent update");
      text.font = Font.mediumSystemFont(9);
      text.textColor = C(t.text);
      text.lineLimit = 2;
    } else {
      const empty = w.addText("No recent updates");
      empty.font = Font.mediumSystemFont(9);
      empty.textColor = C(t.secondary);
    }

    w.addSpacer();

    const foot = w.addText(updated ? "UPDATED " + updated.toUpperCase() : "DRIVE");
    foot.font = Font.mediumSystemFont(7);
    foot.textColor = C(t.faint);

    w.url = feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub;
    w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
    return w;
  }

  addHeader(w, t, "Recent Activity", updated ? "UPDATED " + updated.toUpperCase() : "DRIVE", feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub);

  if (feed.progress !== null && feed.progress !== undefined) {
    w.addSpacer(8);
    const bar = w.addStack();
    bar.size = new Size(0, 5);
    bar.backgroundColor = C(t.panel2);
    bar.cornerRadius = 3;
    const fill = bar.addStack();
    const pct = Math.max(0, Math.min(100, Number(feed.progress) || 0));
    fill.size = new Size(Math.max(8, 250 * pct / 100), 5);
    fill.backgroundColor = C(t.accent);
    fill.cornerRadius = 3;

    const p = w.addText(String(Math.round(pct)) + "%");
    p.font = Font.mediumSystemFont(8);
    p.textColor = C(t.secondary);
  }

  w.addSpacer(10);

  if (!items.length) {
    const empty = w.addText("No recent Drive updates.");
    empty.font = Font.mediumSystemFont(10);
    empty.textColor = C(t.secondary);
  } else {
    for (const item of items) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const iconBox = addCard(row, t, 7);
      const icon = iconBox.addText(activityIcon(item.kind));
      icon.font = Font.semiboldSystemFont(9);
      icon.textColor = C(t.accent);

      row.addSpacer(8);

      const mid = row.addStack();
      mid.layoutVertically();
      const title = mid.addText(item.title || "Update");
      title.font = Font.mediumSystemFont(family === "large" ? 11 : 10);
      title.textColor = C(t.text);
      title.lineLimit = 1;

      if (item.subtitle && family !== "small") {
        const sub = mid.addText(item.subtitle);
        sub.font = Font.regularSystemFont(7);
        sub.textColor = C(t.secondary);
        sub.lineLimit = 1;
      }

      row.addSpacer();

      const when = row.addText(item.time || (item.timestamp ? relativeTimeFromISO(item.timestamp) : ""));
      when.font = Font.mediumSystemFont(7);
      when.textColor = C(t.faint);

      if (item.url) row.url = item.url;
      w.addSpacer(6);
    }
  }

  if (family === "large") {
    w.addSpacer();

    const lower = w.addStack();
    lower.layoutHorizontally();

    const hub = addCard(lower, t, 9);
    hub.layoutVertically();
    hub.url = feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub;
    const h1 = hub.addText("DRIVE");
    h1.font = Font.semiboldSystemFont(7);
    h1.textColor = C(t.secondary);
    const h2 = hub.addText("Open working hub");
    h2.font = Font.mediumSystemFont(10);
    h2.textColor = C(t.text);

    lower.addSpacer(8);

    const cp = addCard(lower, t, 9);
    cp.layoutVertically();
    cp.url = feed.links && feed.links.checkpoint ? feed.links.checkpoint : CASE_ACTIVITY_FALLBACK.links.checkpoint;
    const c1 = cp.addText("CHECKPOINT");
    c1.font = Font.semiboldSystemFont(7);
    c1.textColor = C(t.secondary);
    const c2 = cp.addText("Current case notes");
    c2.font = Font.mediumSystemFont(10);
    c2.textColor = C(t.text);
  }

  w.url = feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub;
  w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  return w;
}


function accessoryTextForType(data, opts, feed) {
  const type = opts.type;
  const open = openTasks(data, opts.list);
  const next = open[0];

  if (type === "clock" || type === "minimalclock") return fmtTime(new Date());
  if (type === "today") return (open.length ? open.length + " open today" : "Today clear");
  if (type === "focus") return next ? next.title : "Nothing pressing";
  if (type === "status") return Math.round(Device.batteryLevel() * 100) + "% battery";
  if (type === "progress") {
    const all = data.tasks.filter(x => x.list === opts.list);
    const done = all.filter(x => x.completed).length;
    return (all.length ? Math.round(done / all.length * 100) : 100) + "% complete";
  }
  if (type === "split") return openTasks(data, "personal").length + " personal · " + openTasks(data, "business").length + " business";
  if (type === "weekly") return "Week · " + open.filter(x => x.due).length + " scheduled";
  if (type === "countdown") {
    const timed = open.find(x => x.due);
    return timed ? relativeDue(timed.due) + " · " + timed.title : "No timed task";
  }
  if (type === "completed") return completedToday(data, opts.list) + " done today";
  if (type === "caseactivity") {
    const first = feed && feed.items && feed.items[0];
    return first ? first.title : "Case activity";
  }
  if (type === "chatgpt") return "Ask ChatGPT";
  if (type === "agenda" || type === "calendar") return next ? next.title : "No upcoming item";
  if (type === "followup") {
    const rx = /(follow|call|email|text|reply|check|contact|send|reach)/i;
    const item = openTasks(data, "business").find(x => rx.test(x.title));
    return item ? item.title : "No follow-up";
  }
  if (type === "utility" || type === "controlcenter" || type === "dashboard" || type === "overview") {
    return openTasks(data, "personal").length + " personal · " + openTasks(data, "business").length + " business";
  }
  if (type === "quickadd" || type === "launcher") return "Quick actions";
  if (type === "note") return next ? next.title : "Daily note";
  if (type === "morning") return "Morning · " + open.length + " open";
  if (type === "night") return completedToday(data, opts.list) + " done · tomorrow next";
  if (type === "essentials") return openTasks(data, "personal").length + " essentials";
  if (type === "compact" || type === "tasks") return open.length + " open · " + listTitle(opts.list);
  return listTitle(opts.list);
}

async function buildAccessoryWidget(data, opts) {
  const t = theme(opts.themeName);
  const family = widgetFamily();
  const w = new ListWidget();
  w.backgroundColor = C(t.bg);

  let feed = null;
  if (opts.type === "caseactivity") feed = await loadCaseActivityFeed();

  const summary = accessoryTextForType(data, opts, feed);

  if (family === "accessoryInline") {
    const line = w.addText(summary);
    line.font = Font.mediumSystemFont(12);
    line.textColor = Color.white();
    if (opts.type === "chatgpt") w.url = scriptURL({ action: "chatgptDictate" });
    else if (opts.type === "caseactivity") w.url = feed && feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub;
    else w.url = scriptURL({ action: "open", list: opts.list });
    return w;
  }

  if (family === "accessoryCircular") {
    w.setPadding(5,5,5,5);
    const stack = w.addStack();
    stack.layoutVertically();
    stack.centerAlignContent();

    let iconText = "•";
    if (opts.type === "clock" || opts.type === "minimalclock") iconText = fmtTime(new Date()).replace(/\s?[AP]M/i,"");
    else if (opts.type === "status") iconText = Math.round(Device.batteryLevel() * 100) + "%";
    else if (opts.type === "progress") {
      const all = data.tasks.filter(x => x.list === opts.list);
      const done = all.filter(x => x.completed).length;
      iconText = (all.length ? Math.round(done / all.length * 100) : 100) + "%";
    }
    else if (opts.type === "caseactivity") iconText = String((feed && feed.items ? feed.items.length : 0));
    else if (opts.type === "chatgpt") iconText = "✦";
    else iconText = String(openTasks(data, opts.list).length);

    const value = stack.addText(iconText);
    value.font = Font.semiboldSystemFont(iconText.length > 3 ? 12 : 16);
    value.textColor = Color.white();

    const tiny = stack.addText(opts.type === "chatgpt" ? "ASK" : opts.type === "caseactivity" ? "UPD" : "OPEN");
    tiny.font = Font.mediumSystemFont(6);
    tiny.textColor = Color.gray();

    if (opts.type === "chatgpt") w.url = scriptURL({ action: "chatgptDictate" });
    else if (opts.type === "caseactivity") w.url = feed && feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub;
    else w.url = scriptURL({ action: "open", list: opts.list });
    return w;
  }

  // accessoryRectangular
  w.setPadding(8,10,8,10);
  const label = w.addText(
    opts.type === "caseactivity" ? "Recent Activity" :
    opts.type === "chatgpt" ? "ChatGPT" :
    opts.type === "focus" ? "Focus" :
    opts.type === "status" ? "Status" :
    opts.type === "today" ? "Today" :
    opts.type === "progress" ? "Progress" :
    listTitle(opts.list)
  );
  label.font = Font.semiboldSystemFont(8);
  label.textColor = Color.gray();

  w.addSpacer(3);

  const body = w.addText(summary);
  body.font = Font.mediumSystemFont(11);
  body.textColor = Color.white();
  body.lineLimit = 2;
  body.minimumScaleFactor = 0.72;

  if (opts.type === "chatgpt") w.url = scriptURL({ action: "chatgptDictate" });
  else if (opts.type === "caseactivity") w.url = feed && feed.links && feed.links.hub ? feed.links.hub : CASE_ACTIVITY_FALLBACK.links.hub;
  else if (opts.type === "quickadd") w.url = scriptURL({ action: "add", list: opts.list });
  else w.url = scriptURL({ action: "open", list: opts.list });

  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  return w;
}


async function buildNextEventWidget(data, opts) {
  const t=theme(opts.themeName), w=baseWidget(t), feed=await loadGoogleCalendarFeed();
  addHeader(w,t,"Next Event","GOOGLE CALENDAR","https://calendar.google.com");
  w.addSpacer(8);
  if(!feed.ok || !feed.events.length){
    const x=w.addText(feed.ok?"Calendar clear":"Google Calendar not connected");
    x.font=displayFont(t,16,"regular"); x.textColor=C(t.secondary); return w;
  }
  const e=feed.events[0];
  const time=w.addText(eventTimeLabel(e.start));
  time.font=displayFont(t,familyFont(22,30,34),"bold"); time.textColor=C(t.accent);
  const title=w.addText(e.title||"Untitled");
  title.font=displayFont(t,familyFont(15,19,22),"regular"); title.textColor=C(t.text); title.lineLimit=2;
  if(e.location && widgetFamily()!=="small"){const loc=w.addText(e.location);loc.font=Font.mediumSystemFont(8);loc.textColor=C(t.secondary);}
  if(e.url)w.url=e.url;
  return w;
}

async function buildDayTimelineWidget(data, opts) {
  const t=theme(opts.themeName), w=baseWidget(t), feed=await loadGoogleCalendarFeed();
  addHeader(w,t,"Day Timeline",fmtDate(new Date()),"https://calendar.google.com");
  w.addSpacer(7);
  if(!feed.ok){const x=w.addText("Google Calendar not connected");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  const today=new Date().toDateString();
  const events=(feed.events||[]).filter(e=>new Date(e.start).toDateString()===today).slice(0,familyRows(2,4,6));
  if(!events.length){const x=w.addText("No events today.");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  for(const e of events){
    const row=w.addStack();row.layoutHorizontally();
    const tm=row.addText(eventTimeLabel(e.start));tm.font=Font.semiboldSystemFont(8);tm.textColor=C(t.accent);
    row.addSpacer(9);
    const tx=row.addText(e.title||"Untitled");tx.font=Font.mediumSystemFont(10);tx.textColor=C(t.text);tx.lineLimit=1;
    if(e.url)row.url=e.url;
    w.addSpacer(6);
  }
  return w;
}

async function buildWeekCalendarWidget(data, opts) {
  const t=theme(opts.themeName), w=baseWidget(t), feed=await loadGoogleCalendarFeed();
  addHeader(w,t,"Week", "GOOGLE CALENDAR", "https://calendar.google.com");
  w.addSpacer(8);
  if(!feed.ok){const x=w.addText("Google Calendar not connected");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  const days=[];
  for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()+i);days.push(d);}
  for(const d of days.slice(0,familyRows(3,5,7))){
    const count=(feed.events||[]).filter(e=>new Date(e.start).toDateString()===d.toDateString()).length;
    const row=w.addStack();row.layoutHorizontally();
    const day=row.addText(fmtDate(d,"EEE d"));day.font=Font.mediumSystemFont(9);day.textColor=d.toDateString()===new Date().toDateString()?C(t.accent):C(t.text);
    row.addSpacer();const c=row.addText(count+" event"+(count===1?"":"s"));c.font=Font.mediumSystemFont(8);c.textColor=C(t.secondary);
    w.addSpacer(5);
  }
  return w;
}

async function buildUpNextWidget(data, opts) {
  const t=theme(opts.themeName), w=baseWidget(t), feed=await loadGoogleCalendarFeed();
  addHeader(w,t,"Up Next",fmtDate(new Date()),scriptURL({action:"open",list:opts.list}));
  w.addSpacer(8);
  const e=feed.ok&&feed.events.length?feed.events[0]:null;
  const task=openTasks(data,opts.list)[0];
  if(e){
    const a=w.addText(eventTimeLabel(e.start)+" · "+(e.title||"Calendar"));
    a.font=Font.mediumSystemFont(10);a.textColor=C(t.text);a.lineLimit=1;if(e.url)a.url=e.url;
    w.addSpacer(7);
  }
  if(task){
    const b=w.addText("○ "+task.title);b.font=Font.mediumSystemFont(10);b.textColor=C(t.text);b.lineLimit=1;b.url=scriptURL({action:"toggle",id:task.id,list:opts.list});
  }
  if(!e&&!task){const x=w.addText("Nothing pressing.");x.font=displayFont(t,14,"regular");x.textColor=C(t.secondary);}
  return w;
}

async function buildBriefingWidget(data, opts) {
  const t=theme(opts.themeName),w=baseWidget(t),feed=await loadGoogleCalendarFeed(),caseFeed=await loadCaseActivityFeed();
  addHeader(w,t,"Daily Briefing",fmtDate(new Date()),scriptURL({action:"open",list:opts.list}));
  w.addSpacer(8);
  const nextEvent=feed.ok&&feed.events.length?feed.events[0]:null;
  const nextTask=openTasks(data,opts.list)[0];
  const caseItem=caseFeed.items&&caseFeed.items.length?caseFeed.items[0]:null;
  const rows=[];
  if(nextEvent)rows.push(["CAL",eventTimeLabel(nextEvent.start)+" · "+nextEvent.title,nextEvent.url]);
  if(nextTask)rows.push(["TASK",nextTask.title,scriptURL({action:"toggle",id:nextTask.id,list:opts.list})]);
  if(caseItem)rows.push(["DRIVE",caseItem.title,caseItem.url]);
  for(const [k,v,u] of rows.slice(0,familyRows(2,3,4))){
    const row=w.addStack();row.layoutHorizontally();const a=row.addText(k);a.font=Font.semiboldSystemFont(7);a.textColor=C(t.accent);row.addSpacer(8);const b=row.addText(v);b.font=Font.mediumSystemFont(10);b.textColor=C(t.text);b.lineLimit=1;if(u)row.url=u;w.addSpacer(6);
  }
  return w;
}

function buildPriorityWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),tasks=openTasks(data,opts.list).slice(0,familyRows(1,3,5));
  addHeader(w,t,"Priority",listTitle(opts.list),scriptURL({action:"open",list:opts.list}));
  w.addSpacer(8);
  if(!tasks.length){const x=w.addText("Nothing pressing.");x.font=displayFont(t,14,"regular");x.textColor=C(t.secondary);return w;}
  tasks.forEach((task,i)=>{const row=w.addStack();row.layoutHorizontally();const n=row.addText(String(i+1).padStart(2,"0"));n.font=Font.semiboldSystemFont(8);n.textColor=C(t.accent);row.addSpacer(8);const tx=row.addText(task.title);tx.font=Font.mediumSystemFont(10);tx.textColor=C(t.text);tx.lineLimit=1;row.url=scriptURL({action:"toggle",id:task.id,list:opts.list});w.addSpacer(6);});
  return w;
}

async function buildWorkdayWidget(data,opts){
  const copy={...opts,list:"business"};return await buildBriefingWidget(data,copy);
}
async function buildPersonalDayWidget(data,opts){
  const copy={...opts,list:"personal"};return await buildBriefingWidget(data,copy);
}

async function buildCasePulseWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),feed=await loadCaseActivityFeed();
  addHeader(w,t,"Case Pulse",feed.status||"CONNECTED",feed.links&&feed.links.hub?feed.links.hub:CASE_ACTIVITY_FALLBACK.links.hub);
  w.addSpacer(8);
  const items=(feed.items||[]).slice(0,familyRows(1,3,5));
  const big=w.addText(String(items.length));
  big.font=displayFont(t,familyFont(30,38,46),"bold");big.textColor=C(t.accent);
  const label=w.addText("RECENT UPDATES");label.font=Font.mediumSystemFont(7);label.textColor=C(t.secondary);
  if(widgetFamily()!=="small"){w.addSpacer(8);for(const item of items){const x=w.addText("• "+item.title);x.font=Font.mediumSystemFont(9);x.textColor=C(t.text);x.lineLimit=1;w.addSpacer(5);}}
  return w;
}

async function buildSyncStatusWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),feed=await loadCaseActivityFeed();
  addHeader(w,t,"Sync Status",feed.status||"CONNECTED",feed.links&&feed.links.hub?feed.links.hub:CASE_ACTIVITY_FALLBACK.links.hub);
  w.addSpacer();
  const txt=w.addText(feed.updated_at?relativeTimeFromISO(feed.updated_at):"No update time");
  txt.font=displayFont(t,familyFont(20,28,34),"regular");txt.textColor=C(t.text);
  const sub=w.addText("LAST ACTIVITY");sub.font=Font.mediumSystemFont(7);sub.textColor=C(t.secondary);
  w.addSpacer();
  return w;
}

function buildBatteryFocusWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),pct=Math.round(Device.batteryLevel()*100);
  addHeader(w,t,"Battery Focus",fmtTime(new Date()),scriptURL({action:"open",list:opts.list}));
  w.addSpacer();
  const big=w.addText(pct+"%");big.font=displayFont(t,familyFont(36,52,62),"bold");big.textColor=C(t.text);
  const state=Device.isCharging()?"CHARGING":"BATTERY";const sub=w.addText(state);sub.font=Font.mediumSystemFont(8);sub.textColor=C(t.accent);
  return w;
}

function buildQuickCaptureWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t);
  const plus=w.addText("＋");plus.font=displayFont(t,familyFont(38,48,58),"regular");plus.textColor=C(t.accent);
  const title=w.addText("Quick Capture");title.font=displayFont(t,familyFont(16,20,24),"regular");title.textColor=C(t.text);
  const sub=w.addText("Add to "+listTitle(opts.list));sub.font=Font.mediumSystemFont(8);sub.textColor=C(t.secondary);
  w.url=scriptURL({action:"add",list:opts.list});
  return w;
}


async function buildInboxWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),g=await loadGoogleLiveData();
  addHeader(w,t,"Inbox","GMAIL","https://mail.google.com/");
  w.addSpacer(8);
  if(!g.ok){const x=w.addText("Google not connected");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  const msgs=(g.gmail||[]).slice(0,familyRows(2,4,6));
  if(!msgs.length){const x=w.addText("Inbox clear.");x.font=displayFont(t,14,"regular");x.textColor=C(t.secondary);return w;}
  for(const m of msgs){
    const row=w.addStack();row.layoutVertically();row.url="https://mail.google.com/";
    const from=row.addText((m.from||"Email").replace(/<.*?>/g,"").trim());from.font=Font.semiboldSystemFont(9);from.textColor=C(t.text);from.lineLimit=1;
    const sub=row.addText(m.subject||m.snippet||"");sub.font=Font.regularSystemFont(8);sub.textColor=C(t.secondary);sub.lineLimit=1;
    w.addSpacer(6);
  }
  return w;
}
async function buildLatestEmailWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),g=await loadGoogleLiveData();
  addHeader(w,t,"Latest Email","GMAIL","https://mail.google.com/");
  w.addSpacer(8);
  if(!g.ok||!g.gmail?.length){const x=w.addText(g.ok?"No recent email":"Google not connected");x.font=displayFont(t,14,"regular");x.textColor=C(t.secondary);return w;}
  const m=g.gmail[0];
  const from=w.addText((m.from||"Email").replace(/<.*?>/g,"").trim());from.font=displayFont(t,familyFont(16,22,27),"regular");from.textColor=C(t.text);from.lineLimit=2;
  w.addSpacer(5);
  const subject=w.addText(m.subject||m.snippet||"");subject.font=Font.mediumSystemFont(familyFont(9,11,13));subject.textColor=C(t.secondary);subject.lineLimit=3;
  w.url="https://mail.google.com/";
  return w;
}
async function buildDriveActivityWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),g=await loadGoogleLiveData();
  addHeader(w,t,"Drive Activity","GOOGLE DRIVE","https://drive.google.com/");
  w.addSpacer(8);
  if(!g.ok){const x=w.addText("Google not connected");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  const files=(g.drive||[]).slice(0,familyRows(2,4,6));
  for(const file of files){
    const row=w.addStack();row.layoutHorizontally();row.url=file.webViewLink||"https://drive.google.com/";
    const icon=row.addText("▣");icon.font=Font.semiboldSystemFont(9);icon.textColor=C(t.accent);row.addSpacer(8);
    const name=row.addText(file.name||"File");name.font=Font.mediumSystemFont(10);name.textColor=C(t.text);name.lineLimit=1;
    row.addSpacer();
    const time=row.addText(file.modifiedTime?relativeTimeFromISO(file.modifiedTime):"");time.font=Font.mediumSystemFont(7);time.textColor=C(t.faint);
    w.addSpacer(6);
  }
  return w;
}
async function buildRecentFilesWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),g=await loadGoogleLiveData();
  addHeader(w,t,"Recent Files","DRIVE","https://drive.google.com/");
  w.addSpacer(8);
  if(!g.ok){const x=w.addText("Google not connected");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  const count=(g.drive||[]).length;
  const big=w.addText(String(count));big.font=displayFont(t,familyFont(34,46,56),"bold");big.textColor=C(t.accent);
  const lbl=w.addText("RECENT FILES");lbl.font=Font.mediumSystemFont(7);lbl.textColor=C(t.secondary);
  if(widgetFamily()!=="small"){
    w.addSpacer(8);
    for(const file of (g.drive||[]).slice(0,familyRows(1,3,5))){
      const x=w.addText(file.name||"File");x.font=Font.mediumSystemFont(9);x.textColor=C(t.text);x.lineLimit=1;x.url=file.webViewLink||"https://drive.google.com/";w.addSpacer(5);
    }
  }
  return w;
}
async function buildGoogleBriefWidget(data,opts){
  const t=theme(opts.themeName),w=baseWidget(t),g=await loadGoogleLiveData();
  addHeader(w,t,"Google Brief","GMAIL · DRIVE · CALENDAR","https://navi-os-widgets.vercel.app/api/google/status");
  w.addSpacer(8);
  if(!g.ok){const x=w.addText("Google not connected");x.font=Font.mediumSystemFont(10);x.textColor=C(t.secondary);return w;}
  const rows=[];
  if(g.calendar?.[0])rows.push(["CAL",eventTimeLabel(g.calendar[0].start)+" · "+g.calendar[0].title,g.calendar[0].htmlLink]);
  if(g.gmail?.[0])rows.push(["MAIL",(g.gmail[0].from||"Email").replace(/<.*?>/g,"").trim()+" · "+(g.gmail[0].subject||""),"https://mail.google.com/"]);
  if(g.drive?.[0])rows.push(["DRIVE",g.drive[0].name,g.drive[0].webViewLink]);
  for(const [k,v,u] of rows){
    const row=w.addStack();row.layoutHorizontally();if(u)row.url=u;
    const a=row.addText(k);a.font=Font.semiboldSystemFont(7);a.textColor=C(t.accent);row.addSpacer(8);
    const b=row.addText(v);b.font=Font.mediumSystemFont(9);b.textColor=C(t.text);b.lineLimit=1;
    w.addSpacer(7);
  }
  return w;
}
async function buildWidget(data, opts) {
  if (String(widgetFamily()).startsWith("accessory")) return await buildAccessoryWidget(data, opts);
  if (opts.type === "clock") return buildClockWidget(data, opts);
  if (opts.type === "agenda") return await buildAgendaWidget(data, opts);
  if (opts.type === "dashboard") return buildDashboardWidget(data, opts);
  if (opts.type === "focus") return buildFocusWidget(data, opts);
  if (opts.type === "status") return buildStatusWidget(data, opts);
  if (opts.type === "compact") return buildCompactWidget(data, opts);
  if (opts.type === "today") return buildTodayWidget(data, opts);
  if (opts.type === "split") return buildSplitWidget(data, opts);
  if (opts.type === "weekly") return buildWeeklyWidget(data, opts);
  if (opts.type === "progress") return buildProgressWidget(data, opts);
  if (opts.type === "morning") return buildMorningWidget(data, opts);
  if (opts.type === "night") return buildNightWidget(data, opts);
  if (opts.type === "followup") return buildFollowupWidget(data, opts);
  if (opts.type === "calendar") return await buildCalendarWidget(data, opts);
  if (opts.type === "minimalclock") return buildMinimalClockWidget(data, opts);
  if (opts.type === "utility") return buildUtilityWidget(data, opts);
  if (opts.type === "controlcenter") return buildControlCenterWidget(data, opts);
  if (opts.type === "launcher") return buildLauncherWidget(data, opts);
  if (opts.type === "note") return buildNoteWidget(data, opts);
  if (opts.type === "quickadd") return buildQuickAddWidget(data, opts);
  if (opts.type === "completed") return buildCompletedWidget(data, opts);
  if (opts.type === "essentials") return buildEssentialsWidget(data, opts);
  if (opts.type === "countdown") return buildCountdownWidget(data, opts);
  if (opts.type === "overview") return buildOverviewWidget(data, opts);
  if (opts.type === "chatgpt") return buildChatGPTWidget(data, opts);
  if (opts.type === "caseactivity") return await buildCaseActivityWidget(opts);
  if (opts.type === "nextevent") return await buildNextEventWidget(data, opts);
  if (opts.type === "daytimeline") return await buildDayTimelineWidget(data, opts);
  if (opts.type === "weekcalendar") return await buildWeekCalendarWidget(data, opts);
  if (opts.type === "upnext") return await buildUpNextWidget(data, opts);
  if (opts.type === "briefing") return await buildBriefingWidget(data, opts);
  if (opts.type === "priority") return buildPriorityWidget(data, opts);
  if (opts.type === "workday") return await buildWorkdayWidget(data, opts);
  if (opts.type === "personalday") return await buildPersonalDayWidget(data, opts);
  if (opts.type === "casepulse") return await buildCasePulseWidget(data, opts);
  if (opts.type === "syncstatus") return await buildSyncStatusWidget(data, opts);
  if (opts.type === "batteryfocus") return buildBatteryFocusWidget(data, opts);
  if (opts.type === "quickcapture") return buildQuickCaptureWidget(data, opts);
  if (opts.type === "inbox") return await buildInboxWidget(data, opts);
  if (opts.type === "latestemail") return await buildLatestEmailWidget(data, opts);
  if (opts.type === "driveactivity") return await buildDriveActivityWidget(data, opts);
  if (opts.type === "recentfiles") return await buildRecentFilesWidget(data, opts);
  if (opts.type === "googlebrief") return await buildGoogleBriefWidget(data, opts);
  return buildTasksWidget(data, opts);
}

async function chooseHomeWidget(data, state) {
  const slotAlert = new Alert();
  slotAlert.title = "Choose Widget Slot";
  for (let i = 1; i <= SLOT_COUNT; i++) slotAlert.addAction("Slot " + i);
  slotAlert.addCancelAction("Cancel");
  const slotIndex = await slotAlert.present();
  if (slotIndex < 0) return false;
  const slot = "slot" + (slotIndex + 1);
  const current = loadWidgetConfig(slot);

  const typeAlert = new Alert();
  typeAlert.title = "Home Widget";
  typeAlert.message = "Choose what your NaviOS widget shows.";
  [
    "Tasks", "Clock", "Agenda", "Dashboard", "Focus", "Status", "Compact",
    "Today", "Personal / Business", "Weekly", "Progress", "Morning", "Night",
    "Follow Ups", "Calendar", "Minimal Clock", "Utility", "Control Center",
    "Launcher", "Daily Note", "Quick Add", "Completed", "Essentials",
    "Countdown", "Overview", "ChatGPT", "Case Activity"
  ].forEach(name => typeAlert.addAction(name));
  typeAlert.addCancelAction("Cancel");
  const typeIndex = await typeAlert.present();
  if (typeIndex < 0) return false;

  const listAlert = new Alert();
  listAlert.title = "Choose List";
  listAlert.addAction("Personal");
  listAlert.addAction("Business");
  listAlert.addCancelAction("Cancel");
  const listIndex = await listAlert.present();
  if (listIndex < 0) return false;

  const themeAlert = new Alert();
  themeAlert.title = "Choose Style";
  const themeKeys = Object.keys(THEMES);
  for (const key of themeKeys) themeAlert.addAction(THEMES[key].name);
  themeAlert.addCancelAction("Cancel");
  const themeIndex = await themeAlert.present();
  if (themeIndex < 0) return false;

  const next = {
    type: TYPES[typeIndex],
    list: listIndex === 1 ? "business" : "personal",
    themeName: themeKeys[themeIndex]
  };

  saveWidgetConfig(next, slot);
  state.selected = next.list;

  const done = new Alert();
  done.title = "Widget " + slot.toUpperCase() + " Saved";
  done.message = TYPES[typeIndex][0].toUpperCase() + TYPES[typeIndex].slice(1) +
    " · " + listTitle(next.list) + " · " + THEMES[next.themeName].name;
  done.addAction("Preview");
  done.addAction("Done");
  const action = await done.present();

  if (action === 0) {
    const widget = await buildWidget(data, next);
    await widget.presentMedium();
  }
  return true;
}

async function previewWidget(data, state) {
  const a = new Alert();
  a.title = "Preview Widget";
  a.message = "Choose a widget type.";
  [
    "Tasks", "Clock", "Agenda", "Dashboard", "Focus", "Status", "Compact",
    "Today", "Personal / Business", "Weekly", "Progress", "Morning", "Night",
    "Follow Ups", "Calendar", "Minimal Clock", "Utility", "Control Center",
    "Launcher", "Daily Note", "Quick Add", "Completed", "Essentials",
    "Countdown", "Overview", "ChatGPT", "Case Activity"
  ].forEach(name => a.addAction(name));
  a.addCancelAction("Cancel");
  const typeIndex = await a.present();
  if (typeIndex < 0) return;

  const themeAlert = new Alert();
  themeAlert.title = "Choose Theme";
  const themeKeys = Object.keys(THEMES);
  for (const key of themeKeys) themeAlert.addAction(THEMES[key].name);
  themeAlert.addCancelAction("Cancel");
  const themeIndex = await themeAlert.present();
  if (themeIndex < 0) return;

  const opts = {
    type: TYPES[typeIndex],
    list: state.selected,
    themeName: themeKeys[themeIndex]
  };
  const widget = await buildWidget(data, opts);
  await widget.presentMedium();
}

function populateManager(table, data, state) {
  table.removeAllRows();

  const t = THEMES.graphite;
  const selected = state.selected;

  const top = new UITableRow();
  top.height = 64;
  top.isHeader = true;
  top.backgroundColor = C(t.bg);
  const heading = top.addText("NaviOS", listTitle(selected) + " · Widget Studio");
  heading.titleFont = serifFont(28);
  heading.titleColor = C(t.text);
  heading.subtitleFont = Font.mediumSystemFont(9);
  heading.subtitleColor = C(t.secondary);
  table.addRow(top);

  const switcher = new UITableRow();
  switcher.height = 42;
  switcher.backgroundColor = C(t.panel);
  switcher.cellSpacing = 8;

  const personal = switcher.addButton(selected === "personal" ? "●  Personal" : "○  Personal");
  personal.titleFont = Font.semiboldSystemFont(12);
  personal.titleColor = selected === "personal" ? C(t.text) : C(t.secondary);
  personal.dismissOnTap = false;
  personal.onTap = () => {
    state.selected = "personal";
    populateManager(table, data, state);
    table.reload();
  };

  const business = switcher.addButton(selected === "business" ? "●  Business" : "○  Business");
  business.titleFont = Font.semiboldSystemFont(12);
  business.titleColor = selected === "business" ? C(t.text) : C(t.secondary);
  business.dismissOnTap = false;
  business.onTap = () => {
    state.selected = "business";
    populateManager(table, data, state);
    table.reload();
  };
  table.addRow(switcher);

  const savedWidget = loadWidgetConfig();

  const homeRow = new UITableRow();
  homeRow.height = 50;
  homeRow.backgroundColor = C(t.panel);
  const home = homeRow.addButton(
    "▣  Home Widget · " +
    savedWidget.type[0].toUpperCase() + savedWidget.type.slice(1) +
    " · " + THEMES[savedWidget.themeName].name
  );
  home.titleFont = Font.semiboldSystemFont(11);
  home.titleColor = C(t.text);
  home.dismissOnTap = false;
  home.onTap = async () => {
    const changed = await chooseHomeWidget(data, state);
    if (changed) {
      populateManager(table, data, state);
      table.reload();
    }
  };
  table.addRow(homeRow);

  const previewRow = new UITableRow();
  previewRow.height = 42;
  previewRow.backgroundColor = C(t.bg);
  const preview = previewRow.addButton("◫  Browse All Widget Styles");
  preview.titleFont = Font.semiboldSystemFont(11);
  preview.titleColor = C(t.accent);
  preview.dismissOnTap = false;
  preview.onTap = async () => await previewWidget(data, state);
  table.addRow(previewRow);

  const addRow = new UITableRow();
  addRow.height = 44;
  addRow.backgroundColor = C(t.bg);
  const addBtn = addRow.addButton("＋  Add " + listTitle(selected) + " task");
  addBtn.titleFont = Font.semiboldSystemFont(12);
  addBtn.titleColor = C(t.text);
  addBtn.dismissOnTap = false;
  addBtn.onTap = async () => {
    const changed = await addTaskFlow(data, selected);
    if (changed) {
      populateManager(table, data, state);
      table.reload();
    }
  };
  table.addRow(addRow);

  const tasks = data.tasks
    .filter(x => x.list === selected)
    .sort((a,b) => Number(a.completed) - Number(b.completed) || new Date(a.createdAt) - new Date(b.createdAt));

  for (const task of tasks) {
    const row = new UITableRow();
    row.height = 50;
    row.backgroundColor = C(t.bg);
    row.dismissOnSelect = false;

    const cell = row.addText((task.completed ? "✓" : "○") + "  " + task.title, fmtDue(task.due) || "");
    cell.titleFont = Font.mediumSystemFont(13);
    cell.titleColor = task.completed ? C(t.secondary) : C(t.text);
    cell.subtitleFont = Font.regularSystemFont(9);
    cell.subtitleColor = C(t.secondary);

    row.onSelect = async () => {
      const choose = new Alert();
      choose.title = task.title;
      choose.addAction(task.completed ? "Mark Open" : "Complete");
      choose.addAction("Edit");
      choose.addCancelAction("Cancel");
      const c = await choose.present();
      if (c === 0) await toggleTask(data, task.id);
      if (c === 1) await editTaskFlow(data, task);
      if (c >= 0) {
        populateManager(table, data, state);
        table.reload();
      }
    };
    table.addRow(row);
  }

  const info = new UITableRow();
  info.height = 54;
  info.backgroundColor = C(t.panel);
  const text = info.addText(
    "Home Screen setup",
    "Choose everything inside NaviOS. Leave the Scriptable widget Parameter field blank."
  );
  text.titleFont = Font.semiboldSystemFont(9);
  text.titleColor = C(t.secondary);
  text.subtitleFont = Font.regularSystemFont(8);
  text.subtitleColor = C(t.faint);
  table.addRow(info);

  const footer = new UITableRow();
  footer.height = 36;
  footer.backgroundColor = C(t.bg);
  const f = footer.addText("NaviOS Widgets · v" + VERSION, "6 themes · 4 widget types · local-only");
  f.titleFont = Font.mediumSystemFont(8);
  f.titleColor = C(t.faint);
  f.subtitleFont = Font.regularSystemFont(8);
  f.subtitleColor = C(t.faint);
  table.addRow(footer);
}

async function presentManager(data, initialList) {
  const table = new UITable();
  table.showSeparators = false;
  const state = { selected: initialList };
  populateManager(table, data, state);
  await table.present(false);
}

async function handleAction(data) {
  const q = args.queryParameters || {};
  const action = q.action || "open";
  const list = normalizeList(q.list);

  if (action === "configure") {
    const next = {
      type: normalizeType(q.type),
      list: normalizeList(q.list),
      themeName: normalizeTheme(q.theme)
    };
    const slot = normalizeSlot(q.slot || "slot1");
    saveWidgetConfig(next, slot);

    const saved = new Alert();
    saved.title = "Widget " + slot.toUpperCase() + " Updated";
    saved.message =
      next.type[0].toUpperCase() + next.type.slice(1) +
      " · " + listTitle(next.list) +
      " · " + THEMES[next.themeName].name;
    saved.addAction("Done");
    await saved.present();
    return { list: next.list, reopen: false };
  }

  if (action === "googleConnect" && q.token) {
    saveGoogleConnectionToken(q.token);
    const a = new Alert();
    a.title = "Google Connected";
    a.message = "Gmail, Drive and Google Calendar are now connected to this iPhone widget engine.";
    a.addAction("Done");
    await a.present();
    return { list, reopen: false };
  }

  if (action === "chatgptDictate") {
    await dictateToChatGPT();
    return { list, reopen: false };
  }

  if (action === "chatgptType") {
    await typeToChatGPT();
    return { list, reopen: false };
  }

  if (action === "toggle" && q.id) {
    await toggleTask(data, q.id);
    return { list, reopen: false };
  }
  if (action === "add") {
    await addTaskFlow(data, list);
    return { list, reopen: true };
  }
  return { list, reopen: true };
}

let data = loadData();

if (config.runsInWidget) {
  const opts = parseWidgetParameter(args.widgetParameter);
  const widget = await buildWidget(data, opts);
  Script.setWidget(widget);
  Script.complete();
} else {
  const result = await handleAction(data);
  data = loadData();
  if (result.reopen) await presentManager(data, result.list);
  Script.complete();
}
