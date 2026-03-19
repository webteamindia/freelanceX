import React from "react";
import { useRouter } from "next/router";

const SellerProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white shadow-sm rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
              {username ? username[0].toUpperCase() : "S"}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {username || "Seller"}
              </h1>
              <p className="text-sm text-gray-500">
                Professional freelancer on ffiver
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-[#1DBF73] border border-[#1DBF73] rounded-md hover:bg-[#1DBF73] hover:text-white transition">
              Contact seller
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">
              Save
            </button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                About
              </h2>
              <p className="text-sm text-gray-600">
                This seller hasn&apos;t added a full profile yet. As ffiver
                grows, you&apos;ll see more detailed bios, experience, and
                skills here.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Gigs by this seller
              </h2>
              <p className="text-sm text-gray-500">
                Gig cards will appear here once connected to the backend.
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Seller details
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>From: —</li>
                <li>Member since: —</li>
                <li>Avg. response time: —</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Ratings &amp; reviews
              </h3>
              <p className="text-sm text-gray-500">
                Reviews and ratings will appear here.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;

