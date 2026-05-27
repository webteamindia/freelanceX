import axios from "axios";
import { ORDER_SUCCESS } from "./constants";

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 800;

/**
 * Confirm PayPal capture on the server with retries (handles transient network errors).
 */
export async function confirmOrderWithRetry(orderID, jwt) {
  let lastError;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      await axios.put(
        ORDER_SUCCESS,
        { orderID },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      return { ok: true };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DELAY_MS * (attempt + 1))
        );
      }
    }
  }

  return { ok: false, error: lastError };
}
