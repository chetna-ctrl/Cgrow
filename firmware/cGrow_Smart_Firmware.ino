/*
 * cGrow Commercial IoT Firmware v1.0
 * ----------------------------------
 * FEATURES:
 * 1. WiFi Manager: Creates access point "cGrow-Setup" if WiFi not found
 * 2. Deep Sleep: Auto-reconnect capabilities
 * 3. Secure HTTPS: Sends data to Supabase
 * 4. LED Indication: Status blinking
 * 
 * REQUIRED LIBRARIES (Install via Arduino Library Manager):
 * - WiFiManager (by tzapu)
 * - DHT sensor library (by Adafruit)
 * - ArduinoJson (by Benoit Blanchon)
 */

#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <HTTPClient.h>
#include <WiFi.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ---------------- CONFIGURATION ----------------
#define DHTPIN 4          // DHT22 Data Pin
#define DHTTYPE DHT22     // Sensor Type
#define SOIL_PIN 34       // Soil Moisture Analog Pin
#define LED_PIN 2         // Onboard LED
#define DEVICE_ID "CGROW-001" // UNIQUE DEVICE ID (Change for each kit)

// ... (supbase config remains same) ...

// GLOBALS
DHT dht(DHTPIN, DHTTYPE);
WiFiManager wifiManager;

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOIL_PIN, INPUT); // Configure Soil Pin
  dht.begin();
  
  // ... (rest of setup) ...
}

// ---------------- LOOP ----------------
void loop() {
  // Wait a few seconds between measurements
  delay(5000); 

  // 1. READ SENSORS
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  // Read Soil Moisture (Analog 0-4095)
  int soilRaw = analogRead(SOIL_PIN);
  // Convert to Percentage (Approximate: Dry=4095, Wet=0 depending on sensor)
  // For Capacitive Sensor v1.2: Air ~3000, Water ~1500 (Adjust these values after calibration)
  int soilPercent = map(soilRaw, 3000, 1500, 0, 100); 
  soilPercent = constrain(soilPercent, 0, 100); // Keep between 0-100%

  // Check if any reads failed
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    // flashLED(5, 50); // Optional: Continue even if DHT fails
  }

  Serial.print("Humidity: "); Serial.print(h);
  Serial.print("%  Temp: "); Serial.print(t);
  Serial.print("C  Soil: "); Serial.print(soilPercent); Serial.println("%");

  // 2. SEND DATA TO SUPABASE
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(supabase_url);
    
    // Headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", String("Bearer ") + supabase_key);
    http.addHeader("Prefer", "return=minimal");

    // JSON Payload
    StaticJsonDocument<200> doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = isnan(t) ? 0 : t;
    doc["humidity"] = isnan(h) ? 0 : h;
    doc["soil_moisture_1"] = soilPercent; // Sending Soil Data
    
    String requestBody;
    serializeJson(doc, requestBody);


    // POST Request
    int httpResponseCode = http.POST(requestBody);

    if(httpResponseCode > 0){
      String response = http.getString();
      Serial.print("Data Sent! Response: "); 
      Serial.println(httpResponseCode);
      flashLED(1, 500); // Success blink
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      flashLED(2, 100); // Network error blink warning
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected! Attempting Reconnect...");
    WiFi.reconnect();
  }

  // DEEP SLEEP (Optional - for battery saving)
  // esp_deep_sleep_start();
  delay(60000); // Wait 1 minute before next reading
}

// ---------------- HELPERS ----------------

// Called when WiFi connection fails and AP mode starts
void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  Serial.println(WiFi.softAPIP());
  Serial.println(myWiFiManager->getConfigPortalSSID());
  
  // Fast blink to indicate 'Needs Setup'
  for(int i=0; i<20; i++){
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    delay(100);
  }
}

void flashLED(int times, int duration) {
  for(int i=0; i<times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(duration);
    digitalWrite(LED_PIN, LOW);
    delay(duration);
  }
}
