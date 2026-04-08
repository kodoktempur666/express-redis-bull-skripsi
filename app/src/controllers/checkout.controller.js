import {
  getCheckout,
  editCheckout,
  patchCheckout,
} from "../models/checkout.model.js";

import checkoutQueue from "../queue/checkout.queue.js";
import connection from "../config/redis.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

// ✅ CREATE → QUEUE (BullMQ)
export const createCheckouts = async (req, res, next) => {
  const { name, amount, item } = req.body;

  try {
    const job = await checkoutQueue.add("createCheckout", {
      name,
      amount,
      item,
    });

    handleResponse(res, 202, "Checkout is being processed", {
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET → CACHE
export const getCheckouts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `checkout:${id}`;

    const cached = await connection.get(cacheKey);
    if (cached) {
      return handleResponse(res, 200, "From cache", JSON.parse(cached));
    }

    const data = await getCheckout(id);

    if (data) {
      await connection.set(cacheKey, JSON.stringify(data), "EX", 60);
    }

    handleResponse(res, 200, "From database", data);
  } catch (err) {
    next(err);
  }
};

// ✅ PUT → DIRECT + INVALIDATE CACHE
export const editCheckouts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, amount, item } = req.body;

    const updatedCheckout = await editCheckout(id, name, amount, item);

    await connection.del(`checkout:${id}`);

    handleResponse(res, 200, "Checkout updated", updatedCheckout);
  } catch (error) {
    next(error);
  }
};

// ✅ PATCH → DIRECT + INVALIDATE CACHE
export const patchCheckouts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, amount, item } = req.body;

    const patchedCheckout = await patchCheckout(
      id,
      name ?? null,
      amount ?? null,
      item ?? null
    );

    await connection.del(`checkout:${id}`);

    handleResponse(res, 200, "Checkout patched", patchedCheckout);
  } catch (error) {
    next(error);
  }
};