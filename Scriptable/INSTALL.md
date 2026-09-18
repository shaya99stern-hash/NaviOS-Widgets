# NaviOS Widget — Fast Install

## 1. Install Scriptable once
Install **Scriptable** from the App Store.

## 2. Open the NaviOS package
Open:

**`NaviOS.scriptable`**

This is the packaged NaviOS script. Import it into Scriptable as **NaviOS**.

No copying or pasting code is required.

## 3. Run NaviOS once
Open/run **NaviOS** in Scriptable once. This creates the local task database and opens the NaviOS task manager.

## 4. Put the real widget on the Home Screen
Apple requires this placement step manually:

1. Long-press the iPhone Home Screen.
2. Tap **Edit → Add Widget**.
3. Search **Scriptable**.
4. Choose **Medium** or **Large**.
5. Long-press the new widget → **Edit Widget**.
6. Script: **NaviOS**
7. When Interacting: **Run Script**
8. Parameter:
   - **personal** for Personal
   - **business** for Business

For two NaviOS widgets, add two Scriptable widgets and use a different parameter for each.

## After setup

You do not need GitHub, Vercel, Xcode, TestFlight, or a developer account for normal use.

NaviOS stores tasks locally at:

`Documents/NaviOS/tasks.json`

The repo also contains `NaviOS.js` for development and inspection, but normal installation should use **NaviOS.scriptable**.
