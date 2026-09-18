# NaviOS Widgets

A dark, minimal iPhone to-do widget system in the NaviOS visual language.

## Recommended path: Scriptable

The easiest version to actually use on an iPhone is the **Scriptable** build.

It gives you a real iOS Home Screen widget without:
- Xcode
- TestFlight
- Apple Developer membership
- sideloading
- weekly re-signing
- Vercel
- a backend server

The Scriptable app provides the native WidgetKit host, while `Scriptable/NaviOS.js` provides the NaviOS design, local task data, reminders, and widget behavior.

### Install

Start here:

**`Scriptable/INSTALL.md`**

Then copy:

**`Scriptable/NaviOS.js`**

into a Scriptable script named exactly `NaviOS`.

### Widget setup

Add a Scriptable widget from the iPhone Home Screen and configure:

- Script: `NaviOS`
- When Interacting: `Run Script`
- Parameter: `personal` or `business`

Medium and large widgets are recommended because they support individual tappable elements.

## Scriptable features

- Personal / Business lists
- medium and large real Home Screen widgets
- matte-black NaviOS styling
- serif editorial heading
- compact task rows
- task completion from the widget
- add-task action
- local reminder notifications
- local JSON storage
- no web dependency after installation
- no task upload

Local data lives in Scriptable's Documents directory at:

`Documents/NaviOS/tasks.json`

## Native Swift version

The original native SwiftUI + WidgetKit implementation is still preserved in this repository.

It includes:
- WidgetKit
- App Intents
- App Group storage
- local notifications
- optional CoreLocation support
- Personal / Business widget configuration

That version remains useful for a future standalone NaviOS app, but it is **not the recommended install path right now** because native distribution requires Apple signing.

## Design

NaviOS Widgets is intentionally:
- matte
- minimal
- dark
- serif-led
- low-noise
- compact
- privacy-first

No bright productivity-app styling, unnecessary cards, or web chrome.
