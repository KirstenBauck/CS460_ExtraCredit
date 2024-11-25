#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: ./traceroute.sh <ip1> [<ip2> ...]"
    exit 1
fi

results="{"

# Determine OS and traceroute command
# linux-gnu matches Linux and darwin matches macOS
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    traceroute_cmd="traceroute -n"
    computer="linux"
# Match to various Windows environments
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    traceroute_cmd="tracert"
    computer="windows"
else
    echo "Unsupported operating system: $OSTYPE"
    exit 1
fi

# Run the traceroute command on each ip address given
for ip in "$@"; do
    # Run traceroute command and redirect error messages to standard error
    output=$($traceroute_cmd "$ip" 2>/dev/null)
    # Check if there was an error
    if [ $? -ne 0 ]; then
        results+="\"$ip\": {\"error\": \"Unable to reach $ip\"},"
    else
        hops=()
        latency=()
        # Parse the Linux/Unix output
        if [[ "$traceroute_cmd" == "traceroute -n" ]]; then
            while IFS= read -r line; do 
                # Match the IP address
                if [[ $line =~ ^[[:space:]]*[0-9]+[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)[[:space:]]+([0-9]+\.[0-9]+)[[:space:]]+ms[[:space:]]+([0-9]+\.[0-9]+)[[:space:]]+ms[[:space:]]+([0-9]+\.[0-9]+)[[:space:]]+ms ]]; then
                    # Get the matched IP address
                    ip="${BASH_REMATCH[1]}"
                    hops+=("$ip")
                     # Measure latency using ping
                    latency1="${BASH_REMATCH[2]}"
                    latency2="${BASH_REMATCH[3]}"
                    latency3="${BASH_REMATCH[4]}"
                    avg_latency=$(echo "scale=3; ($latency1 + $latency2 + $latency3) / 3" | bc)
                    latency+=("$avg_latency")
                fi
            done <<< "$output"
        # Parse the Windows Output
        else
            while IFS= read -r line; do
                # Match the IP address
                if [[ $line =~ ^[[:space:]]*[0-9]+[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)[[:space:]]+([0-9]+\.[0-9]+)[[:space:]]+ms[[:space:]]+([0-9]+\.[0-9]+)[[:space:]]+ms[[:space:]]+([0-9]+\.[0-9]+)[[:space:]]+ms ]]; then
                    ip="${BASH_REMATCH[1]}"
                    #Remove square brackets if there are any
                    ip=${ip//[\[\]]/}${ip//[\[\]]/}
                    hops+=("$ip")

                    # Get ping output
                    latency1="${BASH_REMATCH[2]}"
                    latency2="${BASH_REMATCH[3]}"
                    latency3="${BASH_REMATCH[4]}"
                    # Compute the average latency
                    avg_latency=$(echo "scale=3; ($latency1 + $latency2 + $latency3) / 3" | bc)
                    latency+=("$avg_latency")
                fi
            done <<< "$output"
        fi
        # Store the IP address in results
        hops_json=$(printf '"%s",' "${hops[@]}") # create a comma-separated list
        hops_json="[${hops_json%,}]" # Remove trailing commas and wrap in brackets
        latencies_json=$(printf '"%s",' "${latency[@]}")
        latencies_json="[${latencies_json%,}]"
        results+="\"$ip\": {\"hops\": $hops_json, \"latency\": $latencies_json, \"computer\": \"$computer\"},"
    fi
done

# Trim trailing comma and close JSON
results="${results%,}}"
echo "$results"
