import AppIntents
import WidgetKit

struct WidgetListIntent: WidgetConfigurationIntent {
    nonisolated static var title: LocalizedStringResource { "NaviOS List" }
    nonisolated static var description: IntentDescription {
        IntentDescription("Choose which NaviOS list this widget shows.")
    }

    @Parameter(title: "List", default: .personal)
    var list: TaskListKind
}
