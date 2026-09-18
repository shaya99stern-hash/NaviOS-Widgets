import Foundation
import CoreLocation

struct TaskItem: Identifiable, Codable, Hashable {
    var id: UUID = UUID()
    var title: String
    var dueDate: Date?
    var isCompleted: Bool = false
    var priority: Int = 0

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
}
