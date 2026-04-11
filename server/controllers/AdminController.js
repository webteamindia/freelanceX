import prisma from "../prisma/client.js";

export const getAdminOverview = async (req, res, next) => {
  try {
    const [users, sellers, buyers, gigs, orders, completedOrders, openTickets] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { gigs: { some: {} } } }),
        prisma.user.count({ where: { orders: { some: {} } } }),
        prisma.gig.count(),
        prisma.order.count(),
        prisma.order.count({ where: { isCompleted: true } }),
        prisma.supportTicket.count({ where: { status: "open" } }),
      ]);

    const revenueResult = await prisma.order.aggregate({
      where: { isCompleted: true },
      _sum: { price: true },
    });

    return res.status(200).json({
      overview: {
        users,
        sellers,
        buyers,
        gigs,
        orders,
        completedOrders,
        openTickets,
        revenue: revenueResult?._sum?.price || 0,
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
        isAdmin: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            gigs: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
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
        isAdmin: true,
        isActive: true,
        isProfileInfoSet: true,
        createdAt: true,
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
      select: {
        id: true,
        isActive: true,
      },
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
      select: {
        id: true,
        isAdmin: true,
      },
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
          select: { id: true, title: true, userId: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
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
      select: {
        id: true,
        isCompleted: true,
      },
    });

    return res.status(200).json({ order, message: "Order status updated" });
  } catch (err) {
    next(err);
  }
};

export const getAdminGigs = async (req, res, next) => {
  try {
    const gigs = await prisma.gig.findMany({
      include: {
        createdBy: {
          select: { id: true, email: true, username: true, fullName: true },
        },
        _count: {
          select: { reviews: true, orders: true, favoritedBy: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.status(200).json({ gigs });
  } catch (err) {
    next(err);
  }
};

export const deleteGigAsAdmin = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    await prisma.gig.delete({
      where: { id: gigId },
    });
    return res.status(200).json({ message: "Gig deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAdminSupportTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
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

