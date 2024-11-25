# Traceroute Visualization Tool

**Author**: Kirsten Bauck  
**Purpose**: Visualize the traceroute hops for one or more IP addresses on an interactive map.  

This tool allows users to analyze network routes by running traceroute commands for provided IP addresses and plotting the results on an interactive map. It supports both Windows and Linux systems.

---

## Features
- **Interactive Map**: Uses Leaflet.js to display traceroute hops on a world map.
- **Dynamic Visualization**: Color-coded markers and lines for each IP's path, with information on hops and latency.
- **Cross-Platform Compatibility**: Works seamlessly on Windows and Linux systems.
- **Customizability**: Built with Python Flask and JavaScript, allowing for easy modifications and extensions.

---

## Steps Used to Create This Tool
1. **Backend Implementation:**
  - Developed a Python Flask application to handle API requests and manage traceroute execution.
  - Wrote a shell script (traceroute.sh) to execute traceroute commands and parse their output, accommodating differences between Linux and Windows traceroute utilities.
2. **Frontend Development:**
  - Designed an interactive web interface using HTML, CSS, and JavaScript.
  - Integrated Leaflet.js for map visualization.
3. **Cross-Platform Support:**
  - Added compatibility for both Linux and Windows traceroute commands (traceroute and tracert).
  - Processed traceroute output in the shell script to handle OS-specific formats.
4. **Testing:**
  - Tested on both operating systems to ensure compatibility.
  - Verified robust handling of invalid IPs and network issues.

---

## Installation and Usage
### Prerequisites
1. Install **Python 3.7 or higher**.
2. Install required Python packages:
  ```bash
  pip install flask
  ```
3. Ensure `traceroute` (Linux/Mac) or `tracert` (Windows) is available on your system.
### How to Use
1. Clone the repository or download the project files.
2. Open a terminal in the project directory.
3. Run the application:
  - On Linux or macOS:
  ```bash
  python3 app.py
  ```
  - On Windows:
  ```bash
  python app.py
  ```
4. Open your web browser and navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000).
5. Enter the IP addresses you want to trace (comma-separated) and click **Run Traceroute**.

---

## Example Workflow
1. Enter `8.8.8.8` or a list of IPs, such as `8.8.8.8, 1.1.1.1`.
  - The tool will execute the traceroute command and display:
  - Each hop as a marker on the map.
2. Latency and IP information in pop-ups.
3. Review the path visualization to analyze network behavior.
