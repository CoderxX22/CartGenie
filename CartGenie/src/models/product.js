// src/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    smlmitzrach: { type: Number, index: true }, // код/штрихкод
    shmmitzrach: String,                        // название на иврите
    english_name: String,                       // название на английском
  },
  {
    collection: 'mizrahim', // очень важно: имя коллекции как в Mongo
    strict: false,          // остальные поля (все нутриенты) не режем
  }
);

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema);
