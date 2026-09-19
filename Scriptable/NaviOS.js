// NaviOS Widgets — Scriptable Theme Suite
// Real iOS Home Screen widgets hosted by Scriptable.
// No server, no Vercel, no developer account, local-first task storage.

const VERSION = "3.1.0";
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
  return { type: "tasks", list: "personal", themeName: "graphite" };
}

function loadWidgetConfig() {
  if (!fm.fileExists(configPath)) {
    const c = defaultWidgetConfig();
    saveWidgetConfig(c);
    return c;
  }
  try {
    const c = JSON.parse(fm.readString(configPath));
    return {
      type: normalizeType(c.type),
      list: normalizeList(c.list),
      themeName: normalizeTheme(c.themeName)
    };
  } catch (_) {
    const c = defaultWidgetConfig();
    saveWidgetConfig(c);
    return c;
  }
}

function saveWidgetConfig(c) {
  const clean = {
    type: normalizeType(c.type),
    list: normalizeList(c.list),
    themeName: normalizeTheme(c.themeName)
  };
  fm.writeString(configPath, JSON.stringify(clean, null, 2));
}

function parseWidgetParameter(raw) {
  const parts = String(raw || "").toLowerCase().split("|").map(s => s.trim()).filter(Boolean);
  if (!parts.length) return loadWidgetConfig();

  const saved = loadWidgetConfig();
  let type = saved.type;
  let list = saved.list;
  let themeName = saved.themeName;

  for (const p of parts) {
    if (TYPES.includes(p)) type = p;
    else if (p === "personal" || p === "business") list = p;
    else if (THEMES[p]) themeName = p;
  }
  return { type, list, themeName };
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
  n.title = "NaviOS · " + listTitle(task.list);
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

function buildAgendaWidget(data, opts) {
  const t = theme(opts.themeName);
  const family = config.widgetFamily || "medium";
  const w = baseWidget(t);

  addHeader(w, t, "Agenda", listTitle(opts.list), scriptURL({ action: "open", list: opts.list }));
  addGradientDivider(w, t, 6);

  const upcoming = openTasks(data, opts.list)
    .filter(x => x.due)
    .sort((a,b) => new Date(a.due) - new Date(b.due));

  const source = upcoming.length ? upcoming : openTasks(data, opts.list);
  const maxRows = family === "large" ? 6 : family === "small" ? 2 : 4;

  if (!source.length) {
    w.addSpacer();
    const empty = w.addText("Your day is clear.");
    empty.font = displayFont(t, 14, "regular");
    empty.textColor = C(t.secondary);
    w.addSpacer();
  } else {
    for (const task of source.slice(0, maxRows)) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();
      row.url = scriptURL({ action: "toggle", id: task.id, list: opts.list });

      const time = row.addText(task.due ? fmtDate(new Date(task.due), "h:mm a") : "OPEN");
      time.font = Font.semiboldSystemFont(8);
      time.textColor = C(t.accent);
      time.lineLimit = 1;
      row.addSpacer(10);

      const title = row.addText(task.title);
      title.font = Font.mediumSystemFont(12);
      title.textColor = C(t.text);
      title.lineLimit = 1;
      title.minimumScaleFactor = 0.7;

      row.addSpacer();
      w.addSpacer(7);
    }
  }

  w.url = scriptURL({ action: "open", list: opts.list });
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  return w;
}

function buildDashboardWidget(data, opts) {

  if (widgetFamily() === "small") {
    const t = theme(opts.themeName);
    const w = baseWidget(t);
    const label = w.addText("NaviOS");
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

  addHeader(w, t, "NaviOS", fmtDate(new Date()), scriptURL({ action: "open", list: opts.list }));
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
    const meta = w.addText("NAVI OS");
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

function buildCalendarWidget(data, opts) {
  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, fmtDate(new Date(), "MMMM"), fmtDate(new Date(), "yyyy"), scriptURL({ action: "open", list: opts.list }));
  w.addSpacer(9);

  const strip = w.addStack();
  strip.layoutHorizontally();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const cell = strip.addStack();
    cell.layoutVertically();
    cell.centerAlignContent();
    const a = cell.addText(fmtDate(d, "E").slice(0,1));
    a.font = Font.mediumSystemFont(7);
    a.textColor = C(t.secondary);
    const b = cell.addText(fmtDate(d, "d"));
    b.font = displayFont(t, 14, "regular");
    b.textColor = i === 0 ? C(t.accent) : C(t.text);
    if (i < 6) strip.addSpacer();
  }

  w.addSpacer(12);
  const due = openTasks(data, opts.list).filter(x => x.due);
  addSimpleTaskRows(w, t, due.length ? due : openTasks(data, opts.list), opts.list, familyRows(1, 3, 5));
  w.url = scriptURL({ action: "open", list: opts.list });
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
  addHeader(w, t, "Control Center", "NAVI OS", scriptURL({ action: "open", list: opts.list }));
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
    const meta = w.addText("Tap to open NaviOS");
    meta.font = Font.mediumSystemFont(7);
    meta.textColor = C(t.secondary);
    w.url = scriptURL({ action: "open", list: opts.list });
    return w;
  }

  const t = theme(opts.themeName);
  const w = baseWidget(t);
  addHeader(w, t, "Launcher", "NAVI OS", scriptURL({ action: "open", list: opts.list }));
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

function buildWidget(data, opts) {
  if (opts.type === "clock") return buildClockWidget(data, opts);
  if (opts.type === "agenda") return buildAgendaWidget(data, opts);
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
  if (opts.type === "calendar") return buildCalendarWidget(data, opts);
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
  return buildTasksWidget(data, opts);
}

async function chooseHomeWidget(data, state) {
  const current = loadWidgetConfig();

  const typeAlert = new Alert();
  typeAlert.title = "Home Widget";
  typeAlert.message = "Choose what your NaviOS widget shows.";
  [
    "Tasks", "Clock", "Agenda", "Dashboard", "Focus", "Status", "Compact",
    "Today", "Personal / Business", "Weekly", "Progress", "Morning", "Night",
    "Follow Ups", "Calendar", "Minimal Clock", "Utility", "Control Center",
    "Launcher", "Daily Note", "Quick Add", "Completed", "Essentials",
    "Countdown", "Overview"
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

  saveWidgetConfig(next);
  state.selected = next.list;

  const done = new Alert();
  done.title = "Home Widget Saved";
  done.message = TYPES[typeIndex][0].toUpperCase() + TYPES[typeIndex].slice(1) +
    " · " + listTitle(next.list) + " · " + THEMES[next.themeName].name;
  done.addAction("Preview");
  done.addAction("Done");
  const action = await done.present();

  if (action === 0) {
    const widget = buildWidget(data, next);
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
    "Countdown", "Overview"
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
  const widget = buildWidget(data, opts);
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
    saveWidgetConfig(next);

    const saved = new Alert();
    saved.title = "NaviOS Widget Updated";
    saved.message =
      next.type[0].toUpperCase() + next.type.slice(1) +
      " · " + listTitle(next.list) +
      " · " + THEMES[next.themeName].name;
    saved.addAction("Done");
    await saved.present();
    return { list: next.list, reopen: false };
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
  const widget = buildWidget(data, opts);
  Script.setWidget(widget);
  Script.complete();
} else {
  const result = await handleAction(data);
  data = loadData();
  if (result.reopen) await presentManager(data, result.list);
  Script.complete();
}
