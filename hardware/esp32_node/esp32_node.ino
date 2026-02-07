/**
 * Agri-OS IoT Node v1.1.0 
 * Framework: Arduino ESP32
 * Connectivity: Supabase REST API (HTTPS)
 * 
 * Logic: Reads agricultural sensors -> Processes Analog to Digital -> 
 *        Compensates for Temperature -> Posts JSON via REST every 15m.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

// --- USER CONFIGURATION ---
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Supabase Configuration
// Get URL/Key from Project Settings -> API
const char* SUPABASE_URL = "https://your-project.supabase.co/rest/v1/daily_logs";
const char* SUPABASE_KEY = "your-supabase-anon-key";
const char* SYSTEM_ID   = "SYS-AGRI-001"; // Assign unique ID for each grow bed

// --- PIN DEFINITIONS ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define PH_PIN 34
#define EC_PIN 35
#define WATER_LVL_PIN 32

// --- GLOBAL OBJECTS & TIMING ---
DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;
unsigned long lastLogTime = 0;
const unsigned long INTERVAL = 15 * 60 * 1000; // 15 minutes (900,000 ms)

// Calibration Constants (Defaults for standard modules)
float pH_Offset = 0.00; 
float EC_K_Value = 1.0;  

void setup() {
    Serial.begin(115200);
    Wire.begin();
    
    // Initialize Sensors
    dht.begin();
    if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
        Serial.println(F("✓ BH1750 Light Sensor Online"));
    } else {
        Serial.println(F("⚠ BH1750 Light Sensor Error"));
    }

    setupWiFi();
    Serial.println("Agri-OS Node v1.1 Initialized.");
}

void loop() {
    // Non-blocking timing loop
    unsigned long currentMillis = millis();
    
    if (currentMillis - lastLogTime >= INTERVAL || lastLogTime == 0) {
        lastLogTime = currentMillis;
        
        if (WiFi.status() == WL_CONNECTED) {
            processAndSendData();
        } else {
            setupWiFi();
        }
    }
}

void setupWiFi() {
    Serial.print("Connecting to Agri-Net: ");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    
    int counter = 0;
    while (WiFi.status() != WL_CONNECTED && counter < 20) {
        delay(500);
        Serial.print(".");
        counter++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✓ Connected. IP: " + WiFi.localIP().toString());
    } else {
        Serial.println("\n⚠ WiFi Connection Failed.");
    }
}

void processAndSendData() {
    // 1. READ DIGITAL SENSORS
    float humidity = dht.readHumidity();
    float airTemp = dht.readTemperature(); 
    float lux = lightMeter.readLightLevel();

    // 2. ANALOG PROCESSING (pH)
    // Formula: pH = Slope * Voltage + Offset
    int phRaw = analogRead(PH_PIN);
    float phVoltage = phRaw * (3.3 / 4095.0);
    float phValue = 3.5 * phVoltage + pH_Offset; 

    // 3. ANALOG PROCESSING (EC with Temp Compensation)
    // Compensation: 2% per Degree C change from 25C standard
    int ecRaw = analogRead(EC_PIN);
    float ecVoltage = ecRaw * (3.3 / 4095.0);
    float ecValue = (ecVoltage / (1.0 + 0.02 * (airTemp - 25.0))) * EC_K_Value;

    // 4. WATER LEVEL DETECTION (Assuming threshold-based analog or float switch)
    int wlRaw = analogRead(WATER_LVL_PIN);
    String waterStatus = (wlRaw > 500) ? "OK" : "Low"; 

    // Sensor health check
    if (isnan(humidity) || isnan(airTemp)) {
        Serial.println("⚠ Critical: DHT sensor read failure!");
        return;
    }

    // 5. CONSTRUCT JSON PAYLOAD (Aligns with Supabase Table Schema)
    JsonDocument doc;
    doc["system_id"] = SYSTEM_ID;
    doc["system_type"] = "Hydroponics"; // Metadata context
    doc["temperature"] = airTemp;
    doc["humidity"] = humidity;
    doc["ph"] = phValue;
    doc["ec"] = ecValue;
    doc["light_intensity"] = lux;
    doc["water_level"] = waterStatus;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // 6. DISPATCH VIA HTTPS POST TO SUPABASE
    HTTPClient http;
    http.begin(SUPABASE_URL); 
    
    // Supabase REST Headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
    
    Serial.println("Pushing telemetry to Agri-OS Cloud...");
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
        Serial.printf("Success! Code: %d | Payload: %s\n", httpResponseCode, jsonPayload.c_str());
    } else {
        Serial.printf("Error Code: %d\n", httpResponseCode);
    }
    
    http.end();
}
