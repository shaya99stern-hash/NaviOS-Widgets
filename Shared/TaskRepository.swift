import Foundation
import WidgetKit

enum TaskRepository {
    private static var defaults: UserDefaults {
        UserDefaults(suiteName: AppConstants.appGroup) ?? .standard
    }

    static func load() -> [TaskItem] {
        guard
            let data = defaults.data(forKey: AppConstants.tasksKey),
            let tasks = try? JSONDecoder().decode([TaskItem].self, from: data)
        else { return [] }

        return tasks.sorted {
            if $0.isCompleted != $1.isCompleted { return !$0.isCompleted }
            switch ($0.dueDate, $1.dueDate) {
            case let (a?, b?): return a < b
            case (_?, nil): return true
            case (nil, _?): return false
            default: return $0.priority > $1.priority
            }
        }
    }

    static func save(_ tasks: [TaskItem]) {
        guard let data = try? JSONEncoder().encode(tasks) else { return }
        defaults.set(data, forKey: AppConstants.tasksKey)
        WidgetCenter.shared.reloadAllTimelines()
    }

    static func add(_ task: TaskItem) {
        var tasks = load()
        tasks.append(task)
        save(tasks)
    }

    static func toggle(id: UUID) {
        var tasks = load()
        guard let index = tasks.firstIndex(where: { $0.id == id }) else { return }
        tasks[index].isCompleted.toggle()
        save(tasks)
    }

    static func remove(at offsets: IndexSet) {
        var tasks = load()
        for index in offsets.sorted(by: >) where tasks.indices.contains(index) {
            tasks.remove(at: index)
        }
        save(tasks)
    }

    static func updateLastLocation(latitude: Double, longitude: Double) {
        defaults.set(latitude, forKey: AppConstants.lastLatitudeKey)
        defaults.set(longitude, forKey: AppConstants.lastLongitudeKey)
        defaults.set(Date(), forKey: AppConstants.lastLocationDateKey)
        WidgetCenter.shared.reloadAllTimelines()
    }

    static func lastCoordinate(maxAge: TimeInterval = 60 * 60 * 6) -> (Double, Double)? {
        guard let date = defaults.object(forKey: AppConstants.lastLocationDateKey) as? Date,
              Date().timeIntervalSince(date) < maxAge else { return nil }
        return (
            defaults.double(forKey: AppConstants.lastLatitudeKey),
            defaults.double(forKey: AppConstants.lastLongitudeKey)
        )
    }
}
