# 🛠️ Agri-OS IoT Hardware Connection Checklist

This checklist is designed to help you safely build and connect your cGrow IoT sensor kit. Follow these steps sequentially to minimize risk to your hardware.

## 1. Component Inventory
Before starting, ensure you have the following:
- [ ] **ESP32 DevKit v1** (or compatible 30/38 pin module)
- [ ] **DHT22** (Air Temp & Humidity Sensor)
- [ ] **Capacitive Soil Moisture Sensor v1.2** (Corrosion resistant)
- [ ] **1-Channel Relay Module** (5V or 3.3V trigger)
- [ ] **12V DC Water Pump** (Small submersible)
- [ ] **12V 2A Power Adapter** (For pump)
- [ ] **Resistors:** 4.7k ohm (For DHT22)
- [ ] **Jumper Wires:** Male-to-Female and Female-to-Female

---

## 2. Pin Mapping Guide
Connect your sensors to the ESP32 using this standard configuration:

| Component Pin | ESP32 Pin | Purpose |
| :--- | :--- | :--- |
| **DHT22 Data** | **GPIO 4** | Digital Communication |
| **Soil Analog (A0)** | **GPIO 34** | Moisture Level Reading |
| **Relay Signal (IN)** | **GPIO 18** | Pump ON/OFF Trigger |
| **Onboard LED** | **GPIO 2** | WiFi/Heatlh Heartbeat |

---

## 3. High-Voltage (Pump) Wiring Strategy
> [!CAUTION]
> Never connect the pump directly to the ESP32. It will fry the microcontroller.

1. **Power Path:** Connect the **Negative (-)** wire of the 12V Adapter directly to the **Negative (-)** terminal of the Pump.
2. **Switch Path:** Connect the **Positive (+)** wire of the 12V Adapter to the `COM` (Common) terminal of the Relay.
3. **Control Path:** Connect the **Positive (+)** terminal of the Pump to the `NO` (Normally Open) terminal of the Relay.
4. **Relay Logic:** When ESP32 sends a `HIGH` signal to GPIO 18, the relay clicks and the pump starts.

---

## 4. Safety & Stability Rules
- [ ] **Resistor Check:** Ensure a 4.7k Ohm resistor is placed between `Data` and `VCC` of the DHT22.
- [ ] **Ground Union:** Ensure the `GND` of the ESP32 and the `GND` of the Relay are connected (Common Ground).
- [ ] **Dry Run:** Upload the code and verify the Relay "clicks" before connecting any water or 12V power.
- [ ] **Isolation:** Keep the ESP32 and electronic modules in a separate water-proof box away from the water tank.

---

## 5. Software Preparation
1. Open Arduino IDE.
2. Install **ESP32 Board Support** via Boards Manager.
3. Install required libraries:
   - `DHT sensor library` by Adafruit
   - `ArduinoJson` by Benoit Blanchon
   - `WiFiManager` by tzapu
4. Open the firmware from: `firmware/cGrow_Smart_Firmware.ino`
5. Update your `WIFI_SSID`, `WIFI_PASS`, and `SUPABASE` credentials.
6. Upload to ESP32!

---

## 6. Testing Procedure
1. **Serial Monitor:** Open at 115200 baud. You should see "WiFi Connected".
2. **Data Push:** Verify the message "Data Sent! Response: 201".
3. **App Verification:** Go to **Dashboard** in Agri-OS. Your device should show "Online" on the IoT page.

---
*Created for Agri-OS Admin - Happy Farming!* 🌿
