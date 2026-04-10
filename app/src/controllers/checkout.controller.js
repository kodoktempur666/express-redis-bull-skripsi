import {
  getCheckout,

} from "../models/checkout.model.js";

import { createQueue,editQueue,patchQueue } from "../queue/checkout.queue.js";
import redis from "../config/redis.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};


export const createCheckouts = async (req, res) => {
  await createQueue.add("create", req.body);

  res.status(202).json({
    success: true,
    message: "Create checkout queued",
  });
};


export const getCheckouts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `checkout:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return handleResponse(res, 200, "From cache", JSON.parse(cached));
    }

    const data = await getCheckout(id);

    if (data) {
      await redis.set(cacheKey, JSON.stringify(data), "EX", 60);
    }

    handleResponse(res, 200, "From database", data);
  } catch (err) {
    next(err);
  }
};


export const editCheckouts = async (req, res) => {
  const { id } = req.params;

  await editQueue.add("put", {
    ...req.body,
    id
  });

  return res.status(202).json({
    success: true,
    message: "Checkout update queued"
  });
};

export const patchCheckouts = async (req, res) => {
  const { id } = req.params;

  await patchQueue.add("patch", {
    ...req.body,
    id
  });

  await redis.del(`checkout:${id}`);

  return res.status(202).json({
    success: true,
    message: "Checkout patch queued"
  });
};