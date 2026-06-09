const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const mongoose = require("mongoose");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const status = req.params.status;
      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("invalid status type " + status);
      }
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        throw new Error("Invalid user ID");
      }
      const userInDatabase = await User.findById(toUserId);
      if (!userInDatabase) {
        throw new Error("User does not exist");
      }
      const { firstName } = userInDatabase;
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        throw new Error("Connection request already exists");
      }
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.json({
        message: `${req.user.firstName} is ${status} in ${firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).json({ message: "ERROR " + err.message });
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status: currStatus, requestId } = req.params;

      // Validate status
      if (!["accepted", "rejected"].includes(currStatus)) {
        throw new Error("Invalid review type");
      }

      // Validate requestId format
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new Error("Invalid request ID");
      }

      // Find the pending request that belongs to the logged-in user
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        throw new Error(
          "Connection request not found or you are not authorized to review it",
        );
      }

      // Update status
      connectionRequest.status = currStatus;
      await connectionRequest.save();

      res.json({
        message: `Connection request ${currStatus} successfully`,
        data: connectionRequest,
      });
    } catch (err) {
      res.status(400).json({
        message: "ERROR: " + err.message,
      });
    }
  },
);

module.exports = requestRouter;
