import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    metadata: {
      createdAt: { type: Date, default: Date.now },
      lastNotified: { type: Date },
      failureCount: { type: Number, default: 0 },
      lastError: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ userId: 1, scheduledFor: 1, status: 1 });

export const Reminder = mongoose.model("Reminder", reminderSchema);
