import 'leaflet/dist/leaflet.css';
import 'leaflet';

export function createMarkers(json){
    let markers = [];
    for (let i in json){
        let item = json[i];
        let marker;
        let content = '';
        for (let key in item){
            content += `<div><b>${key}: </b>${item[key]}</div>`;
        }
        marker = L.circleMarker([item['lat'], item['lon']], {'color': '#990000'}).bindPopup(content);
        markers.push(marker);
    }
    return markers
}

export let map = L.map('map').setView([55, -100], 3);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);