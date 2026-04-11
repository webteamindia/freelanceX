import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import {
  ADMIN_GIGS_ROUTE,
  ADMIN_ORDERS_ROUTE,
  ADMIN_OVERVIEW_ROUTE,
  ADMIN_TICKETS_ROUTE,
  ADMIN_USERS_ROUTE,
} from "../../utils/constants";

const cardStyle = "bg-zinc-900/40 backdrop-blur-md border border-zinc-800 shadow-xl rounded-2xl p-6 flex flex-col justify-center items-center gap-1 transition-all duration-300 hover:bg-zinc-900/60 hover:border-zinc-700 hover:-translate-y-1";
const statTitleClass = "text-sm font-medium text-zinc-400 font-inter";
const statNumberClass = "text-4xl font-outfit font-extrabold text-primary drop-shadow-[0_0_12px_rgba(29,191,115,0.3)] mt-2";

const AdminPage = () => {
  const [cookies] = useCookies();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const authConfig = {
    headers: {
      Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "",
    },
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Could not load admin data. Ensure you are logged in as admin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.jwt]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `${ADMIN_USERS_ROUTE}/${userId}/status`,
        { isActive: !currentStatus },
        authConfig
      );
      await loadAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user status.");
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    try {
      await axios.patch(
        `${ADMIN_USERS_ROUTE}/${userId}/role`,
        { isAdmin: !currentRole },
        authConfig
      );
      await loadAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user role.");
    }
  };

  const openUserDetails = async (userId) => {
    try {
      const { data } = await axios.get(`${ADMIN_USERS_ROUTE}/${userId}`, authConfig);
      setSelectedUser(data.user);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load user details.");
    }
  };

  const updateOrderCompletion = async (orderId, isCompleted) => {
    try {
      await axios.patch(
        `${ADMIN_ORDERS_ROUTE}/${orderId}/status`,
        { isCompleted: !isCompleted },
        authConfig
      );
      await loadAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update order.");
    }
  };

  const deleteGig = async (gigId) => {
    try {
      await axios.delete(`${ADMIN_GIGS_ROUTE}/${gigId}`, authConfig);
      await loadAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete gig.");
    }
  };

  const setTicketStatus = async (ticketId, status) => {
    try {
      await axios.patch(
        `${ADMIN_TICKETS_ROUTE}/${ticketId}/status`,
        { status },
        authConfig
      );
      await loadAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update ticket.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-zinc-400">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-10 pb-20">
      <div className="max-w-[1600px] mx-auto w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-outfit text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-400 font-inter mt-1">
            Platform-wide overview for users, orders, and support operations.
          </p>
          {error && <p className="text-sm text-red-600 mt-2 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
        </div>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          <div className={cardStyle}>
            <p className={statTitleClass}>Users</p>
            <p className={statNumberClass}>{overview.users}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Sellers</p>
            <p className={statNumberClass}>{overview.sellers}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Buyers</p>
            <p className={statNumberClass}>{overview.buyers}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Gigs</p>
            <p className={statNumberClass}>{overview.gigs}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Orders</p>
            <p className={statNumberClass}>{overview.orders}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Completed</p>
            <p className={statNumberClass}>{overview.completedOrders}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Open Tickets</p>
            <p className={statNumberClass}>{overview.openTickets}</p>
          </div>
          <div className={cardStyle}>
            <p className={statTitleClass}>Revenue</p>
            <p className={statNumberClass}>${overview.revenue || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-zinc-900/80 border border-zinc-800 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="font-outfit font-semibold text-xl text-white tracking-wide">Users Administration</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm font-inter">
            <thead className="bg-zinc-950/80">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Email</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Username</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Role</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Gigs</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Orders</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-300 font-medium">{user.email}</td>
                  <td className="p-4 text-zinc-400">{user.username || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300">{user._count?.gigs || 0}</td>
                  <td className="p-4 text-zinc-300">{user._count?.orders || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="text-xs font-semibold px-3 py-1.5 border border-zinc-700 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
                        onClick={() => openUserDetails(user.id)}
                      >
                        Details
                      </button>
                      {!user.isAdmin && (
                        <button
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${user.isActive ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      <button
                        className="text-xs font-semibold px-3 py-1.5 border border-zinc-700 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
                        onClick={() => toggleUserRole(user.id, user.isAdmin)}
                      >
                        {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-zinc-900 border border-zinc-800 shadow rounded-2xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">User Details</h2>
            <button
              className="text-xs px-2 py-1 border rounded hover:bg-zinc-800/80"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
            <p>
              <span className="text-zinc-400">Email:</span> {selectedUser.email}
            </p>
            <p>
              <span className="text-zinc-400">Username:</span>{" "}
              {selectedUser.username || "-"}
            </p>
            <p>
              <span className="text-zinc-400">Role:</span>{" "}
              {selectedUser.isAdmin ? "Admin" : "User"}
            </p>
            <p>
              <span className="text-zinc-400">Status:</span>{" "}
              {selectedUser.isActive ? "Active" : "Inactive"}
            </p>
            <p>
              <span className="text-zinc-400">Gigs:</span>{" "}
              {selectedUser._count?.gigs || 0}
            </p>
            <p>
              <span className="text-zinc-400">Orders:</span>{" "}
              {selectedUser._count?.orders || 0}
            </p>
            <p>
              <span className="text-zinc-400">Reviews:</span>{" "}
              {selectedUser._count?.reviews || 0}
            </p>
            <p>
              <span className="text-zinc-400">Favorites:</span>{" "}
              {selectedUser._count?.favorites || 0}
            </p>
          </div>
        </div>
      )}

      <div className="bg-zinc-900/80 border border-zinc-800 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="font-outfit font-semibold text-xl text-white tracking-wide">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm font-inter">
            <thead className="bg-zinc-950/80">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Order ID</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Buyer</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Gig</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Price</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-400 font-mono text-xs">{order.id.slice(-6).toUpperCase()}</td>
                  <td className="p-4 text-zinc-300 font-medium">
                    {order.buyer?.username || order.buyer?.email || "-"}
                  </td>
                  <td className="p-4 text-zinc-300 max-w-[200px] truncate">{order.gig?.title || "-"}</td>
                  <td className="p-4 font-bold text-white">${order.price}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.isCompleted ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                      {order.isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      className="text-xs font-semibold px-3 py-1.5 border border-zinc-700 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
                      onClick={() =>
                        updateOrderCompletion(order.id, order.isCompleted)
                      }
                    >
                      Mark {order.isCompleted ? "In Progress" : "Completed"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="font-outfit font-semibold text-xl text-white tracking-wide">Gigs Moderation</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm font-inter">
            <thead className="bg-zinc-950/80">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Title</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Seller</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Price</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Orders</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Favorites</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {gigs.map((gig) => (
                <tr key={gig.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-300 font-medium max-w-[250px] truncate">{gig.title}</td>
                  <td className="p-4 text-zinc-400">
                    {gig.createdBy?.username || gig.createdBy?.email || "-"}
                  </td>
                  <td className="p-4 font-bold text-white">${gig.price}</td>
                  <td className="p-4 text-zinc-300">{gig._count?.orders || 0}</td>
                  <td className="p-4 text-zinc-300">{gig._count?.favoritedBy || 0}</td>
                  <td className="p-4">
                    <button
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      onClick={() => deleteGig(gig.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="font-outfit font-semibold text-xl text-white tracking-wide">Support Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm font-inter">
            <thead className="bg-zinc-950/80">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Email</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Subject</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Message</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-zinc-500 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-300 font-medium">{ticket.email}</td>
                  <td className="p-4 text-zinc-300 font-medium">{ticket.subject}</td>
                  <td className="p-4 text-zinc-400 max-w-xs truncate">{ticket.message}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ticket.status === 'open' ? 'bg-orange-500/10 text-orange-400' : 'bg-primary/10 text-primary'}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {ticket.status === "open" ? (
                      <button
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        onClick={() => setTicketStatus(ticket.id, "resolved")}
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        className="text-xs font-semibold px-3 py-1.5 border border-zinc-700 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
                        onClick={() => setTicketStatus(ticket.id, "open")}
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      </div>
    </div>
  );
};

export default AdminPage;

