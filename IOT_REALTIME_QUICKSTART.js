/**
 * QUICK START: Supabase Realtime IoT Integration
 * 
 * This file shows you how to add live sensor data streaming
 * to your dashboard in just 30 minutes!
 */

// ============================================================
// STEP 1: Enable Realtime in Supabase (5 minutes)
// ============================================================
// 1. Open Supabase Dashboard → SQL Editor
// 2. Run this SQL:

/*
ALTER PUBLICATION supabase_realtime ADD TABLE daily_logs;

-- Optional: Create dedicated sensor_readings table for high-frequency data
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  batch_id UUID REFERENCES microgreens_batches(id),
  target_id UUID REFERENCES hydroponics_targets(id),
  
  -- Sensor Data
  temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  ph NUMERIC(4,2),
  ec NUMERIC(6,2),
  water_temp NUMERIC(5,2),
  water_level NUMERIC(6,2),
  light_intensity NUMERIC(8,2),
  
  -- Metadata
  sensor_id VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for sensor_readings
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;

-- Indexes for performance
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_batch ON sensor_readings(batch_id, timestamp DESC);
*/


// ============================================================
// STEP 2: Add Realtime Hook (10 minutes)
// ============================================================
// Create a new file: src/hooks/useSensorRealtime.js

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSensorRealtime = (batchId, targetId) => {
    const [latestReading, setLatestReading] = useState(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (!batchId && !targetId) return;

        setIsLive(true);

        // Subscribe to sensor readings
        const channel = supabase
            .channel('sensor-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'daily_logs', // or 'sensor_readings' if you created it
                filter: batchId
                    ? `batch_id=eq.${batchId}`
                    : `target_id=eq.${targetId}`
            }, (payload) => {
                console.log('📡 New sensor data received:', payload.new);
                setLatestReading(payload.new);
            })
            .subscribe((status) => {
                console.log('Realtime status:', status);
                setIsLive(status === 'SUBSCRIBED');
            });

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(channel);
            setIsLive(false);
        };
    }, [batchId, targetId]);

    return { latestReading, isLive };
};


// ============================================================
// STEP 3: Use in Daily Tracker (10 minutes)
// ============================================================
// In DailyTrackerPage.js, add this code:

import { useSensorRealtime } from '../../hooks/useSensorRealtime';

// Inside DailyTrackerPage component:
const { latestReading, isLive } = useSensorRealtime(
    microgreensEntry.batchId,
    hydroponicsEntry.targetId
);

// Auto-update form when new sensor data arrives
useEffect(() => {
    if (!latestReading) return;

    if (microgreensEntry.batchId) {
        setMicrogreensEntry(prev => ({
            ...prev,
            temperature: latestReading.temp || prev.temperature,
            humidity: latestReading.humidity || prev.humidity
        }));
    }

    if (hydroponicsEntry.targetId) {
        setHydroponicsEntry(prev => ({
            ...prev,
            ph: latestReading.ph || prev.ph,
            ec: latestReading.ec || prev.ec,
            waterTemp: latestReading.water_temp || prev.waterTemp,
            temperature: latestReading.temp || prev.temperature
        }));
    }
}, [latestReading]);


// ============================================================
// STEP 4: Add Live Indicator UI (5 minutes)
// ============================================================
// Add this component to show live status:

const LiveSensorIndicator = ({ isLive }) => {
    if (!isLive) return null;

    return (
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-bold text-green-700">
                📡 Live Sensor Data
            </span>
        </div>
    );
};

// Use it in your form:
<LiveSensorIndicator isLive={isLive} />


// ============================================================
// COMPLETE EXAMPLE: Dashboard with Live Sensors
// ============================================================

import React, { useEffect, useState } from 'react';
import { useSensorRealtime } from '../../hooks/useSensorRealtime';

const DashboardWithLiveSensors = () => {
    const [currentBatchId, setCurrentBatchId] = useState(null);
    const { latestReading, isLive } = useSensorRealtime(currentBatchId, null);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Live Sensor Dashboard</h1>

            {/* Live Indicator */}
            {isLive && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-green-700">
                        Connected to Live Sensors
                    </span>
                </div>
            )}

            {/* Sensor Readings */}
            {latestReading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow border">
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {latestReading.temp}°C
                        </p>
                        <p className="text-xs text-gray-400">
                            {new Date(latestReading.created_at).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow border">
                        <p className="text-xs text-gray-500">Humidity</p>
                        <p className="text-2xl font-bold text-cyan-600">
                            {latestReading.humidity}%
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow border">
                        <p className="text-xs text-gray-500">pH</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {latestReading.ph}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow border">
                        <p className="text-xs text-gray-500">EC</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {latestReading.ec} mS/cm
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};


// ============================================================
// STEP 5: Test Your Integration
// ============================================================
// 1. Start your dev server: npm run dev
// 2. Open browser to localhost
// 3. In another tab, open Supabase SQL Editor
// 4. Insert test sensor data:

/*
INSERT INTO daily_logs (
  user_id,
  batch_id,
  temp,
  humidity,
  ph,
  ec,
  created_at
) VALUES (
  'your-user-id',
  'your-batch-id',
  25.5,
  65.0,
  6.2,
  1.8,
  NOW()
);
*/

// 5. Watch your dashboard update in real-time! 🎉


// ============================================================
// BONUS: IoT Device Simulator
// ============================================================
// For testing, create a simple simulator:

const simulateSensorData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    setInterval(async () => {
        const sensorData = {
            user_id: user.id,
            batch_id: 'your-batch-id',
            temp: (20 + Math.random() * 10).toFixed(1),
            humidity: (50 + Math.random() * 30).toFixed(1),
            ph: (5.5 + Math.random() * 2).toFixed(1),
            ec: (1.0 + Math.random() * 1.5).toFixed(1),
            created_at: new Date().toISOString()
        };

        await supabase.from('daily_logs').insert(sensorData);
        console.log('📡 Simulated sensor data sent:', sensorData);
    }, 5000); // Send data every 5 seconds
};

// Run simulator:
// simulateSensorData();


// ============================================================
// PRODUCTION: Connect Real IoT Devices
// ============================================================
// Once testing works, connect your real sensors:

// Option 1: ESP32/Arduino → HTTP POST to Supabase
/*
// Arduino/ESP32 code:
#include <WiFi.h>
#include <HTTPClient.h>

void sendSensorData(float temp, float humidity) {
  HTTPClient http;
  http.begin("https://your-project.supabase.co/rest/v1/daily_logs");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", "your-anon-key");

  String payload = "{\"temp\":" + String(temp) +
                   ",\"humidity\":" + String(humidity) +
                   ",\"batch_id\":\"your-batch-id\"}";

  int httpCode = http.POST(payload);
  http.end();
}
*/

// Option 2: MQTT → Supabase Edge Function → Database
// Option 3: Raspberry Pi → Direct Supabase Client


// ============================================================
// NOTES:
// ============================================================
// 1. Realtime subscriptions are FREE up to 200 concurrent connections
// 2. For high-frequency data (>1 reading/sec), use sensor_readings table
// 3. daily_logs is better for aggregated/summary data
// 4. Always filter subscriptions by user_id for security
// 5. Use RLS (Row Level Security) to protect sensor data
