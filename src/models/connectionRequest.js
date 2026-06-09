const mongoose = require("mongoose");

const connectionRequest = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //reference to the user collection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["accepted", "rejected", "ignored", "interested"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  },
);

connectionRequest.index({ fromUserId: 1, toUserId: 1 });

connectionRequest.pre("save", function () {
  const connRequest = this;

  if (connRequest.fromUserId.equals(connRequest.toUserId)) {
    throw new Error("You cannot send a connection request to yourself");
  }
});

const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequest,
);

module.exports = ConnectionRequest;
