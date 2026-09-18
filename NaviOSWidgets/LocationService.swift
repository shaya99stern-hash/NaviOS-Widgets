import CoreLocation
import Foundation
import Combine

final class LocationService: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()

    @Published private(set) var coordinate: (Double, Double)?
    @Published private(set) var authorization: CLAuthorizationStatus = .notDetermined

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        authorization = manager.authorizationStatus
    }

    func requestPermissionAndLocation() {
        manager.requestWhenInUseAuthorization()
        manager.requestLocation()
    }

    func refresh() {
        guard manager.authorizationStatus == .authorizedWhenInUse ||
              manager.authorizationStatus == .authorizedAlways else {
            requestPermissionAndLocation()
            return
        }
        manager.requestLocation()
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus

        DispatchQueue.main.async { [weak self] in
            self?.authorization = status
        }

        if status == .authorizedWhenInUse || status == .authorizedAlways {
            manager.requestLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }

        let latitude = location.coordinate.latitude
        let longitude = location.coordinate.longitude

        DispatchQueue.main.async { [weak self] in
            self?.coordinate = (latitude, longitude)
        }

        TaskRepository.updateLastLocation(
            latitude: latitude,
            longitude: longitude
        )
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // GPS is optional. Tasks and reminders remain fully functional offline.
    }
}
