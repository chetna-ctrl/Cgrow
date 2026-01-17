// Sample data for demo mode
export const SAMPLE_BATCHES = [
    {
        id: 'demo-1',
        batch_id: 'MG-001',
        crop: 'Radish (Mooli)',
        tray_id: 'T1',
        sow_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expected_harvest_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'growing',
        yield_grams: 0,
        cost: 50,
        revenue: 0,
        user_id: 'demo-user'
    },
    {
        id: 'demo-2',
        batch_id: 'MG-002',
        crop: 'Fenugreek (Methi)',
        tray_id: 'T2',
        sow_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expected_harvest_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'growing',
        yield_grams: 0,
        cost: 50,
        revenue: 0,
        user_id: 'demo-user'
    },
    {
        id: 'demo-3',
        batch_id: 'MG-003',
        crop: 'Mustard (Sarson)',
        tray_id: 'T3',
        sow_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expected_harvest_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'harvested',
        yield_grams: 150,
        cost: 50,
        revenue: 270,
        user_id: 'demo-user'
    },
    {
        id: 'demo-4',
        batch_id: 'MG-004',
        crop: 'Coriander (Dhania)',
        tray_id: 'T4',
        sow_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expected_harvest_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'harvested',
        yield_grams: 120,
        cost: 50,
        revenue: 264,
        user_id: 'demo-user'
    }
];

export const SAMPLE_SYSTEMS = [
    {
        id: 'demo-sys-1',
        system_id: 'NFT-001',
        crop: 'Lettuce',
        plant_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expected_harvest_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        current_ph: 6.0,
        current_ec: 1.8,
        current_temp: 24,
        status: 'active',
        user_id: 'demo-user'
    },
    {
        id: 'demo-sys-2',
        system_id: 'DWC-001',
        crop: 'Tomato',
        plant_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expected_harvest_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        current_ph: 6.2,
        current_ec: 2.0,
        current_temp: 25,
        status: 'active',
        user_id: 'demo-user'
    }
];

export const SAMPLE_LOGS = [
    {
        id: 'demo-log-1',
        system_id: 'NFT-001',
        system_type: 'hydroponics',
        ph: 6.0,
        ec: 1.8,
        temp: 24,
        water_level: 80,
        notes: 'All good',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'demo-user'
    },
    {
        id: 'demo-log-2',
        system_id: 'NFT-001',
        system_type: 'hydroponics',
        ph: 6.1,
        ec: 1.9,
        temp: 25,
        water_level: 75,
        notes: 'Slight increase',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'demo-user'
    },
    {
        id: 'demo-log-3',
        system_id: 'NFT-001',
        system_type: 'hydroponics',
        ph: 5.9,
        ec: 1.7,
        temp: 24,
        water_level: 78,
        notes: 'Adjusted pH',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'demo-user'
    },
    {
        id: 'demo-log-4',
        system_id: 'NFT-001',
        system_type: 'hydroponics',
        ph: 6.0,
        ec: 1.8,
        temp: 23,
        water_level: 80,
        notes: 'Perfect conditions',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'demo-user'
    },
    {
        id: 'demo-log-5',
        system_id: 'DWC-001',
        system_type: 'hydroponics',
        ph: 6.2,
        ec: 2.0,
        temp: 25,
        water_level: 85,
        notes: 'Healthy growth',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'demo-user'
    },
    {
        id: 'demo-log-6',
        system_id: 'DWC-001',
        system_type: 'hydroponics',
        ph: 6.3,
        ec: 2.1,
        temp: 26,
        water_level: 82,
        notes: 'Temperature rising',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'demo-user'
    }
];

export const SAMPLE_HARVEST_RECORDS = [
    {
        id: 'demo-harvest-1',
        source_type: 'microgreens',
        source_id: 'MG-003',
        crop: 'Mustard (Sarson)',
        harvest_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        yield_kg: 0.15,
        quality_grade: 'A',
        selling_price_per_kg: 180,
        total_revenue: 270,
        user_id: 'demo-user'
    },
    {
        id: 'demo-harvest-2',
        source_type: 'microgreens',
        source_id: 'MG-004',
        crop: 'Coriander (Dhania)',
        harvest_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        yield_kg: 0.12,
        quality_grade: 'A',
        selling_price_per_kg: 220,
        total_revenue: 264,
        user_id: 'demo-user'
    }
];

// Helper function to check if in demo mode
export function isDemoMode() {
    return localStorage.getItem('demoMode') === 'true';
}

// Helper function to enter demo mode
export function enterDemoMode() {
    localStorage.setItem('demoMode', 'true');
}

// Helper function to exit demo mode
export function exitDemoMode() {
    // Clear all demo-specific data
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demo_batches');
    localStorage.removeItem('demo_systems');
    localStorage.removeItem('demo_logs');
    localStorage.removeItem('demo_harvests');

    // Note: Don't use localStorage.clear() to preserve user preferences like theme
    console.log('Demo mode exited, all demo data cleared');
}

// Helper function to load sample data into localStorage
export function loadSampleDataToLocalStorage() {
    localStorage.setItem('demo_batches', JSON.stringify(SAMPLE_BATCHES));
    localStorage.setItem('demo_systems', JSON.stringify(SAMPLE_SYSTEMS));
    localStorage.setItem('demo_logs', JSON.stringify(SAMPLE_LOGS));
    localStorage.setItem('demo_harvests', JSON.stringify(SAMPLE_HARVEST_RECORDS));
}
