import Foundation
import CoreLocation

struct TaskItem: Identifiable, Codable, Hashable {
    var id: UUID = UUID()
    var title: String
    var dueDate: Date?
    var isCompleted: Bool = false
    var priority: Int = 0
    var list: TaskListKind = .personal

    // Optional offline location trigger. No reverse-geocoding or internet required.
    var latitude: Double?
    var longitude: Double?
    var radiusMeters: Double? = 250

    var hasLocation: Bool {
        latitude != nil && longitude != nil
    }

    func distance(from coordinate: CLLocationCoordinate2D) -> CLLocationDistance? {
        guard let latitude, let longitude else { return nil }
        let a = CLLocation(latitude: latitude, longitude: longitude)
        let b = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        return a.distance(from: b)
    }

    private enum CodingKeys: String, CodingKey {
        case id, title, dueDate, isCompleted, priority, list
        case latitude, longitude, radiusMeters
    }

    init(
        id: UUID = UUID(),
        title: String,
        dueDate: Date? = nil,
        isCompleted: Bool = false,
        priority: Int = 0,
        list: TaskListKind = .personal,
        latitude: Double? = nil,
        longitude: Double? = nil,
        radiusMeters: Double? = 250
    ) {
        self.id = id
        self.title = title
        self.dueDate = dueDate
        self.isCompleted = isCompleted
        self.priority = priority
        self.list = list
        self.latitude = latitude
        self.longitude = longitude
        self.radiusMeters = radiusMeters
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        title = try c.decode(String.self, forKey: .title)
        dueDate = try c.decodeIfPresent(Date.self, forKey: .dueDate)
        isCompleted = try c.decodeIfPresent(Bool.self, forKey: .isCompleted) ?? false
        priority = try c.decodeIfPresent(Int.self, forKey: .priority) ?? 0
        list = try c.decodeIfPresent(TaskListKind.self, forKey: .list) ?? .personal
        latitude = try c.decodeIfPresent(Double.self, forKey: .latitude)
        longitude = try c.decodeIfPresent(Double.self, forKey: .longitude)
        radiusMeters = try c.decodeIfPresent(Double.self, forKey: .radiusMeters) ?? 250
    }
}
