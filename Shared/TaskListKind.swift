import Foundation
import AppIntents

enum TaskListKind: String, Codable, CaseIterable, Identifiable, AppEnum {
    case personal
    case business

    var id: String { rawValue }

    var title: String {
        switch self {
        case .personal: return "Personal"
        case .business: return "Business"
        }
    }

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "List"

    static var caseDisplayRepresentations: [TaskListKind: DisplayRepresentation] = [
        .personal: "Personal",
        .business: "Business"
    ]
}
