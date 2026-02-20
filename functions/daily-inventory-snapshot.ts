/**
 * Daily Inventory Snapshot
 * Runs at 11:59 PM PST daily to capture inventory levels
 * Schedule: 0 59 23 * * * (America/Los_Angeles timezone)
 */

export default async function handler({ base44 }) {
  try {
    // Get all active products
    const products = await base44.asServiceRole.entities.Product.filter({ is_active: true });
    
    // Get all location stocks
    const locationStocks = await base44.asServiceRole.entities.ProductLocationStock.list();
    
    // Get all locations for reference
    const locations = await base44.asServiceRole.entities.InventoryLocation.list();
    
    // Create a map of locations for quick lookup
    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc.id] = loc.name;
    });
    
    // Get current date in PST
    const pstDate = new Date().toLocaleDateString('en-US', { 
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [month, day, year] = pstDate.split('/');
    const snapshotDate = `${year}-${month}-${day}`;
    
    // Create snapshot records
    const snapshots = products.map(product => {
      // Get location breakdown for this product
      const productLocations = locationStocks
        .filter(ls => ls.product_id === product.id && ls.quantity > 0)
        .map(ls => ({
          location_id: ls.location_id,
          location_name: locationMap[ls.location_id] || 'Unknown',
          quantity: ls.quantity
        }));
      
      return {
        snapshot_date: snapshotDate,
        product_id: product.id,
        sku: product.sku,
        product_name: product.name,
        total_stock: product.current_stock || 0,
        location_breakdown: productLocations,
        reorder_point: product.reorder_point,
        cost: product.cost
      };
    });
    
    // Bulk create all snapshots
    if (snapshots.length > 0) {
      await base44.asServiceRole.entities.InventorySnapshot.bulkCreate(snapshots);
    }
    
    return {
      success: true,
      message: `Captured snapshot for ${snapshots.length} products on ${snapshotDate}`,
      snapshot_date: snapshotDate,
      products_count: snapshots.length
    };
    
  } catch (error) {
    console.error('Inventory snapshot failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}