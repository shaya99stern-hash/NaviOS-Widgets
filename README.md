# NaviOS Widgets

Native, offline-first iPhone widgets in the NaviOS visual language.

## What this project is

- **Native SwiftUI app** — no embedded website and no PWA runtime.
- **WidgetKit Home Screen widget** — medium and large layouts.
- **Interactive task completion** using App Intents.
- **Offline-first shared storage** through an App Group.
- **Local notifications** for due-task reminders.
- **Optional GPS context** for location-aware tasks without needing a network connection.

> Widgets are intentionally glanceable. Apple doesn't support arbitrary scrolling lists or text entry inside a widget, so task entry lives in the companion app while completion can happen directly from the widget.

## Build

This repository uses [XcodeGen](https://github.com/yonaskolb/XcodeGen) so the Xcode project is reproducible instead of committing a fragile generated `.xcodeproj`.

1. Install Xcode and XcodeGen on a Mac.
2. In the repo root run: `xcodegen generate`
3. Open `NaviOSWidgets.xcodeproj`.
4. Select your Apple Development team for both targets.
5. If the App Group identifier is unavailable to your team, replace `group.com.navios.widgets` in `project.yml` and `Shared/AppConstants.swift`.
6. Run the NaviOSWidgets app on your iPhone once to grant notification/location permission, then add the widget from the iPhone Home Screen.

## Design

The UI is intentionally matte black, restrained, serif-led, and minimal:
- warm gray typography
- thin gradient separator
- oversized editorial date
- subtle task rows
- no web chrome
- no dependence on the internet

## Privacy

Task data stays on-device in the shared App Group container. GPS is optional. The current implementation stores coordinates only when the user explicitly attaches a location to a task; it does not upload location or task data anywhere.
