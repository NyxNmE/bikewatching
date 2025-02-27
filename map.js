// Import Mapbox and D3 as ESM modules
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaXRvbiIsImEiOiJjbTdqZ2dzM3IwM2k1MmlwdmNpcndzOG81In0.ZmmNU9Q8VD-vP1JJuFL6rQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-71.09415, 42.36027], // [longitude, latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5,
    maxZoom: 18
});

const svg = d3.select('#map').select('svg');
if (svg.empty()) {
    console.error("SVG element is missing inside #map. Check your index.html!");
}

function getCoords(station) {
    if (!station.lon || !station.lat) {
        console.error("Invalid station coordinates:", station);
        return { cx: 0, cy: 0 };
    }
    const point = new mapboxgl.LngLat(+station.lon, +station.lat); 
    const { x, y } = map.project(point); 
    return { cx: x, cy: y }; 
}

map.on('load', async () => {
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });

    map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'boston_route',
        paint: {
            'line-color': '#32D400', 
            'line-width': 5,
            'line-opacity': 0.6
        }
    });

    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: {
            'line-color': '#32D400',
            'line-width': 5,
            'line-opacity': 0.6
        }
    });

    try {
        const jsonUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
        const jsonData = await d3.json(jsonUrl);
        const stations = jsonData.data.stations; 

        console.log("Loaded Stations Data:", stations);

        if (!stations.length) {
            console.error("No stations found in data. Check the dataset URL.");
            return;
        }

        const circles = svg.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', 5) 
            .attr('fill', 'steelblue') 
            .attr('stroke', 'white') 
            .attr('stroke-width', 1)
            .attr('opacity', 0.8);

        console.log("Circles appended. Updating positions...");

        function updatePositions() {
            circles
                .attr('cx', d => {
                    const coords = getCoords(d);
                    return coords.cx;
                })
                .attr('cy', d => {
                    const coords = getCoords(d);
                    return coords.cy;
                });
        }

        updatePositions();

        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

        console.log("Station markers should be visible now!");

    } catch (error) {
        console.error("Error loading station data:", error);
    }

    console.log("Mapbox GL JS Loaded:", mapboxgl);
});
