import express from "express";
const app = express();
import { dealRoutes } from "./modules/deals/deal.routes";
import { sellerRoutes } from "./modules/seller/seller.routes";
import { userRoutes } from "./modules/user/user.routes";

app.use("/deal", dealRoutes);
app.use("/seller", sellerRoutes);
app.use("/user", userRoutes);

app.use((err: Error, req: any, res: any, next: any) => {
  res.status(500);
  res.json({
    message: err.message || "Something went wrong",
    // stackTrace: err.stackTrace,
    error: true,
  });
});

export { app };
