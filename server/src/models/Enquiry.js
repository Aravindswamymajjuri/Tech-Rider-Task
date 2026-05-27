const { Schema, model } = require("mongoose");

const enquirySchema = new Schema(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", index: true },
    propertyTitle: String,
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    message: String,
    source: {
      type: String,
      enum: ["property", "contact", "callback", "brochure"],
      default: "property"
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "won", "lost"],
      default: "new",
      index: true
    },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

enquirySchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = model("Enquiry", enquirySchema);
