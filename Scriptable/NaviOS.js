// NaviOS — Scriptable-first widget
// Real iOS Home Screen widget hosted by Scriptable.
// No server. No Vercel. Tasks are stored locally on-device.

const VERSION = "1.0.0";
const SCRIPT_NAME = Script.name();

const COLORS = {
  bg: new Color("#050506"),
  panel: new Color("#0B0B0D"),
  text: new Color("#F2F0EB"),
  secondary: new Color("#8E8B86"),
  faint: new Color("#444247"),
  dividerA: new Color("#817B73", 0.42),
  dividerB: new Color("#817B73", 0.02),
  personal: new Color("#B8B1A8"),
  business: new Color("#A9ADB8"),
};

const fm = FileManager.local();
const root = fm.joinPath(fm.documentsDirectory(), "NaviOS");
const dataPath = fm.joinPath(root, "tasks.json");
if (!fm.fileExists(root)) fm.createDirectory(root, true);

const nowISO = () => new Date().toISOString();
const uid = () => String(Date.now()) + "-" + String(Math.floor(Math.random() * 100000));

function defaultData() {
  return {
    version: 1,
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
    const raw = fm.readString(dataPath);
    const parsed = JSON.parse(raw);
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) throw new Error("Invalid task file");
    return parsed;
  } catch (e) {
    const backup = dataPath + ".backup-" + Date.now();
    try { fm.copy(dataPath, backup); } catch (_) {}
    const seed = defaultData();
    saveData(seed);
    return seed;
  }
}

function saveData(data) {
  data.updatedAt = nowISO();
  fm.writeString(dataPath, JSON.stringify(data, null, 2));
}

function normalizeList(value) {
  const v = String(value || "").trim().toLowerCase();
  return v === "business" ? "business" : "personal";
}

function listTitle(list) {
  return list === "business" ? "Business" : "Personal";
}

