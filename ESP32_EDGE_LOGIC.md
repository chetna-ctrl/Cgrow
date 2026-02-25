# 🤖 ESP32 Edge Logic: Autonomous Mode (Agri-OS v2.1)

## Overview
This logic allows the ESP32 controller to act "Intelligently" even when Wi-Fi is down. It protects the farm from critical failures (Heat/Dryness) using local rules.

## 1. Heartbeat Logic (Connectivity Heartbeat)
Sends a "Pulse" every 30 seconds to Supabase.

```cpp
// C++ / Arduino Snippet
const long HEARTBEAT_INTERVAL = 30000; // 30 sec
unsigned long lastHeartbeat = 0;

void loop() {
  if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
       // Send Ping to 'system_heartbeats' table
       // Payload: { "device_id": "ESP_01", "status": "ONLINE", "uptime": millis()/1000 }
       sendSupabaseHeartbeat(); 
       lastHeartbeat = millis();
    } else {
       // Store failure count locally
       flashRedLED(); 
    }
  }
}
```

## 2. Autonomous Safety Triggers (Local Mode)
**Rule:** If Wi-Fi falls, these rules MUST execute locally.

### A. Thermal Safety (Chiller/Fan Trigger)
```cpp
float waterTemp = getDS18B20Temp();
float airTemp = getDHTTemp();

// SAFETY: If water > 28C, Force Turn ON Relay 1 (Fan/Pump)
if (waterTemp > 28.0) {
   digitalWrite(RELAY_FAN_PIN, HIGH); // Force ON
   isEmergencyMode = true;
} 
// HYSTERESIS: Turn OFF only when cooled to 26C
else if (waterTemp < 26.0) {
   digitalWrite(RELAY_FAN_PIN, LOW);
   isEmergencyMode = false;
}
```

### B. Dry Run Protection (Pump Saver)
```cpp
float currentAmps = readACS712(); // Current Sensor

// If Relay is ON but Current is ~0A -> Pump is Broken or Air Locked
if (isPumpRelayOn && currentAmps < 0.1) {
   // Wait 5 seconds to confirm
   delay(5000); 
   if (readACS712() < 0.1) {
      // CUT POWER to prevent burnout
      digitalWrite(RELAY_PUMP_PIN, LOW); 
      logError("PUMP_FAILURE_NO_LOAD");
   }
}
```

### C. Signal Smoothing (Median Filter)
```cpp
// Collect 5 readings before sending to dashboard
float phReadings[5];
// ... fill array ...
float filteredPH = getMedian(phReadings);
```

## 3. Data Packet Structure (v2.1)
Update your JSON payload to include the new fields:
```json
{
  "device_id": "ESP32_MASTER",
  "temp": 32.5,
  "humidity": 65,
  "water_temp": 28.4,
  "ph": 6.2,
  "ec": 1.4,
  "water_level_cm": 15,    // NEW (Ultrasonic) 
  "pump_current_amps": 1.2, // NEW (Current Sensor)
  "confidence_score": 100   // NEW (Calc by ESP based on jitter)
}
```
