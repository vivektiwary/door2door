const berlinCenter = { lat: 52.53, lng: 13.403 };
const defaultZoom = 10;

const setMarkerIcon = (marker, prevPos, currentPos) => {
  marker.setIcon({
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    strokeColor: "red",
    strokeWeight: 3,
    scale: 6,
    rotation: google.maps.geometry.spherical.computeHeading(prevPos, currentPos)
  });
};

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

  setMarkerPositionWithDirection(vehicle, newMarker = null) {
    const currentPos = new google.maps.LatLng({
      lat: vehicle.currentLocation.lat,
      lng: vehicle.currentLocation.lng
    });
    const marker = newMarker || new google.maps.Marker({
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
      if (vehicle.currentLocation === null) {
        console.log("couldn't find lat or lang for the vehicle");
        continue;
      }

      this.setMarkerPositionWithDirection(vehicle)
    }
    this.clusterVehicles();
  }
}

function initMap() {
  let vehicleVisualizer;

  if (google && !google) {
    setTimeout(initMap, 2000);
  }
  const socket = io();

  socket.on("connectionSuccessful", res => {
    console.log(res.vehicles);
    vehicleVisualizer = new VehicleVisualizer(google, res.vehicles);
    vehicleVisualizer.populateMarkers();
  });

  socket.on("locationUpdated", res => {
    const vehicle = vehicleVisualizer.getVehicle(res.vehicleId);
    let marker = vehicle.marker;
    if (marker === null) {
      vehicle.addMarker(res.lat, res.lng);
    } else {
      marker.setPosition(new google.maps.LatLng(res.lat, res.lng));
      vehicleVisualizer.setMarkerPositionWithDirection(vehicle, marker);
    }
  });
}