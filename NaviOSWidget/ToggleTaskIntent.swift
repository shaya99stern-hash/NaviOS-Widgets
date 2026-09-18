import AppIntents
import Foundation

struct ToggleTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete NaviOS Task"

    @Parameter(title: "Task ID")
    var taskID: String

    init() {}

    init(taskID: UUID) {
        self.taskID = taskID.uuidString
    }

    func perform() async throws -> some IntentResult {
        if let id = UUID(uuidString: taskID) {
            TaskRepository.toggle(id: id)
        }
        return .result()
    }
}
