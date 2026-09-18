# NaviOS Widgets — Fast Install

## 1. Install Scriptable once
Install **Scriptable** from the App Store.

## 2. Open the NaviOS package
Open **NaviOS.scriptable** from this repository and import it into Scriptable as **NaviOS**.

No copying or pasting code is required.

## 3. Run NaviOS once
Open/run **NaviOS** in Scriptable once.

This creates the local task database and opens **NaviOS Widget Studio**, where you can manage tasks and preview custom widget styles.

## 4. Add a real Home Screen widget
Apple requires this placement step manually:

1. Long-press the iPhone Home Screen.
2. Tap **Edit → Add Widget**.
3. Search **Scriptable**.
4. Choose **Medium** or **Large**.
5. Long-press the new widget → **Edit Widget**.
6. Script: **NaviOS**
7. When Interacting: **Run Script**
8. Enter one of the parameters below.

## Parameter format

`type|list|theme`

### Widget types
- `tasks`
- `clock`
- `agenda`
- `dashboard`

### Lists
- `personal`
- `business`

### Themes
- `graphite` — Graphite Minimal
- `editorial` — Matte Editorial
- `noir` — Dashboard Noir
- `glass` — Monochrome Glass
- `stone` — Soft Stone
- `luxe` — Luxe Panel

## Ready-to-use presets

**Classic NaviOS tasks**
`tasks|personal|graphite`

**Elegant Personal**
`tasks|personal|editorial`

**Business dashboard**
`dashboard|business|noir`

**Luxury clock**
`clock|personal|luxe`

**Warm agenda**
`agenda|personal|stone`

**Modern glass dashboard**
`dashboard|personal|glass`

You can add multiple Scriptable widgets and give every instance a different parameter.

## Preview before adding

Run **NaviOS** normally inside Scriptable and tap:

**Preview Custom Widgets**

Choose the widget type and theme. NaviOS will render a medium preview before you commit it to your Home Screen.

## Local storage

Your tasks are stored locally at:

`Documents/NaviOS/tasks.json`

No NaviOS server or Vercel deployment is required.

## What NaviOS v2 includes

- six custom dark themes
- Tasks, Clock, Agenda, and Dashboard widgets
- Personal / Business task lists
- medium and large Home Screen layouts
- local reminders
- tap-to-complete task rows
- add/edit/delete task manager
- built-in widget previews
- local-only data
