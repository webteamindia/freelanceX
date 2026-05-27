import prisma from "../prisma/client.js";

export const getSellerData = async (req, res, next) => {
  try {
    if (req.userId) {
      const gigs = await prisma.gig.count({ where: { userId: req.userId } });
      const {
        _count: { id: orders },
      } = await prisma.order.aggregate({
        where: {
          isCompleted: true,
          gig: {
            createdBy: {
              id: req.userId,
            },
          },
        },
        _count: {
          id: true,
        },
      });
      const unreadMessages = await prisma.messages.count({
        where: {
          receiverId: req.userId,
          isRead: false,
        },
      });

      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisYear = new Date(today.getFullYear(), 0, 1);

      const sellerOrderFilter = {
        gig: { createdBy: { id: req.userId } },
        isCompleted: true,
      };

      const releasedFilter = {
        ...sellerOrderFilter,
        payoutStatus: "released",
      };

      const pendingFilter = {
        ...sellerOrderFilter,
        payoutStatus: "held",
      };

      const sumReleased = async (dateFilter) =>
        prisma.order.aggregate({
          where: { ...releasedFilter, ...dateFilter },
          _sum: { sellerEarningsAmount: true },
        });

      const sumPending = () =>
        prisma.order.aggregate({
          where: pendingFilter,
          _sum: { sellerEarningsAmount: true },
        });

      const { _sum: { sellerEarningsAmount: revenue } } = await sumReleased({
        createdAt: { gte: thisYear },
      });

      const { _sum: { sellerEarningsAmount: dailyRevenue } } = await sumReleased({
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });

      const { _sum: { sellerEarningsAmount: monthlyRevenue } } =
        await sumReleased({
          createdAt: { gte: thisMonth },
        });

      const { _sum: { sellerEarningsAmount: pendingPayouts } } =
        await sumPending();

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { paypalEmail: true },
      });

      return res.status(200).json({
        dashboardData: {
          orders,
          gigs,
          unreadMessages,
          dailyRevenue: dailyRevenue ?? 0,
          monthlyRevenue: monthlyRevenue ?? 0,
          revenue: revenue ?? 0,
          pendingPayouts: pendingPayouts ?? 0,
          paypalEmail: user?.paypalEmail || null,
          hasPayoutEmail: Boolean(user?.paypalEmail),
        },
      });
    }
    return res.status(400).send("User id is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
