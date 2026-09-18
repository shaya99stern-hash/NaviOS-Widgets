import Foundation
import Combine

@MainActor
final class TaskListModel: ObservableObject {
    @Published var tasks: [TaskItem] = []
    @Published var selectedList: TaskListKind = .personal
    @Published var showAddTask = false

    init() { reload() }

    var visibleTasks: [TaskItem] {
        tasks.filter { $0.list == selectedList }
    }

    func reload() {
        tasks = TaskRepository.load()
    }

    func add(
        title: String,
        list: TaskListKind,
        dueDate: Date?,
        useCurrentLocation: Bool,
        coordinate: (Double, Double)?
    ) {
        let task = TaskItem(
            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
            dueDate: dueDate,
            list: list,
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

    func deleteVisible(at offsets: IndexSet) {
        let ids = offsets.compactMap { index in
            visibleTasks.indices.contains(index) ? visibleTasks[index].id : nil
        }
        var all = TaskRepository.load()
        all.removeAll { ids.contains($0.id) }
        TaskRepository.save(all)
        reload()
    }
}
