import { Queue } from "bullmq";
import redis from "../config/redis.js";

const checkoutQueue = new Queue("checkoutQueue", {
  connection: redis
});

export default checkoutQueue;