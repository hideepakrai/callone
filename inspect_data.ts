import dbConnect from "./src/lib/db/connection";
import { Order } from "./src/lib/db/models/Order";
import { Product } from "./src/lib/db/models/Product";

async function inspect() {
  try {
    await dbConnect();
    
    const order = await Order.findOne({ items: { $exists: true, $not: { $size: 0 } } }).lean();
    console.log("SAMPLE ORDER DATA:", JSON.stringify(order, null, 2));
    
    const product = await Product.findOne().lean();
    console.log("SAMPLE PRODUCT DATA:", JSON.stringify(product, null, 2));
    
    const activeProductsCount = await Product.countDocuments({ status: { $ne: "archived" } });
    console.log("ACTIVE PRODUCTS COUNT (status != archived):", activeProductsCount);
    
    const productsByStatus = await Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("PRODUCTS BY STATUS:", productsByStatus);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
