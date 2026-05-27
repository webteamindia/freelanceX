import prisma from "../prisma/client.js";
import { getPlatformFeePercent } from "../utils/payments.js";
import { executeSellerPayout, loadOrderForPayout } from "../services/payoutService.js";

const sevenDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

export const getAdminOverview = async (req, res, next) => {
  try {
    const since = sevenDaysAgo();

    const [
      users,
      activeUsers,
      inactiveUsers,
      admins,
      sellers,
      buyers,
      gigs,
      orders,
      completedOrders,
      openTickets,
      resolvedTickets,
      newUsersWeek,
      newOrdersWeek,
      sellersWithoutPaypal,
      heldPayouts,
      releasedPayouts,
      failedPayouts,
      revenueAgg,
      recentOrders,
      recentTickets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.count({ where: { gigs: { some: {} } } }),
      prisma.user.count({ where: { orders: { some: {} } } }),
      prisma.gig.count(),
      prisma.order.count(),
      prisma.order.count({ where: { isCompleted: true } }),
      prisma.supportTicket.count({ where: { status: "open" } }),
      prisma.supportTicket.count({ where: { status: "resolved" } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({
        where: {
          gigs: { some: {} },
          paypalEmail: null,
        },
      }),
      prisma.order.aggregate({
        where: { isCompleted: true, payoutStatus: "held" },
        _sum: { sellerEarningsAmount: true, platformFeeAmount: true, price: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { isCompleted: true, payoutStatus: "released" },
        _sum: { sellerEarningsAmount: true, platformFeeAmount: true, price: true },
        _count: { id: true },
      }),
      prisma.order.count({
        where: { isCompleted: true, payoutStatus: "failed" },
      }),
      prisma.order.aggregate({
        where: { isCompleted: true },
        _sum: {
          price: true,
          platformFeeAmount: true,
          sellerEarningsAmount: true,
        },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { email: true, username: true } },
          gig: {
            select: {
              title: true,
              createdBy: { select: { username: true, email: true } },
            },
          },
        },
      }),
      prisma.supportTicket.findMany({
        where: { status: "open" },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const grossRevenue = revenueAgg._sum.price || 0;
    const platformFees =
      revenueAgg._sum.platformFeeAmount ??
      grossRevenue * (getPlatformFeePercent() / 100);
    const sellerVolume = revenueAgg._sum.sellerEarningsAmount || 0;

    return res.status(200).json({
      overview: {
        users,
        activeUsers,
        inactiveUsers,
        admins,
        sellers,
        buyers,
        gigs,
        orders,
        completedOrders,
        pendingOrders: orders - completedOrders,
        openTickets,
        resolvedTickets,
        newUsersWeek,
        newOrdersWeek,
        sellersWithoutPaypal,
        failedPayouts,
        platformFeePercent: getPlatformFeePercent(),
        revenue: grossRevenue,
        platformFees,
        sellerVolume,
        payoutsHeld: {
          count: heldPayouts._count.id,
          sellerAmount: heldPayouts._sum.sellerEarningsAmount || 0,
          gross: heldPayouts._sum.price || 0,
        },
        payoutsReleased: {
          count: releasedPayouts._count.id,
          sellerAmount: releasedPayouts._sum.sellerEarningsAmount || 0,
          platformFees: releasedPayouts._sum.platformFeeAmount || 0,
        },
        recentOrders,
        recentTickets,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        paypalEmail: true,
        isAdmin: true,
        isActive: true,
        isProfileInfoSet: true,
        createdAt: true,
        _count: {
          select: {
            gigs: true,
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

export const getAdminUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        description: true,
        profileImage: true,
        paypalEmail: true,
        isAdmin: true,
        isActive: true,
        isProfileInfoSet: true,
        createdAt: true,
        gigs: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            price: true,
            isCompleted: true,
            payoutStatus: true,
            createdAt: true,
            gig: { select: { title: true } },
          },
        },
        _count: {
          select: {
            gigs: true,
            orders: true,
            reviews: true,
            favorites: true,
            messagesSent: true,
            messagesReceived: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be boolean" });
    }

    if (req.userId === userId) {
      return res.status(400).json({ message: "You cannot disable yourself" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    return res.status(200).json({ user, message: "User status updated" });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be boolean" });
    }

    if (req.userId === userId) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: { id: true, isAdmin: true },
    });

    return res.status(200).json({ user, message: "User role updated" });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: {
          select: { id: true, email: true, username: true, fullName: true },
        },
        gig: {
          select: {
            id: true,
            title: true,
            userId: true,
            price: true,
            category: true,
            createdBy: {
              select: {
                id: true,
                email: true,
                username: true,
                paypalEmail: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { isCompleted } = req.body;

    if (typeof isCompleted !== "boolean") {
      return res.status(400).json({ message: "isCompleted must be boolean" });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { isCompleted },
      select: { id: true, isCompleted: true },
    });

    return res.status(200).json({ order, message: "Order status updated" });
  } catch (err) {
    next(err);
  }
};

export const adminReleaseOrderPayout = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await loadOrderForPayout(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const result = await executeSellerPayout(order);

    if (!result.ok) {
      return res.status(result.alreadyReleased ? 200 : 502).json({
        message: result.error,
        payoutStatus: order.payoutStatus,
      });
    }

    return res.status(200).json({
      message: result.alreadyReleased
        ? "Payout was already released."
        : "Payout sent to seller.",
      order: result.order,
      batchId: result.batchId,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminGigs = async (req, res, next) => {
  try {
    const gigs = await prisma.gig.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            paypalEmail: true,
          },
        },
        _count: {
          select: { reviews: true, orders: true, favoritedBy: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return res.status(200).json({ gigs });
  } catch (err) {
    next(err);
  }
};

export const deleteGigAsAdmin = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    await prisma.gig.delete({ where: { id: gigId } });
    return res.status(200).json({ message: "Gig deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAdminSupportTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return res.status(200).json({ tickets });
  } catch (err) {
    next(err);
  }
};

export const resolveSupportTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["open", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      },
    });

    return res.status(200).json({ ticket, message: "Ticket updated" });
  } catch (err) {
    next(err);
  }
};
