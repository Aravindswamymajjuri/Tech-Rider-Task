const { Schema, model } = require("mongoose");

const propertySchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["apartment", "villa", "plot", "commercial", "independent"],
      required: true,
      index: true
    },
    bhk: String,
    builderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    builderName: { type: String, required: true },
    city: { type: String, required: true, index: true },
    location: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    pricePerSqft: Number,
    areaSqft: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    gallery: [String],
    facing: String,
    possession: String,
    rera: String,
    amenities: [String],
    highlights: [String],
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["available", "pending", "sold"],
      default: "available",
      index: true
    },
    views: { type: Number, default: 0 },
    brochureDownloads: { type: Number, default: 0 },
    visitRequests: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

propertySchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = model("Property", propertySchema);
