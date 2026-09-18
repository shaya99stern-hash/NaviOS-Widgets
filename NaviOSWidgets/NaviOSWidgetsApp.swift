import SwiftUI

@main
struct NaviOSWidgetsApp: App {
    @StateObject private var model = TaskListModel()
    @StateObject private var location = LocationService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(model)
                .environmentObject(location)
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    if url.host == "add" { model.showAddTask = true }
                }
        }
    }
}
