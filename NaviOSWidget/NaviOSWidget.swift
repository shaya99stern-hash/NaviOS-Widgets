import SwiftUI
import WidgetKit
import CoreLocation
import AppIntents

struct NaviEntry: TimelineEntry {
    let date: Date
    let list: TaskListKind
    let tasks: [TaskItem]
    let nearbyTaskIDs: Set<UUID>
}

struct NaviProvider: AppIntentTimelineProvider {
    typealias Intent = WidgetListIntent
    typealias Entry = NaviEntry

    func placeholder(in context: Context) -> NaviEntry {
        NaviEntry(
            date: .now,
            list: .personal,
            tasks: [
                TaskItem(title: "Relax", list: .personal),
                TaskItem(title: "Prepare for tomorrow", list: .personal)
            ],
            nearbyTaskIDs: []
        )
    }

    func snapshot(for configuration: WidgetListIntent, in context: Context) async -> NaviEntry {
        makeEntry(list: configuration.list)
    }

    func timeline(for configuration: WidgetListIntent, in context: Context) async -> Timeline<NaviEntry> {
        let entry = makeEntry(list: configuration.list)
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now)
            ?? .now.addingTimeInterval(1800)
        return Timeline(entries: [entry], policy: .after(next))
    }

    private func makeEntry(list: TaskListKind) -> NaviEntry {
        let tasks = TaskRepository.load().filter { $0.list == list }
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

        return NaviEntry(
            date: .now,
            list: list,
            tasks: prioritized,
            nearbyTaskIDs: nearby
        )
    }
}

struct NaviOSWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: NaviEntry

    private var visibleCount: Int {
        switch family {
        case .systemSmall: return 2
        case .systemLarge: return 6
        default: return 3
        }
    }

    private var incompleteTasks: [TaskItem] {
        entry.tasks.filter { !$0.isCompleted }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                VStack(alignment: .leading, spacing: 1) {
                    Text(entry.date.formatted(.dateTime.month(.abbreviated).day()))
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    Text(entry.list.title)
                        .font(
                            .system(
                                size: family == .systemSmall ? 22 : (family == .systemLarge ? 31 : 25),
                                weight: .regular,
                                design: .serif
                            )
                        )
                        .lineLimit(1)
                }

                Spacer(minLength: 4)

                Image(systemName: "diamond.fill")
                    .font(.system(size: 7))
                    .foregroundStyle(.secondary.opacity(0.65))
            }

            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [.white.opacity(0.38), .white.opacity(0.04)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 0.5)
                .padding(.vertical, family == .systemSmall ? 7 : 10)

            if incompleteTasks.isEmpty {
                Spacer()
                Text("Nothing pressing.")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                Spacer()
            } else {
                VStack(spacing: family == .systemSmall ? 7 : 8) {
                    ForEach(Array(incompleteTasks.prefix(visibleCount))) { task in
                        HStack(spacing: 8) {
                            Button(intent: ToggleTaskIntent(taskID: task.id)) {
                                Image(systemName: "circle")
                                    .font(.system(size: family == .systemSmall ? 13 : 15))
                            }
                            .buttonStyle(.plain)

                            VStack(alignment: .leading, spacing: 1) {
                                Text(task.title)
                                    .font(.system(size: family == .systemSmall ? 12 : 14, weight: .medium))
                                    .lineLimit(1)

                                if entry.nearbyTaskIDs.contains(task.id) {
                                    Label("nearby", systemImage: "location.fill")
                                        .font(.system(size: 8, weight: .medium))
                                        .foregroundStyle(.secondary)
                                } else if family != .systemSmall, let due = task.dueDate {
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

            if family != .systemSmall {
                Link(destination: URL(string: "navioswidgets://add")!) {
                    HStack(spacing: 5) {
                        Image(systemName: "plus")
                        Text("Add")
                    }
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(.secondary)
                }
            }
        }
        .containerBackground(for: .widget) {
            Color(red: 0.018, green: 0.018, blue: 0.021)
        }
    }
}

struct NaviOSWidget: Widget {
    let kind = "NaviOSWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: WidgetListIntent.self,
            provider: NaviProvider()
        ) { entry in
            NaviOSWidgetView(entry: entry)
        }
        .configurationDisplayName("NaviOS")
        .description("Personal or Business tasks, kept locally on your iPhone.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

@main
struct NaviOSWidgetBundle: WidgetBundle {
    var body: some Widget {
        NaviOSWidget()
    }
}
