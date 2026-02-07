/**
 * Custom Hook: useCSVExport
 * Handles CSV export logic for daily logs
 * Extracted from DailyTrackerPage for better separation of concerns
 */

import { supabase } from '../../../lib/supabaseClient';
import { estimatePPFD } from '../../../utils/agriUtils';

export const useCSVExport = () => {
    /**
     * Export logs to CSV
     */
    const exportToCSV = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please log in');
                return;
            }

            const { data: logs } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!logs || logs.length === 0) {
                alert('No data to export');
                return;
            }

            // 1. AGGREGATION: Latest Entry Wins per ID per Date
            const uniqueEntries = {};
            logs.forEach(log => {
                const dateKey = new Date(log.created_at).toLocaleDateString();
                const idKey = log.batch_id || log.target_id || log.system_id || 'Unknown';
                const uniqueKey = `${log.system_type}_${idKey}_${dateKey}`;

                if (!uniqueEntries[uniqueKey]) {
                    uniqueEntries[uniqueKey] = log;
                }
            });

            const aggregatedLogs = Object.values(uniqueEntries);

            // 2. PROCESSING & CLEANING
            const processedLogs = aggregatedLogs.map(log => {
                const isMicro = log.system_type === 'Microgreens';
                const dateObj = new Date(log.created_at);

                // Calculate Missing DLI (Legacy Repair)
                let finalDLI = log.dli_mol_per_m2;
                if (!finalDLI && log.light_hours_per_day && log.lighting_source) {
                    const estimatedPPFD = estimatePPFD(log.lighting_source, 'Sunny');
                    finalDLI = (estimatedPPFD * log.light_hours_per_day * 0.0036).toFixed(2);
                }

                return {
                    Date: dateObj.toLocaleDateString(),
                    Time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    System: log.system_type,
                    ID: log.batch_id || log.target_id || log.system_id || 'N/A',
                    Status: log.visual_check || log.status || 'OK',

                    // ENVIRONMENT
                    Temp: log.temp ? `${log.temp}°C` : '-',
                    Humidity: isMicro && log.humidity ? `${log.humidity}%` : '-',
                    VPD: isMicro && log.vpd_kpa ? `${log.vpd_kpa} kPa` : '-',

                    // WATER
                    pH: !isMicro && log.ph ? log.ph : '-',
                    EC: !isMicro && log.ec ? log.ec : '-',
                    WaterTemp: !isMicro && log.water_temp ? `${log.water_temp}°C` : '-',

                    // LIGHTING & DLI
                    LightSource: log.lighting_source || '-',
                    Hours: log.light_hours_per_day || 0,
                    DLI: finalDLI || '-',

                    // ALERTS
                    HealthScore: log.health_score || '-',
                    Warnings: log.nutrient_warnings_count || 0,
                    Notes: log.notes ? `"${log.notes}"` : ''
                };
            });

            // Sort by Date DESC
            processedLogs.sort((a, b) => new Date(b.Date) - new Date(a.Date));

            // Generate CSV
            const headers = Object.keys(processedLogs[0]).join(',');
            const rows = processedLogs.map(row => Object.values(row).join(','));
            const csv = [headers, ...rows].join('\n');

            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cGrow_Daily_Report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();

            return { success: true, count: processedLogs.length };
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting: ' + error.message);
            return { success: false, error: error.message };
        }
    };

    return { exportToCSV };
};
