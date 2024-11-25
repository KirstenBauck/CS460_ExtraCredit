document.addEventListener("DOMContentLoaded", () => {
    // Initialize the map, centered on the world zoom level 2
    const map = L.map("map").setView([20,0], 2);

    // Add a tile layer to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",}).addTo(map);

        const dynamicLayers = L.layerGroup().addTo(map);

// Function to get geolocation data for an IP
async function getGeolocation(ip) {
    try {
        // Get geolocation data from API
        console.log(`Fetching geolocation for IP: ${ip}`);
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        console.log(`Geolocation data for IP ${ip}:`, data);

        // If there is a success then load the data
        if (data.status == "success") {
            return {
            ip: ip,
            lat: data.lat,
            lon: data.lon,
            city: data.city,
            country: data.country,
            };
        // Otherwise there was an error
        } else {
            console.error(`Failed to get location for IP: ${ip}`);
            return null;
        }
    // Couldnt get anything from the API
    } catch (error) {
        console.error(`Error fetching geolocation for IP ${ip}:`, error)
        return null;
    }
}

// Function to plot hops on the map
async function plotHops(hops, ipIndex, latencies) {
    const locations = [];
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33FF", "#FFD700", "#FF4500", "#008080"];
    
    // Assign a color based on the index of the ip
    const color = colors[ipIndex % colors.length];
    
    // Itterate through the ips in the hop path
    for (let i = 0; i < hops.length; i++) {
        const ip = hops[i];
        const latency = parseFloat(latencies[i]) || 0;
        const location = await getGeolocation(ip);

        if (location) {

            locations.push(location)
            // Add a marker for the hop
            L.circleMarker([location.lat, location.lon], {
                color: color,  // Set the circle color to the same as the line color
                radius: Math.max(3, latency), // Set radius proportional to latency
                weight: 3,     // Border thickness
                opacity: 1,    // Full opacity
                fillOpacity: 0.8, // Fill opacity
                fillColor: color // Marker fill color
            })
                .addTo(dynamicLayers)
                .bindPopup(
                    `<b>IP:</b> ${location.ip}<br><b>City:</b> ${location.city}<br><b>Country:</b> ${location.country}<br><b>Latency:</b> ${latency} ms`
                )
                .openPopup();
        }
    }

    // Draw lines between hops
    if (locations.length > 1) {
        const latLngs = locations.map((loc) => [loc.lat, loc.lon]);
        L.polyline(latLngs, {color: color}).addTo(dynamicLayers);
        // Add labels for each edge
        for (let i = 0; i < locations.length - 1; i++) {
            const midLat = (locations[i].lat + locations[i + 1].lat) / 2;
            const midLon = (locations[i].lon + locations[i + 1].lon) / 2;

            // Create a label at the midpoint of the edge
            L.marker([midLat, midLon], {
                icon: L.divIcon({
                    className: "edge-label",
                    html: `<div style="color: ${"#000000"}; font-weight: bold;">${i + 1}</div>`,
                    iconSize: [20, 20],
                }),
                interactive: false // Make the marker non-interactive
            }).addTo(dynamicLayers);
        }
    }
}

// Handle form submission
document.getElementById("traceroute-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear existing map layers
    dynamicLayers.clearLayers();

    // Get the ips the user entered in the form
    const ipsInput = document.getElementById("ips").value.trim();
    if(!ipsInput) {
        alert("Please enter at least one IP address.")
        return;
    }
    const ips = ipsInput.split(",").map(ip => ip.trim());
    console.log("IPs entered:", ips);
    try {
        // Call Flask application containing traceroute.sh
        const response = await fetch("/api/traceroute", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ ips }),
        });
        // Error handling if response wasn't good
        if(!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
            return;
        }
        // Capture the ip hops
        const data = await response.json()
        console.log("Traceroute response data:", data);
        parsedData = JSON.parse(data);

        // Plot the hops in the graphs
        for (let i = 0; i < ips.length; i++) {
            const ip = ips[i];
            const hops = parsedData[ip] ? parsedData[ip].hops : null; 
            const latencies = parsedData[ip] ? parsedData[ip].latency : null; 
            if (hops && hops.length > 0) {
                plotHops(hops, i, latencies);
            } else {
                alert("No hops returned from traceroute.");
            }
        }
    // Catch any errors while fetchin traceroute data
    } catch (error) {
        console.error("Error fetching traceroute data:", error);
        alert("An error occurred while running the traceroute.");
    }
});
});
