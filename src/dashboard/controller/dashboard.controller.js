import userModel from "../../auth/schema/auth.modal.js";
import Vendor from "../../vendor/schema/vendor.modal.js";

export const dashboard = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const getMonthlyData = async (Model) => {
      const data = await Model.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear, $lt: endOfYear },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((month, index) => {
        const found = data.find((d) => d._id === index + 1);
        return {
          month,
          count: found ? found.count : 0,
        };
      });
    };

    // Get all data in parallel
    const [totalUsers, totalVendors, recentUsers, userGrowth, vendorGrowth] = await Promise.all([
      userModel.countDocuments({}),
      Vendor.countDocuments({}),
      userModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("userName email phone createdAt"),
      getMonthlyData(userModel),
      getMonthlyData(Vendor),
    ]);

    // Calculate user and vendor ratio
    const total = totalUsers + totalVendors;
    const userRatio = total > 0 ? parseFloat(((totalUsers / total) * 100).toFixed(2)) : 0;
    const vendorRatio = total > 0 ? parseFloat(((totalVendors / total) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      error: false,
      message: "Dashboard data retrieved successfully",
      data: {
        totals: {
          users: totalUsers,
          vendors: totalVendors,
        },
        ratios: {
          userPercentage: userRatio,
          vendorPercentage: vendorRatio,
        },
        monthlyGrowth: {
          year,
          users: userGrowth,
          vendors: vendorGrowth,
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

