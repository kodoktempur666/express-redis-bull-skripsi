import pool from "../config/db.js";

export default {
  async CreateCheckout(call, callback) {
    try {
      const { name, amount, item } = call.request;

      const result = await pool.query(
        `INSERT INTO checkouts(name, amount, item)
         VALUES ($1,$2,$3)
         RETURNING *`,
        [name, amount, item],
      );

      callback(null, result.rows[0]);
    } catch (err) {
      callback(err);
    }
  },

  
};
