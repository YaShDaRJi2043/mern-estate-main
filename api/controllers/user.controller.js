import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import Listing from "../models/listing.model.js";

export const test = (req, res) => {
  res.json({
    message: "Api route is working!",
  });
};

// update user profile
export const updateUser = async (req, res, next) => {
  const userId = req.user.id;
  const requestedUserId = req.params.id;
  try {
    if (userId !== requestedUserId) {
      return next(errorHandler(401, "You can only update your own account!"));
    }

    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      requestedUserId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// delete user profile
export const deleteUser = async (req, res, next) => {
  const userId = req.user.id;
  const requestedUserId = req.params.id;
  try {
    if (userId !== requestedUserId) {
      return next(errorHandler(401, "You can only delete your own account!"));
    }

    let userListig = await Listing.find({ userRef: requestedUserId });
    await Listing.deleteMany({ userRef: requestedUserId });

    await User.findByIdAndDelete(requestedUserId);

    res
      .status(200)
      .json({ status: 200, userListig, message: "accout deleted" });
  } catch (error) {
    next(error);
  }
};

// show user listings
export const getUserListings = async (req, res, next) => {
  const userId = req.user.id;
  const requestedUserId = req.params.id;
  try {
    if (userId === requestedUserId) {
      const listings = await Listing.find({ userRef: requestedUserId });
      res.status(200).json(listings);
    } else {
      return next(errorHandler(401, "You can only view your own listings!"));
    }
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found!"));
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
