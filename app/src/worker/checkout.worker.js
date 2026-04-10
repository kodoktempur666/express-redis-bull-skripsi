import { Worker } from "bullmq";
import redis from "../config/redis.js";
import client from "../config/grpc.js";

const worker = new Worker(
  "checkoutQueue",
  async job => {

    return new Promise((resolve, reject) => {

      client.CreateCheckout(job.data, (err, res) => {

        if (err) reject(err);
        else resolve(res);

      });

    });

  },
  {
    connection: redis,
    concurrency: 10
  }
);

worker.on("completed", () => {
  console.log("Job completed");
});

worker.on("failed", err => {
  console.error(err);
});
