let destination = null;
let map, marker, userMarker, watchId;
const alarm = document.getElementById('alarmSound');
const radiusSlider = document.getElementById('radiusSlider');
const radiusValue = document.getElementById('radiusValue');
let alertRadius = parseInt(radiusSlider.value);
let soundEnabled = true;

function initMap() {
  const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Default: New Delhi

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: defaultLocation,
  });

  map.addListener("click", (e) => {
    setDestination(e.latLng);
  });
}

function setDestination(latLng) {
  destination = {
    lat: latLng.lat(),
    lng: latLng.lng()
  };

  if (marker) marker.setMap(null);

  marker = new google.maps.Marker({
    position: latLng,
    map: map,
    title: "Destination",
  });

  document.getElementById("status").textContent = 
    `Destination set at: ${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`;
}

function startTracking() {
  if (!destination) {
    alert("Please select a destination on the map first.");
    return;
  }

  if ("geolocation" in navigator) {
    document.getElementById("status").textContent = "Tracking location...";

    watchId = navigator.geolocation.watchPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const distance = getDistanceFromLatLonInMeters(userLat, userLng, destination.lat, destination.lng);

      document.getElementById("status").textContent =
        `Your location: ${userLat.toFixed(4)}, ${userLng.toFixed(4)} | Distance: ${distance.toFixed(2)} m`;

      if (!userMarker) {
        userMarker = new google.maps.Marker({
          position: { lat: userLat, lng: userLng },
          map: map,
          title: "You",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#00f",
            fillOpacity: 0.8,
            strokeColor: "#fff",
            strokeWeight: 2
          }
        });
      } else {
        userMarker.setPosition({ lat: userLat, lng: userLng });
      }

      if (distance <= alertRadius) {
        if (soundEnabled) {
          alarm.play();
        }
        alert("You have reached your destination!");
        alarm.pause();
        alarm.currentTime = 0;
        navigator.geolocation.clearWatch(watchId);
      }

    }, (error) => {
      console.error(error);
      document.getElementById("status").textContent = "Error getting location.";
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    });

  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById("soundToggle").textContent = soundEnabled ? "Sound: On 🔊" : "Sound: Off 🔇";
}

function updateRadius() {
  alertRadius = parseInt(radiusSlider.value);
  radiusValue.textContent = alertRadius;
}
