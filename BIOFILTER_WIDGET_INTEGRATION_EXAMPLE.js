/**
 * EXAMPLE: How to Add BiofilterWidget to Dashboard
 * 
 * This file shows you exactly how to integrate the BiofilterWidget
 * into your DashboardHome.js file
 */

// ============================================================
// STEP 1: Import the Component
// ============================================================
// At the top of DashboardHome.js, add:
import BiofilterWidget from '../../components/BiofilterWidget';


// ============================================================
// STEP 2: Calculate Active Batch Count
// ============================================================
// In your DashboardHome component, add this calculation:

const activeBatchCount = batches.filter(b =>
    b.status === 'Growing' || b.status === 'Harvest Ready'
).length;


// ============================================================
// STEP 3: Add Widget to JSX
// ============================================================
// In your dashboard grid/layout, add the BiofilterWidget:

/*
<BiofilterWidget 
  activeBatchCount={activeBatchCount}
  fanSpeedMode="MEDIUM"
/>
*/


// ============================================================
// COMPLETE EXAMPLE: Dashboard Layout
// ============================================================

export const DashboardExample = () => {
    // Assuming you have batches data from your hooks
    const { batches } = useMicrogreens();

    // Calculate active batches
    const activeBatchCount = batches.filter(b =>
        b.status === 'Growing' || b.status === 'Harvest Ready'
    ).length;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Existing stat cards */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Total Batches</h3>
                    <p className="text-3xl font-bold">{batches.length}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Active Batches</h3>
                    <p className="text-3xl font-bold">{activeBatchCount}</p>
                </div>

                {/* NEW: Biofilter Widget */}
                <BiofilterWidget
                    activeBatchCount={activeBatchCount}
                    fanSpeedMode="MEDIUM"
                />

            </div>
        </div>
    );
};


// ============================================================
// ADVANCED: Dynamic Fan Speed
// ============================================================
// If you want to make fan speed configurable:

export const DashboardWithFanControl = () => {
    const [fanSpeed, setFanSpeed] = useState('MEDIUM');
    const { batches } = useMicrogreens();

    const activeBatchCount = batches.filter(b =>
        b.status === 'Growing' || b.status === 'Harvest Ready'
    ).length;

    return (
        <div className="p-6">
            {/* Fan Speed Control */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Fan Speed</label>
                <select
                    value={fanSpeed}
                    onChange={(e) => setFanSpeed(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                    <option value="OFF">Off</option>
                </select>
            </div>

            {/* Biofilter Widget with dynamic fan speed */}
            <BiofilterWidget
                activeBatchCount={activeBatchCount}
                fanSpeedMode={fanSpeed}
            />
        </div>
    );
};


// ============================================================
// NOTES:
// ============================================================
// 1. The widget automatically calculates air quality metrics
// 2. It shows different messages based on batch count and fan speed
// 3. Default fan speed is 'MEDIUM' if not specified
// 4. The widget is fully responsive and styled
// 5. You can customize colors by editing BiofilterWidget.js
