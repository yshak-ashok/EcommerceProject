const Banner = require("../models/bannerModel");
const asyncHandler = require("express-async-handler");

const loadAddBanner = asyncHandler(async (req, res) => {
    try {
        res.render("add-Banner", { Message: "" });
    } catch (error) {
        console.error(error);
    }
});

const addBanner = asyncHandler(async (req, res) => {
    try {
        const { title, description, expDate } = req.body;
        const image = req.file.filename; // Assuming a single image is uploaded
        //console.log(image);
        const bannerData = await Banner.create({
            title: title,
            image: image,
            description: description,
            startDate: new Date(),
            endDate: expDate,
        });

        res.render("add-Banner", { Message: "Banner Added" });
    } catch (error) {
        console.error(error);
    }
});

const bannerList = asyncHandler(async (req, res) => {
  try {
      // Get current date
      const currentDate = new Date();
      // Find all coupons
      const bannerData = await Banner.find();
      // Check each coupon for expiration and update 'isActive' accordingly
      for (let banner of bannerData) {
          if (banner.endDate <= currentDate) {
              // If expiration date has passed, set 'isActive' to false
              await Banner.findByIdAndUpdate(banner._id, { isActive: false });
          }
      }
      // Fetch updated coupon list
      const updatedBanner = await Banner.find();
      res.render("banner-List", { bannerData: updatedBanner });
  } catch (error) {
      console.error(error);
  }
});

const bannerStatus = asyncHandler(async (req, res) => {
    try {
        const BannerId = req.query.bannerId;
        console.log("bannerid", BannerId);
        const findBanner = await Banner.findById(BannerId);

        if (!findBanner) {
            return res.status(404).json({ error: "Banner not found" });
        }

        const currentDate = new Date();
        if (findBanner.endDate < currentDate) {
            return res.status(400).json({ error: "Banner has expired. Status cannot be changed." });
        }

        const newStatus = !findBanner.isActive;
        const changeStatus = await Banner.findByIdAndUpdate(BannerId, { isActive: newStatus }, { new: true });

        res.status(200).json({ message: "Banner status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update the Banner status" });
    }
});







module.exports = { loadAddBanner, addBanner, bannerList, bannerStatus };
