# Widget capabilities — v3.5

This file is the source of truth for what each widget **actually does**.

## Supported surfaces

- **Home Screen:** Scriptable Small, Medium, Large.
- **Lock Screen:** Scriptable Inline, Circular, Rectangular on iOS 16+.
- The same widget type/theme can be used on both surfaces. The engine detects the widget family and renders an appropriate layout.
- iOS controls widget refresh timing. Scriptable can request a refresh date, but iOS may refresh later.

## Data sources and behavior

| Widget | Actual data | Tap/action | Home Screen | Lock Screen |
|---|---|---|---|---|
| Tasks | Scriptable local `Documents/NaviOS/tasks.json` | Opens task list; task rows can toggle complete | Small/Medium/Large | Inline/Circular/Rectangular summary |
| Clock | iPhone device time/date | Opens configured list/manager | Small/Medium/Large | Live time summary when iOS refreshes |
| Agenda | Local NaviOS tasks with due dates | Opens/toggles local tasks | Small/Medium/Large | Next local due item |
| Dashboard | Device time + local task counts/completions | Opens manager | Small/Medium/Large | Compact counts |
| Focus | Next open local task | Tap opens/toggles focus task where applicable | Small/Medium/Large | Next task text |
| Status | Device battery + device time + local task counts | Opens manager | Small/Medium/Large | Battery/count summary |
| Compact | Date + first local tasks | Opens task list | Small/Medium/Large | Compact open-count summary |
| Today | Local tasks due today; falls back to open local tasks | Opens/toggles tasks | Small/Medium/Large | Today's open count |
| Personal / Business | Counts + next local item from both local lists | Opens manager | Small/Medium/Large | Personal/business counts |
| Weekly | Local tasks with due dates across next 7 days | Opens manager | Small/Medium/Large | Scheduled count |
| Progress | Completion % derived from local tasks | Opens manager | Small/Medium/Large | Completion % |
| Morning Setup | Device time/date + first local tasks | Opens manager | Small/Medium/Large | Morning/open summary |
| Night Reset | Local tomorrow-due tasks + completed-today count | Opens manager | Small/Medium/Large | Done/tomorrow summary |
| Follow Ups | Local Business tasks matched by follow/call/email/text/reply/contact/send terms | Opens Business list | Small/Medium/Large | Next follow-up |
| Calendar + Tasks | **Local task due dates**, not Apple Calendar events yet | Opens manager | Small/Medium/Large | Next local due item |
| Minimal Clock | Device time/date + local task counts | Opens manager | Small/Medium/Large | Time |
| Utility Grid | Device battery + time + local Personal/Business counts | Opens manager | Small/Medium/Large | Compact status |
| Control Center | Device time/battery + local task stats | Opens manager | Small/Medium/Large | Compact status |
| Launcher | Scriptable deep links for add/open task actions | Runs selected Scriptable action | Small/Medium/Large | Opens quick actions |
| Daily Note | Uses the current first open local task as the displayed note/intention | Opens list | Small/Medium/Large | Note/next item |
| Quick Add | Scriptable local task creation for Personal/Business | Opens Scriptable input flow | Small/Medium/Large | Tap invokes add flow; iOS may open Scriptable for input |
| Recently Completed | Local completed-task history | Opens manager | Small/Medium/Large | Completed-today summary |
| Personal Essentials | Open local Personal tasks | Opens Personal list | Small/Medium/Large | Personal open count |
| Countdown | Next local task with a due date | Opens/toggles timed task | Small/Medium/Large | Remaining-time summary |
| Overview | Local Personal/Business counts + next local tasks | Opens manager | Small/Medium/Large | Counts |
| ChatGPT | Scriptable Dictation or typed input; prompt is copied to clipboard; ChatGPT app is opened | Dictate / Ask / open ChatGPT / Drive links | Small/Medium/Large | Lock widget can launch Dictate/ChatGPT action; dictation requires Scriptable interaction |
| Case Activity | Current hosted activity JSON + direct links to connected Drive working docs | Opens the working hub/checkpoint | Small/Medium/Large | Latest activity summary | 

## Case Activity status

The widget renderer is working, but the current feed is a hosted JSON snapshot. It is **not yet a private direct Google Drive API feed**. Do not describe it as real-time Drive sync until the private Vercel backend/OAuth bridge is deployed.

## Home Screen layouts

The Studio includes coordinated Home Screen set previews and matching widget/theme choices. iOS does **not** allow the PWA or Scriptable to silently rearrange app icons, so the user still places icons/widgets on the Home Screen manually.

## Wallpapers

The Studio generates matching Home Screen and Lock Screen PNG wallpapers for each set. These are actual downloadable images generated locally in the browser.

## Lock Screen limitations

Scriptable supports `accessoryInline`, `accessoryCircular`, and `accessoryRectangular`. Lock Screen widgets are tinted/vibrant by iOS and do not preserve full-color Home Screen styling. Refresh timing is controlled by iOS.
