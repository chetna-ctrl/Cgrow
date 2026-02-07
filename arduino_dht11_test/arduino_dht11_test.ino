#include <DHT.h>

// PIN CONFIGURATION
#define DHTPIN 2     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11   // DHT 11
#define SOIL_PIN A0  // Analog pin for Soil Moisture

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(SOIL_PIN, INPUT);
}

void loop() {
  delay(2000);

  // 1. Read DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // 2. Read Soil Moisture
  int soilRaw = analogRead(SOIL_PIN);
  // Map 1023 (Dry) to 0% and 400 (Wet) to 100% (Adjust these values based on calibration)
  // Standard Arduino (0-1023). 
  // NOTE: Capacitive sensors reading is INVERSE (High Value = Dry, Low Value = Wet) usually.
  // Let's output raw first for calibration, or simple map.
  int soilPercent = map(soilRaw, 1023, 400, 0, 100); 
  if (soilPercent < 0) soilPercent = 0;
  if (soilPercent > 100) soilPercent = 100;

  // Check for DHT errors
  if (isnan(h) || isnan(t)) {
    Serial.println(F("{\"error\": \"Failed to read from DHT sensor!\"}"));
    return;
  }

  // Print JSON
  Serial.print("{\"temp\": ");
  Serial.print(t);
  Serial.print(", \"humidity\": ");
  Serial.print(h);
  Serial.print(", \"soil_raw\": ");
  Serial.print(soilRaw);
  Serial.print(", \"soil_percent\": ");
  Serial.print(soilPercent);
  Serial.println("}");
}
