// We create the tile (background) layer for the map

console.log("Step 1 working");

var graymap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    }
);

// Create the map object

var map = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3
});

// Add our tile (background) layer to the map.

graymap.addTo(map);

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

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function

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
    }).addTo(map);

    // Here we create a legend indentifying each popup by depth

    var legend = L.control({
        position: "bottomright"
    });

    // Add all the details for the legend

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

        // Looping through our intervals to generate a label with a colored square for each interval

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Add the legend to the map

    legend.addTo(map);
});