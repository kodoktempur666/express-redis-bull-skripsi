import { Worker } from "bullmq";
import redis from "../config/redis.js";
import client from "../config/grpc.js";

const worker = new Worker(
  "checkoutQueue",
  async (job) => {
    return new Promise((resolve, reject) => {
      
      if (job.name === "create") {
        client.CreateCheckout(job.data, callback(resolve, reject));
      } 
      
      else if (job.name === "put") {
        client.EditCheckout(job.data, callback(resolve, reject));
      } 
      
      else if (job.name === "patch") {
        client.PatchCheckout(job.data, callback(resolve, reject));
      } 
      
      else {
        reject(new Error("Unknown job type"));
      }

    });
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

function callback(resolve, reject) {
  return (err, res) => {
    if (err) reject(err);
    else resolve(res);
  };
}

worker.on("completed", (job) => {
  console.log(`Job ${job.name} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.name} failed:`, err.message);
});

export default worker;