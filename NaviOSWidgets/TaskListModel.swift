import Foundation

@MainActor
final class TaskListModel: ObservableObject {
    @Published var tasks: [TaskItem] = []
    @Published var showAddTask = false

    init() { reload() }

    func reload() {
        tasks = TaskRepository.load()
    }

    func add(title: String, dueDate: Date?, useCurrentLocation: Bool, coordinate: (Double, Double)?) {
        let task = TaskItem(
            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
            dueDate: dueDate,
            latitude: useCurrentLocation ? coordinate?.0 : nil,
            longitude: useCurrentLocation ? coordinate?.1 : nil
        )
        TaskRepository.add(task)
        if let dueDate { ReminderScheduler.schedule(task: task, at: dueDate) }
        reload()
    }

    func toggle(_ task: TaskItem) {
        TaskRepository.toggle(id: task.id)
        reload()
    }

    func delete(at offsets: IndexSet) {
        TaskRepository.remove(at: offsets)
        reload()
    }
}
