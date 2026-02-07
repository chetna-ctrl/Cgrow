/*
 * Simple Arduino Soil Sensor Test (Serial Only)
 * ---------------------------------------------
 * Use this if you have a standard Arduino Uno/Nano (No WiFi)
 * This sends data to your Laptop via USB Cable.
 * 
 * SETUP:
 * Soil Sensor Signal -> Analog Pin A0
 * VCC -> 5V
 * GND -> GND
 */

#define SOIL_PIN A0

void setup() {
  Serial.begin(115200); // Make sure Serial Monitor matches this (115200 baud)
  pinMode(SOIL_PIN, INPUT);
}

void loop() {
  // Read Sensor
  int rawValue = analogRead(SOIL_PIN);
  
  // Convert to Percentage
  // Adjust these values based on your sensor (Air value vs Water value)
  // Standard Arduino ADC is 0-1023
  int percent = map(rawValue, 1023, 200, 0, 100); 
  percent = constrain(percent, 0, 100);
  
  // Create JSON String (Manually)
  // Output format: {"device_id": "ARDUINO-TEST", "soil_moisture_1": 45}
  
  Serial.print("{\"device_id\":\"ARDUINO-TEST\",");
  Serial.print("\"soil_moisture_1\":");
  Serial.print(percent);
  Serial.println("}");
  
  delay(2000); // Send every 2 seconds
}
