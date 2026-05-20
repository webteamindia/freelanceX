import Link from "next/link";
import { useRouter } from "next/router";

export default function PaymentFailedPage() {
  const router = useRouter();
  const { orderID } = router.query;

  return (
    <div className="h-[80vh] flex items-center px-6 md:px-20 pt-20 flex-col text-center">
      <h1 className="text-2xl md:text-4xl font-semibold">Payment failed</h1>
      <p className="text-zinc-400 mt-4 max-w-2xl">
        We could not complete this payment. Please try again with PayPal or use a different method.
      </p>
      {orderID ? (
        <p className="text-zinc-500 mt-2 text-sm">Order reference: {orderID}</p>
      ) : null}
      <div className="mt-8 flex gap-3">
        <Link
          href="/search"
          className="px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          Browse gigs
        </Link>
        <Link
          href="/buyer/orders"
          className="px-4 py-2 bg-primary text-black rounded-lg font-medium"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}
