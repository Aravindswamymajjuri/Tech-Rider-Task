const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    role: { type: String, enum: ["admin", "builder", "buyer", "nri"], required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: String,

    // Builder fields
    company: String,
    rera: String,
    gstin: String,
    city: String,
    verified: Boolean,

    // Buyer fields
    category: { type: String, enum: ["apartment", "villa", "plot", "commercial", "independent"] },
    budgetMin: Number,
    budgetMax: Number,
    preferences: [String],

    // NRI fields
    country: String,
    preferredCity: String,
    investmentRange: String,

    // OAuth identity
    provider: { type: String, enum: ["local", "google", "microsoft"], default: "local" },
    providerId: { type: String, index: true },
    avatarUrl: String,

    // Personal lists (buyer / nri)
    favourites: [{ type: Schema.Types.ObjectId, ref: "Property", default: [] }],
    compareList: [{ type: Schema.Types.ObjectId, ref: "Property", default: [] }],

    // Per-user notification preferences
    preferences: {
      emailEnquiries: { type: Boolean, default: true },
      emailWeeklyDigest: { type: Boolean, default: true },
      emailMarketing: { type: Boolean, default: false },
      pushAlerts: { type: Boolean, default: true }
    }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = model("User", userSchema);