function fmtDate(date) {
  const d = date || new Date();
  const df = new DateFormatter();
  df.locale = "en_US";
  df.dateFormat = "EEE, MMM d";
  return df.string(d).toUpperCase();
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

function scriptURL(params = {}) {
  const base = URLScheme.forRunningScript();
  const q = Object.entries(params)
    .map(([k,v]) => encodeURIComponent(k) + "=" + encodeURIComponent(String(v)))
    .join("&");
  return q ? base + (base.includes("?") ? "&" : "?") + q : base;
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

  const task = {
    id: uid(),
    list: initialList,
    title,
    completed: false,
    due,
    createdAt: nowISO()
  };
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

function buildWidget(data, list) {
  const widget = new ListWidget();
  widget.backgroundColor = COLORS.bg;
  widget.setPadding(14, 15, 13, 15);
  widget.spacing = 0;

  const header = widget.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  const left = header.addStack();
  left.layoutVertically();

  const date = left.addText(fmtDate(new Date()));
  date.font = Font.mediumSystemFont(9);
  date.textColor = COLORS.secondary;
  date.lineLimit = 1;

  const title = left.addText(listTitle(list));
  title.font = Font.newYorkFont(26);
  title.textColor = COLORS.text;
  title.lineLimit = 1;

  header.addSpacer();

  const mark = header.addText("◆");
  mark.font = Font.mediumSystemFont(8);
  mark.textColor = COLORS.secondary;
  mark.url = scriptURL({ action: "open", list });

  widget.addSpacer(8);

  const divider = widget.addStack();
  divider.size = new Size(0, 1);
  const gradient = new LinearGradient();
  gradient.colors = [COLORS.dividerA, COLORS.dividerB];
  gradient.locations = [0, 1];
  divider.backgroundGradient = gradient;

  widget.addSpacer(9);

  const active = data.tasks
    .filter(t => t.list === list && !t.completed)
    .sort((a,b) => {
      if (a.due && b.due) return new Date(a.due) - new Date(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  const family = config.widgetFamily || "medium";
  const maxRows = family === "large" ? 7 : family === "small" ? 2 : 4;

  if (!active.length) {
    widget.addSpacer();
    const empty = widget.addText("Nothing pressing.");
    empty.font = Font.regularSystemFont(12);
    empty.textColor = COLORS.secondary;
    empty.url = scriptURL({ action: "add", list });
    widget.addSpacer();
  } else {
    for (const task of active.slice(0, maxRows)) {
      const row = widget.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();
      row.url = scriptURL({ action: "toggle", id: task.id, list });
      row.setPadding(2, 0, 2, 0);

      const circle = row.addText("○");
      circle.font = Font.regularSystemFont(16);
      circle.textColor = COLORS.secondary;

      row.addSpacer(8);

      const taskStack = row.addStack();
      taskStack.layoutVertically();

      const txt = taskStack.addText(task.title);
      txt.font = Font.mediumSystemFont(family === "small" ? 11 : 13);
      txt.textColor = COLORS.text;
      txt.lineLimit = 1;
      txt.minimumScaleFactor = 0.75;

      const due = fmtDue(task.due);
      if (due && family !== "small") {
        const sub = taskStack.addText(due);
        sub.font = Font.regularSystemFont(8);
        sub.textColor = COLORS.secondary;
        sub.lineLimit = 1;
      }

      row.addSpacer();
      widget.addSpacer(family === "large" ? 6 : 5);
    }
  }

  if (family !== "small") {
    widget.addSpacer();
    const footer = widget.addStack();
    footer.layoutHorizontally();
    footer.centerAlignContent();

    const add = footer.addText("＋  ADD");
    add.font = Font.semiboldSystemFont(9);
    add.textColor = COLORS.secondary;
    add.url = scriptURL({ action: "add", list });

    footer.addSpacer();

    const count = active.length;
    const meta = footer.addText(count === 1 ? "1 OPEN" : count + " OPEN");
    meta.font = Font.mediumSystemFont(8);
    meta.textColor = COLORS.faint;
    meta.url = scriptURL({ action: "open", list });
  }

  widget.url = scriptURL({ action: "open", list });
  widget.refreshAfterDate = new Date(Date.now() + 20 * 60 * 1000);
  return widget;
}

async function presentManager(data, initialList) {
  let selected = initialList;

  while (true) {
    const table = new UITable();
    table.showSeparators = false;

    const top = new UITableRow();
    top.height = 60;
    top.isHeader = true;
    const heading = top.addText("NaviOS", listTitle(selected));
    heading.titleFont = Font.newYorkFont(28);
    heading.titleColor = COLORS.text;
    heading.subtitleFont = Font.mediumSystemFont(10);
    heading.subtitleColor = COLORS.secondary;
    table.addRow(top);

    const switcher = new UITableRow();
    switcher.height = 44;
    const personal = switcher.addText(selected === "personal" ? "●  Personal" : "○  Personal");
    const business = switcher.addText(selected === "business" ? "●  Business" : "○  Business");
    personal.titleColor = selected === "personal" ? COLORS.text : COLORS.secondary;
    business.titleColor = selected === "business" ? COLORS.text : COLORS.secondary;
    personal.titleFont = Font.semiboldSystemFont(12);
    business.titleFont = Font.semiboldSystemFont(12);
    switcher.onSelect = async () => {
      selected = selected === "personal" ? "business" : "personal";
    };
    table.addRow(switcher);

    const addRow = new UITableRow();
    addRow.height = 42;
    const addText = addRow.addText("＋  Add " + listTitle(selected) + " task");
    addText.titleFont = Font.semiboldSystemFont(12);
    addText.titleColor = COLORS.text;
    addRow.onSelect = async () => {
      await addTaskFlow(data, selected);
    };
    table.addRow(addRow);

    const tasks = data.tasks
      .filter(t => t.list === selected)
      .sort((a,b) => Number(a.completed) - Number(b.completed) || new Date(a.createdAt) - new Date(b.createdAt));

    for (const task of tasks) {
      const row = new UITableRow();
      row.height = 48;

      const prefix = task.completed ? "✓" : "○";
      const cell = row.addText(prefix + "  " + task.title, fmtDue(task.due) || "");
      cell.titleFont = Font.mediumSystemFont(13);
      cell.titleColor = task.completed ? COLORS.secondary : COLORS.text;
      cell.subtitleFont = Font.regularSystemFont(9);
      cell.subtitleColor = COLORS.secondary;

      row.onSelect = async () => {
        const choose = new Alert();
        choose.title = task.title;
        choose.addAction(task.completed ? "Mark Open" : "Complete");
        choose.addAction("Edit");
        choose.addCancelAction("Cancel");
        const c = await choose.present();
        if (c === 0) await toggleTask(data, task.id);
        if (c === 1) await editTaskFlow(data, task);
      };
      table.addRow(row);
    }

    const footer = new UITableRow();
    footer.height = 38;
    const f = footer.addText("NaviOS Widgets · v" + VERSION, "Local-only task data");
    f.titleFont = Font.mediumSystemFont(8);
    f.titleColor = COLORS.faint;
    f.subtitleFont = Font.regularSystemFont(8);
    f.subtitleColor = COLORS.faint;
    table.addRow(footer);

    await table.present(false);
    break;
  }
}

async function handleAction(data) {
  const q = args.queryParameters || {};
  const action = q.action || "open";
  const list = normalizeList(q.list);

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
  const list = normalizeList(args.widgetParameter);
  const widget = buildWidget(data, list);
  Script.setWidget(widget);
  Script.complete();
} else {
  const result = await handleAction(data);
  data = loadData();
  if (result.reopen) await presentManager(data, result.list);
  Script.complete();
}
