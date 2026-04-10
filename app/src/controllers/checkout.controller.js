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


export const createCheckouts = async (req, res) => {
  await checkoutQueue.add("create", req.body);

  return res.status(202).json({
    success: true,
    message: "Checkout queued"
  });
};


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


export const editCheckout = async (req, res) => {
  const { id } = req.params;

  await checkoutQueue.add("put", {
    ...req.body,
    id
  });

  await redis.del(`checkout:${id}`);

  return res.status(202).json({
    success: true,
    message: "Checkout update queued"
  });
};

export const patchCheckout = async (req, res) => {
  const { id } = req.params;

  await checkoutQueue.add("patch", {
    ...req.body,
    id
  });

  await redis.del(`checkout:${id}`);

  return res.status(202).json({
    success: true,
    message: "Checkout patch queued"
  });
};