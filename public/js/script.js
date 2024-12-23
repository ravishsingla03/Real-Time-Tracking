const socket = io();
let mapInitialized = false;
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      socket.emit("send-location", { latitude, longitude });
      if (!mapInitialized) {
        map.setView([latitude, longitude], 15); 
        L.marker([latitude, longitude]).addTo(map);
        mapInitialized = true;
      }
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Ravish Singla",
}).addTo(map);

const markers = {};


socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnected", (userId) => {
  if (markers[userId]) {
    map.removeLayer(markers[userId]);
    delete markers[userId];
  }
})
