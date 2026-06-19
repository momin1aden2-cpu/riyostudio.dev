export async function onRequestGet(context) {
  const apiKey = context.env.UPTIMEROBOT_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "SERVER_UNCONFIGURED: UPTIMEROBOT_API_KEY missing from environment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // UptimeRobot API requires a POST request
  const payload = {
    api_key: apiKey,
    format: "json",
    custom_uptime_ratios: "30", // Get 30-day uptime ratio
    response_times: 1,
    logs: 1
  };

  try {
    const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Parse out just the safe data to return to the frontend
    if (data.stat === "ok" && data.monitors && data.monitors.length > 0) {
      const monitor = data.monitors[0];
      
      let statusStr = "UNKNOWN";
      if (monitor.status === 2) statusStr = "ONLINE";
      else if (monitor.status === 8 || monitor.status === 9) statusStr = "OFFLINE";
      else if (monitor.status === 0) statusStr = "PAUSED";
      else if (monitor.status === 1) statusStr = "NOT CHECKED YET";

      const safeData = {
        status: statusStr,
        uptimeRatio: monitor.custom_uptime_ratio || "N/A",
        averagePing: monitor.average_response_time ? Math.round(parseFloat(monitor.average_response_time)) + 'ms' : 'UNKNOWN',
        latestPing: (monitor.response_times && monitor.response_times.length > 0) ? monitor.response_times[0].value + 'ms' : 'UNKNOWN',
        logsCount: (monitor.logs) ? monitor.logs.length : 0
      };
      
      return new Response(JSON.stringify(safeData), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "UPTIME_API_ERROR: Invalid response from monitor" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("uptime proxy error:", error);
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
