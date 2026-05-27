const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "enquiry_received",
        "property_listed",
        "property_milestone",
        "user_signup",
        "system",
        "welcome"
      ],
      required: true
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    link: String,
    read: { type: Boolean, default: false, index: true },
    icon: { type: String, default: "bell" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

notificationSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = model("Notification", notificationSchema);
