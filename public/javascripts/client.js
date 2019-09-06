const berlinCenter = { lat: 52.53, lng: 13.403 };
const defaultZoom = 10;

/**
 * This method sets the icon for the marker on the map
 * @param marker : the actual google map marker
 * @param prevPos : last location for that marker
 * @param currentPos : current location for that marker which has recently been created in the backend.
 */
const setMarkerIcon = (marker, prevPos, currentPos) => {
  marker.setIcon({
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    strokeColor: "red",
    strokeWeight: 3,
    scale: 6,
    rotation: google.maps.geometry.spherical.computeHeading(prevPos, currentPos)
  });
};

/**
 * This class encapsulate helper methods for creating markers with
 * their directions.
 */
class VehicleVisualizer {
  constructor(google, vehicles, center, zoom) {
    this.center = center || berlinCenter;
    this.zoom = zoom || defaultZoom;
    this.vehicles = vehicles || {};
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: this.zoom,
      center: this.center
    });
  }

  addMarker(lat, lng) {
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map
    });
    this.marker = marker;
  }

  getVehicle(key) {
    return this.vehicles[key];
  }

  clusterVehicles() {
    const markers = [];
    for (const key in this.vehicles) {
      markers.push(this.getVehicle(key).marker);
    }
    new MarkerClusterer(this.map, markers);
  }

  /**
   * This method is responsible for actually setting up the marker with its icon
   * @param vehicle : vehicle object from backend
   * @param newMarker : if a marker exists use it otherwise create a new one and attach it
   */
  setMarkerPositionWithDirection(vehicle, newMarker = null) {
    const currentPos = new google.maps.LatLng({
      lat: vehicle.currentLocation.lat,
      lng: vehicle.currentLocation.lng
    });
    const marker =
      newMarker ||
      new google.maps.Marker({
        position: { lat: currentPos.lat(), lng: currentPos.lng() }
      });
    vehicle.marker = marker;

    if (!vehicle.lastLocation) {
      return;
    }

    const prevPos = new google.maps.LatLng({
      lat: vehicle.lastLocation.lat,
      lng: vehicle.lastLocation.lng
    });
    setMarkerIcon(marker, prevPos, currentPos);
  }

  populateMarkers() {
    for (const key in this.vehicles) {
      const vehicle = this.getVehicle(key);
      if (!vehicle || !vehicle.currentLocation) {
        console.log("couldn't find lat or lang for the vehicle");
        continue;
      }

      this.setMarkerPositionWithDirection(vehicle);
    }
    this.clusterVehicles();
  }
}

/**
 * This method gets called by google api when it finishes loading
 */
function initMap() {
  let vehicleVisualizer;

  if (google && !google) {
    setTimeout(initMap, 2000);
  }
  const socket = io();

  // Whenever the socket connection is established, the backend will post to this channel.
  socket.on("connectionSuccessful", res => {
    console.log(res.vehicles);
    vehicleVisualizer = new VehicleVisualizer(google, res.vehicles);
    vehicleVisualizer.populateMarkers();
  });

  // Whenever there is a new update, the backend will post to this channel.
  socket.on("locationUpdated", res => {
    if (!vehicleVisualizer) return;

    const vehicle = vehicleVisualizer.getVehicle(res.vehicleId);
    if (!vehicle) return;

    let marker = vehicle.marker;
    if (!marker) {
      vehicle.addMarker(res.lat, res.lng);
    } else {
      marker.setPosition(new google.maps.LatLng(res.lat, res.lng));
      vehicleVisualizer.setMarkerPositionWithDirection(vehicle, marker);
    }
  });
}
