# NaviOS Scriptable Widget — Install

This is the recommended NaviOS Widgets path. It creates a **real iOS Home Screen widget** using Scriptable as the native WidgetKit host.

## Install

1. Install **Scriptable** from the App Store.
2. Open the raw `Scriptable/NaviOS.js` file from this repository.
3. Copy the entire file.
4. In Scriptable, tap **+**, paste it, and name the script exactly:
   **NaviOS**
5. Run the script once. It creates the local NaviOS task file and opens the task manager.

## Add the widget

1. Long-press the iPhone Home Screen.
2. Tap **Edit → Add Widget**.
3. Search for **Scriptable**.
4. Choose **Medium** or **Large**.
5. Long-press the new widget → **Edit Widget**.
6. Set **Script** to `NaviOS`.
7. Set **When Interacting** to `Run Script`.
8. Set **Parameter** to:
   - `personal` for the Personal widget
   - `business` for the Business widget

You can add two Scriptable widgets side-by-side or on different Home Screen pages and configure one for each list.

## What works

- Real medium / large iOS Home Screen widget
- Personal / Business
- Matte NaviOS visual style
- Local-only JSON storage
- Tap a task row to mark it complete
- Tap **ADD** to create a task
- Optional local notification times
- No Vercel
- No server
- No Apple Developer account
- No sideloading or weekly signing

## Storage

The script uses Scriptable's local Documents directory:

`Documents/NaviOS/tasks.json`

No task data is uploaded by this script.

## Widget refresh behavior

Scriptable asks iOS to refresh the widget periodically, but iOS ultimately decides refresh timing. Task rows use Scriptable deep links, so taps run the script immediately and update local data.

## Notes

Small widgets are supported visually but iOS only permits one overall tap target there. Medium and large are the recommended NaviOS sizes because Scriptable supports individual element URLs in those sizes.
