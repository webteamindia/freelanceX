import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import {
  FiAlertCircle,
  FiBox,
  FiDollarSign,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiTrendingUp,
  FiCreditCard,
} from "react-icons/fi";
import { HiOutlineSupport } from "react-icons/hi";
import { toast } from "react-toastify";
import AdminStatCard from "../../components/admin/AdminStatCard";
import {
  filterByQuery,
  formatDate,
  formatMoney,
  PAYOUT_BADGE,
  shortId,
} from "../../components/admin/adminUtils";
import { useStateProvider } from "../../context/StateContext";
import {
  ADMIN_GIGS_ROUTE,
  ADMIN_ORDERS_ROUTE,
  ADMIN_OVERVIEW_ROUTE,
  ADMIN_TICKETS_ROUTE,
  ADMIN_USERS_ROUTE,
  adminReleasePayoutRoute,
} from "../../utils/constants";

const TABS = [
  { id: "overview", label: "Overview", icon: FiTrendingUp },
  { id: "users", label: "Users", icon: FiUsers },
  { id: "orders", label: "Orders & payouts", icon: FiCreditCard },
  { id: "gigs", label: "Gigs", icon: FiBox },
  { id: "support", label: "Support", icon: HiOutlineSupport },
];

const TableShell = ({ title, description, children, action }) => (
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-zinc-800">
      <div>
        <h2 className="font-outfit text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const EmptyRow = ({ colSpan, message }) => (
  <tr>
    <td colSpan={colSpan} className="p-12 text-center text-zinc-500 text-sm">
      {message}
    </td>
  </tr>
);

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
  >
    {children}
  </span>
);

