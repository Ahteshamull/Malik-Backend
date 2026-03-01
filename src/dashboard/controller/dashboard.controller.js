import userModel from "../../auth/schema/auth.modal.js";
import { Listing } from "../../listing/schema/listing.modal.js";
import Deal from "../../deals/schema/deal.modal.js";
import Payment from "../../payment/schema/payment.modal.js";

export const dashboard = async (req, res) => {
  try {
    // Get all total counts in parallel
    const [totalUsers, totalListings, totalDeals, recentUsers] =
      await Promise.all([
        userModel.countDocuments({}),
        Listing.countDocuments({}),
        Deal.countDocuments({}),
        userModel
          .find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .select("name email role createdAt"),
      ]);

    res.status(200).json({
      success: true,
      error: false,
      message: "Dashboard data retrieved successfully",
      data: {
        totals: {
          users: totalUsers,
          listings: totalListings,
          deals: totalDeals,
        },
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Error retrieving dashboard data",
      error: error.message,
    });
  }
};

export const userDashboard = async (req, res) => {
  try {
    // Get user ID from token
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Authentication required",
      });
    }

    // Get user details to determine role
    const user = await userModel.findById(userId).select("role");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get all user-specific data in parallel
    const [
      totalListings,
      verifiedListings,
      totalDeals,
      totalSpending,
      monthlySpending,
      lastMonthSpending,
      totalNightStays,
      currentMonthNightStays,
      lastMonthNightStays,
      totalEarnings,
      monthlyEarnings,
      lastMonthEarnings,
    ] = await Promise.all([
      Listing.countDocuments({ userId }),

      Listing.countDocuments({ userId, status: "verified" }),

      Deal.countDocuments({ userId }),

      Payment.aggregate([
        {
          $match: {
            userId,
            status: { $in: ["SUCCESS", "IN_PROGRESS", "HOLD"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      Payment.aggregate([
        {
          $match: {
            userId,
            status: { $in: ["SUCCESS", "IN_PROGRESS || HOLD"] },
            createdAt: {
              $gte: new Date(currentYear, currentMonth, 1),
              $lt: new Date(currentYear, currentMonth + 1, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      // Last month spending
      Payment.aggregate([
        {
          $match: {
            userId,
            status: { $in: ["SUCCESS", "IN_PROGRESS || HOLD"] },
            createdAt: {
              $gte: new Date(lastMonthYear, lastMonth, 1),
              $lt: new Date(lastMonthYear, lastMonth + 1, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      // Total night stays from deals
      Deal.aggregate([
        { $match: { userId } },
        { $unwind: "$compensation" },
        {
          $match: {
            "compensation.nightCredits": true,
          },
        },
        {
          $group: {
            _id: null,
            totalNights: { $sum: "$compensation.numberOfNights" },
          },
        },
      ]),

      // Current month night stays
      Deal.aggregate([
        {
          $match: {
            userId,
            createdAt: {
              $gte: new Date(currentYear, currentMonth, 1),
              $lt: new Date(currentYear, currentMonth + 1, 1),
            },
          },
        },
        { $unwind: "$compensation" },
        {
          $match: {
            "compensation.nightCredits": true,
          },
        },
        {
          $group: {
            _id: null,
            totalNights: { $sum: "$compensation.numberOfNights" },
          },
        },
      ]),

      // Last month night stays
      Deal.aggregate([
        {
          $match: {
            userId,
            createdAt: {
              $gte: new Date(lastMonthYear, lastMonth, 1),
              $lt: new Date(lastMonthYear, lastMonth + 1, 1),
            },
          },
        },
        { $unwind: "$compensation" },
        {
          $match: {
            "compensation.nightCredits": true,
          },
        },
        {
          $group: {
            _id: null,
            totalNights: { $sum: "$compensation.numberOfNights" },
          },
        },
      ]),

      // Total earnings (for influencers)
      Payment.aggregate([
        {
          $match: {
            selectInfluencerOrHost: userId,
            status: "SUCCESS",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$influencer_amount" },
          },
        },
      ]),

      // Monthly earnings (current month)
      Payment.aggregate([
        {
          $match: {
            selectInfluencerOrHost: userId,
            status: "SUCCESS",
            createdAt: {
              $gte: new Date(currentYear, currentMonth, 1),
              $lt: new Date(currentYear, currentMonth + 1, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$influencer_amount" },
          },
        },
      ]),

      // Last month earnings
      Payment.aggregate([
        {
          $match: {
            selectInfluencerOrHost: userId,
            status: "SUCCESS",
            createdAt: {
              $gte: new Date(lastMonthYear, lastMonth, 1),
              $lt: new Date(lastMonthYear, lastMonth + 1, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$influencer_amount" },
          },
        },
      ]),
    ]);

    // Calculate growth rates
    const currentSpending = monthlySpending[0]?.total || 0;
    const lastSpending = lastMonthSpending[0]?.total || 0;
    const spendingGrowth =
      lastSpending > 0
        ? (((currentSpending - lastSpending) / lastSpending) * 100).toFixed(2)
        : 0;

    const currentEarnings = monthlyEarnings[0]?.total || 0;
    const lastEarnings = lastMonthEarnings[0]?.total || 0;
    const earningsGrowth =
      lastEarnings > 0
        ? (((currentEarnings - lastEarnings) / lastEarnings) * 100).toFixed(2)
        : 0;

    const currentNightStays = currentMonthNightStays[0]?.totalNights || 0;
    const lastNightStays = lastMonthNightStays[0]?.totalNights || 0;
    const nightStaysGrowth =
      lastNightStays > 0
        ? (
            ((currentNightStays - lastNightStays) / lastNightStays) *
            100
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      error: false,
      message: "User dashboard data retrieved successfully",
      data: {
        userRole: user.role,
        totals: {
          listings: {
            total: totalListings,
            verified: verifiedListings,
          },
          deals: totalDeals,
          nightStays: {
            total: totalNightStays[0]?.totalNights || 0,
            currentMonth: currentNightStays,
            growth: parseFloat(nightStaysGrowth),
          },
          earnings: {
            total: totalEarnings[0]?.total || 0,
            currentMonth: currentEarnings,
            growth: parseFloat(earningsGrowth),
          },
          spending: {
            total: totalSpending[0]?.total || 0,
            currentMonth: currentSpending,
            growth: parseFloat(spendingGrowth),
          },
        },
        monthlyData: {
          currentMonth: new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        },
        meta: {
          lastUpdated: new Date(),
          currency: "USD",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Error retrieving user dashboard data",
      error: error.message,
    });
  }
};
