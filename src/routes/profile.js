const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const validator = require("validator");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Extract fields to be updated from req.user (except email field)
    const allowedUpdates = [
      "firstName",
      "lastName",
      "age",
      "about",
      "photoUrl",
      "skills",
    ];
    const updates = Object.keys(req.body);

    const isAllowed = updates.every((field) => allowedUpdates.includes(field));

    if (!isAllowed) {
      throw new Error("Invalid update field");
    }

    // Get logged-in user
    const user = req.user;

    // Update fields
    updates.forEach((field) => {
      user[field] = req.body[field];
    });

    // Validate and save to database
    await user.save();

    res.json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currPassword, newPassword } = req.body;
    // Validate input
    if (!currPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }
    const user = req.user;
    const isPasswordValid = await user.validatePassword(currPassword);

    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }
    // Ensure new password is different
    if (currPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }
    // Validate password strength
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error(
        "Password should contain uppercase, lowercase, number and special character",
      );
    }
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = passwordHash;

    // Save to database
    await user.save();

    res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

module.exports = profileRouter;