const AdminPage = () => {
  const router = useRouter();
  const [{ userInfo }] = useStateProvider();
  const [cookies] = useCookies();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "" },
    }),
    [cookies.jwt]
  );

  const loadAdminData = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [overviewRes, usersRes, ordersRes, ticketsRes, gigsRes] =
        await Promise.all([
          axios.get(ADMIN_OVERVIEW_ROUTE, authConfig),
          axios.get(ADMIN_USERS_ROUTE, authConfig),
          axios.get(ADMIN_ORDERS_ROUTE, authConfig),
          axios.get(ADMIN_TICKETS_ROUTE, authConfig),
          axios.get(ADMIN_GIGS_ROUTE, authConfig),
        ]);

      setOverview(overviewRes.data.overview);
      setUsers(usersRes.data.users || []);
      setOrders(ordersRes.data.orders || []);
      setTickets(ticketsRes.data.tickets || []);
      setGigs(gigsRes.data.gigs || []);
      if (silent) toast.success("Dashboard refreshed");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Could not load admin data. Ensure you are logged in as admin.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authConfig]);

  useEffect(() => {
    if (userInfo && !userInfo.isAdmin) router.replace("/");
  }, [userInfo, router]);

  useEffect(() => {
    if (!userInfo?.isAdmin) return;
    loadAdminData();
  }, [userInfo?.isAdmin, loadAdminData]);

  const filteredUsers = useMemo(
    () =>
      filterByQuery(users, search, [
        "email",
        "username",
        "fullName",
        "paypalEmail",
      ]),
    [users, search]
  );

  const filteredOrders = useMemo(() => {
    let list = filterByQuery(orders, search, [
      "id",
      "buyer.email",
      "buyer.username",
      "gig.title",
      "gig.createdBy.email",
      "gig.createdBy.username",
    ]);
    if (orderFilter === "held") {
      list = list.filter((o) => o.isCompleted && (o.payoutStatus || "held") === "held");
    } else if (orderFilter === "released") {
      list = list.filter((o) => o.payoutStatus === "released");
    } else if (orderFilter === "failed") {
      list = list.filter((o) => o.payoutStatus === "failed");
    } else if (orderFilter === "pending") {
      list = list.filter((o) => !o.isCompleted);
    }
    return list;
  }, [orders, search, orderFilter]);

  const filteredGigs = useMemo(
    () =>
      filterByQuery(gigs, search, [
        "title",
        "category",
        "createdBy.email",
        "createdBy.username",
      ]),
    [gigs, search]
  );

  const filteredTickets = useMemo(() => {
    let list = filterByQuery(tickets, search, ["email", "subject", "message"]);
    if (ticketFilter !== "all") {
      list = list.filter((t) => t.status === ticketFilter);
    }
    return list;
  }, [tickets, search, ticketFilter]);

  const toggleUserStatus = async (userId, currentStatus) => {
    if (
      !window.confirm(
        `${currentStatus ? "Deactivate" : "Activate"} this user?`
      )
    )
      return;
    try {
      await axios.patch(
        `${ADMIN_USERS_ROUTE}/${userId}/status`,
        { isActive: !currentStatus },
        authConfig
      );
      toast.success("User status updated");
      await loadAdminData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user.");
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    if (
      !window.confirm(
        `${currentRole ? "Revoke admin from" : "Grant admin to"} this user?`
      )
    )
      return;
    try {
      await axios.patch(
        `${ADMIN_USERS_ROUTE}/${userId}/role`,
        { isAdmin: !currentRole },
        authConfig
      );
      toast.success("User role updated");
      await loadAdminData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role.");
    }
  };

  const openUserDetails = async (userId) => {
    try {
      const { data } = await axios.get(
        `${ADMIN_USERS_ROUTE}/${userId}`,
        authConfig
      );
      setSelectedUser(data.user);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load user.");
    }
  };

  const adminReleasePayout = async (orderId) => {
    if (
      !window.confirm(
        "Force-release payout to seller via PayPal? Use only when the buyer approved offline or payout failed."
      )
    )
      return;
    try {
      const { data } = await axios.post(
        adminReleasePayoutRoute(orderId),
        {},
        authConfig
      );
      toast.success(data.message || "Payout released");
      await loadAdminData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payout failed");
    }
  };

  const deleteGig = async (gigId, title) => {
    if (!window.confirm(`Delete gig "${title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${ADMIN_GIGS_ROUTE}/${gigId}`, authConfig);
      toast.success("Gig deleted");
      await loadAdminData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete gig.");
    }
  };

  const setTicketStatus = async (ticketId, status) => {
    try {
      await axios.patch(
        `${ADMIN_TICKETS_ROUTE}/${ticketId}/status`,
        { status },
        authConfig
      );
      toast.success("Ticket updated");
      await loadAdminData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update ticket.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-background/90 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-widest">
              Platform control
            </p>
            <h1 className="text-2xl md:text-3xl font-outfit font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Signed in as {userInfo?.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] md:min-w-[280px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                placeholder="Search current tab…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => loadAdminData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <nav className="max-w-[1600px] mx-auto px-4 md:px-8 flex gap-1 overflow-x-auto pb-3 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setSearch("");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === id
                  ? "bg-primary text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Icon />
              {label}
              {id === "support" && overview?.openTickets > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                  {overview.openTickets}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-8 pb-24">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
            <FiAlertCircle className="shrink-0 mt-0.5 text-lg" />
            {error}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && overview && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard
                label="Total users"
                value={overview.users}
                sub={`+${overview.newUsersWeek} this week · ${overview.activeUsers} active`}
                icon={FiUsers}
              />
              <AdminStatCard
                label="Gross volume"
                value={formatMoney(overview.revenue)}
                sub={`${overview.completedOrders} paid orders`}
                icon={FiDollarSign}
                accent="text-white"
              />
              <AdminStatCard
                label="Platform fees"
                value={formatMoney(overview.platformFees)}
                sub={`${overview.platformFeePercent}% fee on completed orders`}
                icon={FiTrendingUp}
              />
              <AdminStatCard
                label="Held for sellers"
                value={formatMoney(overview.payoutsHeld?.sellerAmount)}
                sub={`${overview.payoutsHeld?.count} awaiting buyer approval`}
                icon={FiCreditCard}
                alert={overview.payoutsHeld?.count > 0}
                onClick={() => {
                  setTab("orders");
                  setOrderFilter("held");
                }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                ["Sellers", overview.sellers],
                ["Buyers", overview.buyers],
                ["Gigs", overview.gigs],
                ["Open tickets", overview.openTickets, true],
                ["Failed payouts", overview.failedPayouts, overview.failedPayouts > 0],
                ["Sellers w/o PayPal", overview.sellersWithoutPaypal, overview.sellersWithoutPaypal > 0],
              ].map(([label, val, alert]) => (
                <div
                  key={label}
                  className={`rounded-xl border p-4 ${
                    alert
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-zinc-800 bg-zinc-900/40"
                  }`}
                >
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="text-xl font-semibold text-white mt-1">{val}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <TableShell title="Recent orders" description="Latest activity across the marketplace">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase text-zinc-500 bg-zinc-950/50">
                    <tr>
                      <th className="text-left p-3">Gig</th>
                      <th className="text-left p-3">Buyer</th>
                      <th className="text-left p-3">Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(overview.recentOrders || []).length === 0 ? (
                      <EmptyRow colSpan={3} message="No orders yet" />
                    ) : (
                      overview.recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-zinc-300 max-w-[180px] truncate">
                            {o.gig?.title || "—"}
                          </td>
                          <td className="p-3 text-zinc-400">
                            {o.buyer?.username || o.buyer?.email}
                          </td>
                          <td className="p-3">
                            <Badge
                              className={
                                PAYOUT_BADGE[o.payoutStatus || "held"] ||
                                PAYOUT_BADGE.held
                              }
                            >
                              {o.isCompleted
                                ? o.payoutStatus || "held"
                                : "unpaid"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableShell>

              <TableShell title="Open support" description="Needs attention">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase text-zinc-500 bg-zinc-950/50">
                    <tr>
                      <th className="text-left p-3">From</th>
                      <th className="text-left p-3">Subject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(overview.recentTickets || []).length === 0 ? (
                      <EmptyRow colSpan={2} message="No open tickets" />
                    ) : (
                      overview.recentTickets.map((t) => (
                        <tr
                          key={t.id}
                          className="hover:bg-zinc-800/30 cursor-pointer"
                          onClick={() => setTab("support")}
                        >
                          <td className="p-3 text-zinc-400">{t.email}</td>
                          <td className="p-3 text-zinc-300">{t.subject}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableShell>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <TableShell
            title="Users"
            description={`${filteredUsers.length} of ${users.length} users`}
          >
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase text-zinc-500 bg-zinc-950/50">
                <tr>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">PayPal</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Stats</th>
                  <th className="text-left p-3">Joined</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredUsers.length === 0 ? (
                  <EmptyRow colSpan={6} message="No users match your search" />
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30">
                      <td className="p-3">
                        <p className="text-zinc-200 font-medium">{user.email}</p>
                        <p className="text-zinc-500 text-xs">
                          @{user.username || "—"} · {user.fullName || "No name"}
                        </p>
                      </td>
                      <td className="p-3">
                        {user.paypalEmail ? (
                          <span className="text-emerald-400 text-xs">
                            {user.paypalEmail}
                          </span>
                        ) : (
                          <span className="text-amber-500 text-xs">Not set</span>
                        )}
                      </td>
                      <td className="p-3 space-y-1">
                        <Badge
                          className={
                            user.isAdmin
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </Badge>
                        <Badge
                          className={
                            user.isActive
                              ? "bg-primary/15 text-primary border-primary/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3 text-zinc-400 text-xs">
                        {user._count?.gigs || 0} gigs · {user._count?.orders || 0}{" "}
                        orders · {user._count?.reviews || 0} reviews
                      </td>
                      <td className="p-3 text-zinc-500 text-xs whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => openUserDetails(user.id)}
                          >
                            View
                          </button>
                          {!user.isAdmin && (
                            <button
                              type="button"
                              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => toggleUserRole(user.id, user.isAdmin)}
                          >
                            {user.isAdmin ? "Revoke admin" : "Make admin"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["held", "Held"],
                ["released", "Released"],
                ["failed", "Failed"],
                ["pending", "Unpaid"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOrderFilter(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    orderFilter === id
                      ? "bg-primary text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <TableShell
              title="Orders & payouts"
              description="Payment capture, platform fee, and seller release status"
            >
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-zinc-500 bg-zinc-950/50">
                  <tr>
                    <th className="text-left p-3">Order</th>
                    <th className="text-left p-3">Buyer → Seller</th>
                    <th className="text-left p-3">Amounts</th>
                    <th className="text-left p-3">Payment</th>
                    <th className="text-left p-3">Payout</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredOrders.length === 0 ? (
                    <EmptyRow colSpan={6} message="No orders match filters" />
                  ) : (
                    filteredOrders.map((order) => {
                      const ps = order.payoutStatus || "held";
                      const canRelease =
                        order.isCompleted &&
                        (ps === "held" || ps === "failed");
                      return (
                        <tr key={order.id} className="hover:bg-zinc-800/30 align-top">
                          <td className="p-3">
                            <p className="font-mono text-xs text-zinc-500">
                              {shortId(order.id)}
                            </p>
                            <p className="text-zinc-300 text-xs mt-1 max-w-[140px] truncate">
                              {order.gig?.title}
                            </p>
                            <p className="text-zinc-600 text-xs">
                              {formatDate(order.createdAt)}
                            </p>
                          </td>
                          <td className="p-3 text-xs">
                            <p className="text-zinc-400">
                              B: {order.buyer?.email}
                            </p>
                            <p className="text-zinc-500 mt-1">
                              S: {order.gig?.createdBy?.email || "—"}
                            </p>
                            {!order.gig?.createdBy?.paypalEmail && (
                              <p className="text-amber-500 mt-1">No PayPal</p>
                            )}
                          </td>
                          <td className="p-3 text-xs text-zinc-300">
                            <p>Gross {formatMoney(order.price)}</p>
                            <p className="text-zinc-500">
                              Fee {formatMoney(order.platformFeeAmount)}
                            </p>
                            <p className="text-primary">
                              Seller {formatMoney(order.sellerEarningsAmount)}
                            </p>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={
                                order.isCompleted
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : "bg-orange-500/15 text-orange-300 border-orange-500/30"
                              }
                            >
                              {order.isCompleted ? "Paid" : "Unpaid"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={PAYOUT_BADGE[ps] || PAYOUT_BADGE.held}>
                              {ps}
                            </Badge>
                            {order.payoutError && (
                              <p className="text-red-400 text-xs mt-1 max-w-[160px]">
                                {order.payoutError}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            {canRelease && (
                              <button
                                type="button"
                                onClick={() => adminReleasePayout(order.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                              >
                                Force release
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableShell>
          </div>
        )}

        {/* GIGS */}
        {tab === "gigs" && (
          <TableShell
            title="Gigs"
            description={`${filteredGigs.length} listings`}
          >
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase text-zinc-500 bg-zinc-950/50">
                <tr>
                  <th className="text-left p-3">Gig</th>
                  <th className="text-left p-3">Seller</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Engagement</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredGigs.length === 0 ? (
                  <EmptyRow colSpan={6} message="No gigs found" />
                ) : (
                  filteredGigs.map((gig) => (
                    <tr key={gig.id} className="hover:bg-zinc-800/30">
                      <td className="p-3">
                        <p className="text-zinc-200 font-medium max-w-[220px] truncate">
                          {gig.title}
                        </p>
                        <p className="text-zinc-500 text-xs">{gig.category}</p>
                      </td>
                      <td className="p-3 text-xs text-zinc-400">
                        {gig.createdBy?.username || gig.createdBy?.email}
                        {!gig.createdBy?.paypalEmail && (
                          <span className="block text-amber-500">No PayPal</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {formatMoney(gig.price)}
                      </td>
                      <td className="p-3 text-xs text-zinc-400">
                        {gig._count?.orders || 0} orders ·{" "}
                        {gig._count?.favoritedBy || 0} favs ·{" "}
                        {gig._count?.reviews || 0} reviews
                      </td>
                      <td className="p-3 text-xs text-zinc-500">
                        {formatDate(gig.createdAt)}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          onClick={() => deleteGig(gig.id, gig.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        )}

        {/* SUPPORT */}
        {tab === "support" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {["all", "open", "resolved"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTicketFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                    ticketFilter === f
                      ? "bg-primary text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <TableShell title="Support tickets">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-zinc-500 bg-zinc-950/50">
                  <tr>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Message</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredTickets.length === 0 ? (
                    <EmptyRow colSpan={6} message="No tickets" />
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-zinc-800/30 align-top">
                        <td className="p-3 text-zinc-300">{ticket.email}</td>
                        <td className="p-3 text-zinc-200 font-medium">
                          {ticket.subject}
                        </td>
                        <td className="p-3 text-zinc-400 max-w-xs text-xs leading-relaxed">
                          {ticket.message}
                        </td>
                        <td className="p-3">
                          <Badge
                            className={
                              ticket.status === "open"
                                ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
                                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-zinc-500 whitespace-nowrap">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            onClick={() =>
                              setTicketStatus(
                                ticket.id,
                                ticket.status === "open" ? "resolved" : "open"
                              )
                            }
                          >
                            {ticket.status === "open" ? "Resolve" : "Reopen"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableShell>
          </div>
        )}
      </div>

      {/* User detail drawer */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedUser(null)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-5 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-outfit font-semibold text-white">
                  {selectedUser.fullName || selectedUser.username || "User"}
                </h2>
                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-zinc-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-zinc-900 p-3 border border-zinc-800">
                  <p className="text-zinc-500 text-xs">Role</p>
                  <p className="text-white mt-1">
                    {selectedUser.isAdmin ? "Admin" : "User"}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900 p-3 border border-zinc-800">
                  <p className="text-zinc-500 text-xs">Status</p>
                  <p className="text-white mt-1">
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl bg-zinc-900 p-3 border border-zinc-800">
                  <p className="text-zinc-500 text-xs">PayPal payout email</p>
                  <p className="text-white mt-1">
                    {selectedUser.paypalEmail || (
                      <span className="text-amber-500">Not configured</span>
                    )}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl bg-zinc-900 p-3 border border-zinc-800">
                  <p className="text-zinc-500 text-xs">Bio</p>
                  <p className="text-zinc-300 mt-1 text-sm">
                    {selectedUser.description || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-zinc-500 mb-2">Activity</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    ["Gigs", selectedUser._count?.gigs],
                    ["Orders", selectedUser._count?.orders],
                    ["Reviews", selectedUser._count?.reviews],
                    ["Favorites", selectedUser._count?.favorites],
                    ["Sent msgs", selectedUser._count?.messagesSent],
                    ["Received", selectedUser._count?.messagesReceived],
                  ].map(([l, v]) => (
                    <span
                      key={l}
                      className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300"
                    >
                      {l}: {v || 0}
                    </span>
                  ))}
                </div>
              </div>

              {selectedUser.gigs?.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-zinc-500 mb-2">
                    Recent gigs
                  </p>
                  <ul className="space-y-2">
                    {selectedUser.gigs.map((g) => (
                      <li
                        key={g.id}
                        className="text-sm p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between"
                      >
                        <span className="text-zinc-300 truncate pr-2">
                          {g.title}
                        </span>
                        <span className="text-primary shrink-0">
                          {formatMoney(g.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedUser.orders?.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-zinc-500 mb-2">
                    Recent purchases
                  </p>
                  <ul className="space-y-2">
                    {selectedUser.orders.map((o) => (
                      <li
                        key={o.id}
                        className="text-sm p-3 rounded-xl bg-zinc-900 border border-zinc-800"
                      >
                        <p className="text-zinc-300">{o.gig?.title}</p>
                        <p className="text-zinc-500 text-xs mt-1">
                          {formatMoney(o.price)} · {o.payoutStatus || "—"} ·{" "}
                          {formatDate(o.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
