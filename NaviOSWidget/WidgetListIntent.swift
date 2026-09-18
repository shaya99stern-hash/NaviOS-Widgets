import AppIntents
import WidgetKit

struct WidgetListIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "NaviOS List"
    static var description = IntentDescription("Choose which NaviOS list this widget shows.")

    @Parameter(title: "List", default: .personal)
    var list: TaskListKind
}
