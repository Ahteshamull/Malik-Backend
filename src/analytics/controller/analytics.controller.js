import Visited from "../../service/schema/visited.modal.js";
import Favorite from "../../service/schema/favorite.modal.js";
import SearchLog from "../schema/searchLog.modal.js";
import Service from "../../service/schema/service.modal.js";
import User from "../../auth/schema/auth.modal.js";

export const getAnalytics = async (req, res) => {
  try {
    // 1. Age Groups
    const ageGroupsRaw = await User.aggregate([
      { $match: { ageRange: { $ne: null } } },
      { $group: { _id: "$ageRange", count: { $sum: 1 } } },
    ]);
    const ageGroups = ageGroupsRaw.map((a) => ({
      label: a._id,
      value: a.count,
    }));

    // 2. Top Countries
    const topCountriesRaw = await User.aggregate([
      { $match: { country: { $ne: null }, country: { $ne: "" } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    
    const topCountriesTotal = topCountriesRaw.reduce((acc, curr) => acc + curr.count, 0);
    const topCountries = topCountriesRaw.map((c) => ({
      country: c._id,
      value: topCountriesTotal > 0 ? Math.round((c.count / topCountriesTotal) * 100) : 0,
      count: c.count
    }));

    // 3. Most Clicked Categories
    const mostClickedCategoriesRaw = await Visited.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "visitedService",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $lookup: {
          from: "cetagories", // matching the ref name spelling
          localField: "service.cetagory",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          clicks: { $sum: 1 },
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: 5 },
    ]);

    const totalClicks = mostClickedCategoriesRaw.reduce((sum, item) => sum + item.clicks, 0);
    const mostClickedCategories = mostClickedCategoriesRaw.map((c) => ({
      label: c._id,
      value: totalClicks > 0 ? `${Math.round((c.clicks / totalClicks) * 100)}%` : "0%",
      count: c.clicks,
    }));

    // 4. Monthly Views (For line chart)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const monthlyViewsRaw = await Visited.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyViews = months.map((month, index) => {
      const found = monthlyViewsRaw.find((m) => m._id === index + 1);
      return { month, count: found ? found.count : 0 };
    });

    // 5. Top Searches
    const topSearchesRaw = await SearchLog.aggregate([
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topSearches = topSearchesRaw.map((s) => ({
      keyword: s._id,
      count: s.count,
    }));

    // 6. Overall Totals
    const totals = {
      views: await Visited.countDocuments(),
      favorites: await Favorite.countDocuments(),
      searches: await SearchLog.countDocuments(),
    };

    // 7. Performance by Listing (Top Services)
    const performanceByListing = await Visited.aggregate([
      {
        $group: {
          _id: "$visitedService",
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          name: "$service.name",
          views: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        ageGroups,
        topCountries,
        mostClickedCategories,
        monthlyViews,
        topSearches,
        totals,
        performanceByListing,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving analytics data",
      error: error.message,
    });
  }
};
