from flask import Flask, render_template, request, jsonify
import subprocess
import json

app = Flask(__name__)

# Define a route for the homepage
@app.route("/")
def index():
    return render_template("index.html")

# Define a route to handle API requests and accepts only HTTP POST requests
@app.route('/api/traceroute', methods=['POST'])
def traceroute():
    # Retrive the JSON payload from the incoming POST request
    data = request.json
    print("Received data:", data)
    ips = data.get('ips', [])

    # If not ips returned, return an error message
    if not ips:
        return jsonify({"error": "No IP addresses provided"}), 400
    
    # Run the traceroute.sh script
    process = subprocess.run(
        ['./traceroute.sh', *ips],
        # Capture scripts standard output
        stdout=subprocess.PIPE,
        # Capture script's error output
        stderr=subprocess.PIPE,
        # Make sure output is handled as strings
        text=True
    )

    # Check if shell script failed
    if process.returncode != 0:
        print("Traceroute error:", process.stderr)
        return jsonify({"error": "Traceroute execution failed"}), 500

    # Process traceroute.sh output and prepare response
    raw_output = process.stdout.strip()
    print("Traceroute output:", raw_output)
        
    # Return the traceroute results
    return jsonify(raw_output)

if __name__ == '__main__':
    app.run(debug=True)
