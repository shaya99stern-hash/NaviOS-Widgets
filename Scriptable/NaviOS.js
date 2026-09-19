// NaviOS Widgets — Scriptable Theme Suite
// Real iOS Home Screen widgets hosted by Scriptable.
// No server, no Vercel, no developer account, local-first task storage.

const VERSION = "2.3.0";
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

const TYPES = ["tasks", "clock", "agenda", "dashboard", "focus", "status", "compact"];

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
  w.setPadding(14, 15, 13, 15);
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
  h.font = displayFont(t, 25, "regular");
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
  const maxRows = family === "large" ? 7 : family === "small" ? 2 : 4;

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

function buildWidget(data, opts) {
  if (opts.type === "clock") return buildClockWidget(data, opts);
  if (opts.type === "agenda") return buildAgendaWidget(data, opts);
  if (opts.type === "dashboard") return buildDashboardWidget(data, opts);
  if (opts.type === "focus") return buildFocusWidget(data, opts);
  if (opts.type === "status") return buildStatusWidget(data, opts);
  if (opts.type === "compact") return buildCompactWidget(data, opts);
  return buildTasksWidget(data, opts);
}

async function chooseHomeWidget(data, state) {
  const current = loadWidgetConfig();

  const typeAlert = new Alert();
  typeAlert.title = "Home Widget";
  typeAlert.message = "Choose what your NaviOS widget shows.";
  typeAlert.addAction("Tasks");
  typeAlert.addAction("Clock");
  typeAlert.addAction("Agenda");
  typeAlert.addAction("Dashboard");
  typeAlert.addAction("Focus");
  typeAlert.addAction("Status");
  typeAlert.addAction("Compact");
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
  a.addAction("Tasks");
  a.addAction("Clock");
  a.addAction("Agenda");
  a.addAction("Dashboard");
  a.addAction("Focus");
  a.addAction("Status");
  a.addAction("Compact");
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
