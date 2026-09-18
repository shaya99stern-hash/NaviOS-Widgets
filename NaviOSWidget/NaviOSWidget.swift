import SwiftUI
import WidgetKit
import CoreLocation

struct NaviEntry: TimelineEntry {
    let date: Date
    let tasks: [TaskItem]
    let nearbyTaskIDs: Set<UUID>
}

struct NaviProvider: TimelineProvider {
    func placeholder(in context: Context) -> NaviEntry {
        NaviEntry(
            date: .now,
            tasks: [
                TaskItem(title: "Follow up"),
                TaskItem(title: "Prepare for tomorrow")
            ],
            nearbyTaskIDs: []
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (NaviEntry) -> Void) {
        completion(makeEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NaviEntry>) -> Void) {
        let entry = makeEntry()
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now.addingTimeInterval(1800)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func makeEntry() -> NaviEntry {
        let tasks = TaskRepository.load()
        var nearby = Set<UUID>()

        if let (lat, lon) = TaskRepository.lastCoordinate() {
            let current = CLLocation(latitude: lat, longitude: lon)
            for task in tasks where !task.isCompleted && task.hasLocation {
                guard let tLat = task.latitude, let tLon = task.longitude else { continue }
                let target = CLLocation(latitude: tLat, longitude: tLon)
                if current.distance(from: target) <= (task.radiusMeters ?? 250) {
                    nearby.insert(task.id)
                }
            }
        }

        let prioritized = tasks.sorted { lhs, rhs in
            let lNear = nearby.contains(lhs.id)
            let rNear = nearby.contains(rhs.id)
            if lNear != rNear { return lNear }
            if lhs.isCompleted != rhs.isCompleted { return !lhs.isCompleted }
            return (lhs.dueDate ?? .distantFuture) < (rhs.dueDate ?? .distantFuture)
        }

        return NaviEntry(date: .now, tasks: prioritized, nearbyTaskIDs: nearby)
    }
}

struct NaviOSWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: NaviEntry

    private var visibleCount: Int {
        family == .systemLarge ? 6 : 3
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 1) {
                    Text(entry.date.formatted(.dateTime.weekday(.wide).month(.abbreviated).day()))
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                    Text("Personal")
                        .font(.system(size: family == .systemLarge ? 31 : 25, weight: .regular, design: .serif))
                }
                Spacer()
                Image(systemName: "sparkles")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [.white.opacity(0.38), .white.opacity(0.05)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 0.5)
                .padding(.vertical, 10)

            if entry.tasks.filter({ !$0.isCompleted }).isEmpty {
                Spacer()
                Text("Nothing pressing.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
            } else {
                VStack(spacing: 8) {
                    ForEach(Array(entry.tasks.filter { !$0.isCompleted }.prefix(visibleCount))) { task in
                        HStack(spacing: 8) {
                            Button(intent: ToggleTaskIntent(taskID: task.id)) {
                                Image(systemName: "circle")
                                    .font(.system(size: 15))
                            }
                            .buttonStyle(.plain)

                            VStack(alignment: .leading, spacing: 1) {
                                Text(task.title)
                                    .font(.system(size: 14, weight: .medium))
                                    .lineLimit(1)

                                if entry.nearbyTaskIDs.contains(task.id) {
                                    Label("nearby", systemImage: "location.fill")
                                        .font(.system(size: 9, weight: .medium))
                                        .foregroundStyle(.secondary)
                                } else if let due = task.dueDate {
                                    Text(due, style: .relative)
                                        .font(.system(size: 9))
                                        .foregroundStyle(.secondary)
                                }
                            }

                            Spacer(minLength: 0)
                        }
                    }
                }
                Spacer(minLength: 4)
            }

            Link(destination: URL(string: "navioswidgets://add")!) {
                HStack(spacing: 5) {
                    Image(systemName: "plus")
                    Text("Add")
                }
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
            }
        }
        .containerBackground(for: .widget) {
            Color(red: 0.025, green: 0.025, blue: 0.028)
        }
    }
}

struct NaviOSWidget: Widget {
    let kind = "NaviOSWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NaviProvider()) { entry in
            NaviOSWidgetView(entry: entry)
        }
        .configurationDisplayName("NaviOS Personal")
        .description("A quiet, offline-first view of what matters next.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

@main
struct NaviOSWidgetBundle: WidgetBundle {
    var body: some Widget {
        NaviOSWidget()
    }
}
