console.log("Step 2 working");


// We create the tile (background) layers for the map
// One for the grayscale background

var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

// Create the map object

var map = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3,
    layers: [graymap, satellitemap, outdoors]
});

// Add our tile (graymap) layer to the map.

graymap.addTo(map);

// We create the layers for our two different datasets, earthquakes and tectonic plates

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// This contains all the different maps- using a dropdown, only one map will be visible at a time

var baseMaps = {
    Satellite: satellitemap,
    Grayscale: graymap,
    Outdoors: outdoors
};

// Overlay map- allowing for both the tectonic and earthquake map to be visible at the same time

var overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
};

// This control allows users to choose which maps they want visible

L
    .control
    .layers(baseMaps, overlays)
    .addTo(map);

// Make an AJAX call that retrieves our earthquake geoJSON data

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

    // This function returns the style data for each of the earthquakes we plot on the map

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Determine the color of each marker, based on the magnitude of the earthquake

    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#F21D0E";
            case depth > 70:
                return "#FC9723";
            case depth > 50:
                return "#FCF523";
            case depth > 30:
                return "#CAFF1E";
            case depth > 10:
                return "#13F91B";
            default:
                return "#019E20";
        }
    }

    // Determine the radius of the earthquake marker based on its magnitude 
    // Earthquakes with a magnitude of 0 were being plotted with the wrong radius

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    // Add a GeoJSON layer to the map once the file is loaded

    L.geoJson(data, {
        // Turn each feature into a circleMarker on the map.

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        // Set the style for each circleMarker using our styleInfo function

        style: styleInfo,
        // We create a popup for each marker holding the info for each popup

        onEachFeature: function(feature, layer) {
                layer.bindPopup(
                    "Magnitude: " +
                    feature.properties.mag +
                    " ML" +
                    "<br>Depth: " +
                    feature.geometry.coordinates[2] +
                    "<br>Location: " +
                    feature.properties.place
                );
            }
            // Add the data to the earthquake layer instead of directly to the map

    }).addTo(earthquakes);

    // Add the earthquake layer to our map

    earthquakes.addTo(map);

    // Here we create a legend indentifying each popup by depth

    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#019E20",
            "#13F91B",
            "#CAFF1E",
            "#FCF523",
            "#FC9723",
            "#F21D0E"
        ];

        // Loop through our intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " +
                colors[i] +
                "'></i> " +
                grades[i] +
                (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Add our legend to the map
    legend.addTo(map);

    // Make an AJAX call to get our Tectonic Plate geoJSON data

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(platedata) {
        // Add our geoJSON data, along with style information, to the tectonicplates layer

        L.geoJson(platedata, {
                color: "orange",
                weight: 2
            })
            .addTo(tectonicplates);

        // Add the tectonicplates layer to the map
        tectonicplates.addTo(map);
    });
});