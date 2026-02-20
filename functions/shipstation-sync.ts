import { base44 } from "base44";

/**
 * ShipStation Order Sync
 * Syncs orders from ShipStation and creates transactions
 * Runs every 15 minutes via scheduled function
 */
export default async function shipstationSync(request) {
  const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY;
  const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET;
  
  if (!SHIPSTATION_API_KEY || !SHIPSTATION_API_SECRET) {
    console.error("ShipStation API credentials not configured");
    return { 
      success: false, 
      error: "ShipStation API credentials not configured. Please add them in Settings > Secrets." 
    };
  }

  try {
    // Get the last sync time from app state or default to 24 hours ago
    const lastSyncTime = request.lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // ShipStation API endpoint
    const baseUrl = "https://ssapi.shipstation.com";
    const auth = Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64');
    
    // Fetch orders modified since last sync
    const ordersResponse = await fetch(
      `${baseUrl}/orders?modifyDateStart=${lastSyncTime}&pageSize=500`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!ordersResponse.ok) {
      throw new Error(`ShipStation API error: ${ordersResponse.status} ${ordersResponse.statusText}`);
    }
    
    const ordersData = await ordersResponse.json();
    const orders = ordersData.orders || [];
    
    console.log(`Found ${orders.length} orders to sync`);
    
    // Get existing SKU mappings
    const skuMappings = await base44.asServiceRole.entities.SKUMapping.list();
    const mappingDict = {};
    skuMappings.forEach(m => {
      mappingDict[m.customer_sku] = m.internal_sku;
    });
    
    // Get or create customers
    const existingCustomers = await base44.asServiceRole.entities.Customer.list();
    const customerEmailMap = {};
    existingCustomers.forEach(c => {
      customerEmailMap[c.email.toLowerCase()] = c;
    });
    
    let newTransactions = 0;
    let updatedProducts = new Set();
    
    for (const order of orders) {
      // Skip if already synced (check for existing transaction with this order ID)
      const existing = await base44.asServiceRole.entities.Transaction.filter({ order_id: order.orderId });
      if (existing.length > 0) {
        continue;
      }
      
      // Determine channel
      const channel = order.advancedOptions?.customField1?.toLowerCase().includes('wholesale') 
        ? 'wholesale' 
        : 'd2c';
      
      // Get or create customer
      const customerEmail = order.customerEmail?.toLowerCase() || `shipstation-${order.customerId}@placeholder.com`;
      let customer = customerEmailMap[customerEmail];
      
      if (!customer && order.customerEmail) {
        customer = await base44.asServiceRole.entities.Customer.create({
          name: `${order.shipTo.name || order.billTo.name || 'Unknown'}`,
          email: customerEmail,
          company: order.shipTo.company || order.billTo.company,
          status: 'active',
          channel: channel,
          lifetime_value: 0
        });
        customerEmailMap[customerEmail] = customer;
      }
      
      // Process each item in the order
      for (const item of order.items || []) {
        const customerSKU = item.sku;
        const internalSKU = mappingDict[customerSKU] || customerSKU;
        
        // Calculate unit shipping cost
        const totalShipping = order.shippingAmount || 0;
        const totalItems = order.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        const itemQuantity = item.quantity || 1;
        const itemShippingCost = totalItems > 0 ? (totalShipping / totalItems) * itemQuantity : 0;
        const unitShippingCost = itemQuantity > 0 ? itemShippingCost / itemQuantity : 0;
        
        // Create transaction for this item
        await base44.asServiceRole.entities.Transaction.create({
          type: 'revenue',
          channel: channel,
          amount: item.unitPrice * itemQuantity,
          category: 'sales',
          description: `${item.name} - Order #${order.orderNumber}`,
          date: order.orderDate.split('T')[0],
          customer_id: customer?.id,
          order_id: order.orderId,
          sku: internalSKU,
          quantity: itemQuantity,
          shipping_cost: itemShippingCost,
          unit_shipping_cost: unitShippingCost
        });
        
        newTransactions++;
        
        // Update customer lifetime value
        if (customer) {
          const newLTV = (customer.lifetime_value || 0) + (item.unitPrice * itemQuantity);
          await base44.asServiceRole.entities.Customer.update(customer.id, {
            lifetime_value: newLTV
          });
        }
        
        // Update product stock if product exists
        const products = await base44.asServiceRole.entities.Product.filter({ sku: internalSKU });
        if (products.length > 0) {
          const product = products[0];
          const newStock = (product.current_stock || 0) - itemQuantity;
          await base44.asServiceRole.entities.Product.update(product.id, {
            current_stock: Math.max(0, newStock)
          });
          updatedProducts.add(internalSKU);
          
          // Create inventory movement
          await base44.asServiceRole.entities.InventoryMovement.create({
            product_id: product.id,
            sku: internalSKU,
            quantity: -itemQuantity,
            movement_type: 'sale',
            notes: `Order #${order.orderNumber}`,
            reference_id: order.orderId
          });
        }
      }
      
      // Create shipping expense transaction
      if (order.shippingAmount > 0) {
        await base44.asServiceRole.entities.Transaction.create({
          type: 'expense',
          amount: order.shippingAmount,
          category: 'shipping',
          description: `Shipping - Order #${order.orderNumber}`,
          date: order.orderDate.split('T')[0],
          order_id: order.orderId
        });
      }
    }
    
    return {
      success: true,
      ordersProcessed: orders.length,
      newTransactions: newTransactions,
      productsUpdated: updatedProducts.size,
      lastSyncTime: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("ShipStation sync error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Schedule configuration
 * This function runs every 15 minutes
 */
export const schedule = "*/15 * * * *"; // Every 15 minutes