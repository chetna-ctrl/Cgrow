/**
 * Agri-OS Geometry Engine
 * Structural modeling for Greenhouse and Vertical Farms
 */

export const calculateGeometry = (length, width, gutterHeight = 12, ridgeHeight = 16) => {
    const area = length * width;

    // 1. Structural Volume (Average height for gable/arch roof)
    const avgHeight = (gutterHeight + ridgeHeight) / 2;
    const volume = area * avgHeight;

    // 2. Surface Area (Approximate for cooling/heating load calculations)
    // Floor + 4 Walls + Roof (approx 1.2x of area for pitched roof)
    const perimeter = 2 * (length + width);
    const wallArea = perimeter * gutterHeight;
    const roofArea = area * 1.15; // Slant factor
    const totalSurfaceArea = wallArea + roofArea;

    // 3. Engineering Warnings
    const warnings = [];
    if (length > 150) {
        warnings.push({
            type: 'airflow',
            level: 'warning',
            message: 'Length > 150ft: Professional fan-pad systems may face static pressure issues. Consider cross-ventilation.'
        });
    }
    if (width > 40) {
        warnings.push({
            type: 'structure',
            level: 'info',
            message: 'Width > 40ft: Suggesting double-span gable for better structural integrity and snow/rain load.'
        });
    }
    if (gutterHeight < 10) {
        warnings.push({
            type: 'climate',
            level: 'warning',
            message: 'Gutter height < 10ft: Low thermal buffer. Cooling will be expensive in peak summers.'
        });
    }

    return {
        area,
        volume,
        totalSurfaceArea,
        dimensions: { length, width, gutterHeight, ridgeHeight },
        warnings
    };
};

export const calculateVerticalRacks = (area, layers = 4, spacing = 2) => {
    // 65% space efficiency for vertical racks
    const usableArea = area * 0.65;
    const rackArea = 25; // standard 5x5 or 4x6 rack
    const numRacks = Math.floor(usableArea / rackArea);
    const totalTrayArea = numRacks * layers * 2; // 2 sqft tray
    const totalTrays = numRacks * layers;

    return {
        numRacks,
        layers,
        totalTrays,
        totalTrayArea,
        usableArea
    };
};
