import shipstationSync from './shipstation-sync.js';

/**
 * Manual trigger for ShipStation sync
 * Can be called from the UI to force a sync
 */
export default async function manualShipstationSync(request) {
  // Allow passing a custom date range
  const { startDate, endDate } = request.body || {};
  
  const syncRequest = {
    lastSyncTime: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: endDate
  };
  
  return await shipstationSync(syncRequest);
}