import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import bcrypt from "bcrypt";
import connectdb from "./config/mongodb.js";
import User from "./models/User.js";
import RentRecord from "./models/RentRecord.js";
import { startCronJob } from "./utils/cronJob.js";
import authRoute from "./routes/authRoute.js";
import superadminRoute from "./routes/superadminRoute.js";
import landlordRoute from "./routes/landlordRoute.js";
import tenantRoute from "./routes/tenantRoute.js";

dotenv.config({ path: "./.env.local" });

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
} else {
  app.set("trust proxy", "loopback");
}

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/status",
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Hardcoded alongside WEBSITE_URL rather than relying on that single env var
// alone — a browser's Origin header is the exact scheme+host it navigated
// to, so "kanyamaestates.com" and "www.kanyamaestates.com" (or http vs
// https) are different origins to CORS even though they're "the same site"
// to a person. Getting WEBSITE_URL's value slightly out of sync with
// whichever variant a visitor actually lands on silently blocks every
// request from the live site with no server-side error to point at.
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  // Capacitor's default WebView origins (Android + iOS native app)
  "https://localhost",
  "capacitor://localhost",
  "https://kanyamaestates.com",
  "https://www.kanyamaestates.com",
  process.env.WEBSITE_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header (server-to-server calls, curl, health checks) — allow.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`[CORS] Rejected request from unrecognized origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoute);
app.use("/api/admin", superadminRoute);
app.use("/api/landlord", landlordRoute);
app.use("/api/tenant", tenantRoute);

app.get("/status", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV, uptime: process.uptime() });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

process.on("unhandledRejection", (err) => { console.error("UNHANDLED REJECTION:", err); process.exit(1); });
process.on("uncaughtException", (err) => { console.error("UNCAUGHT EXCEPTION:", err); process.exit(1); });
process.on("SIGTERM", () => process.exit(0));

const PORT = process.env.PORT || 4000;

connectdb().then(async () => {
  try {
    const exists = await User.findOne({ role: "superadmin" });
    if (!exists) {
      const hashed = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 12);
      await User.create({
        name: "Superadmin",
        email: process.env.SUPERADMIN_EMAIL,
        password: hashed,
        role: "superadmin",
      });
      console.log("✅ Superadmin seeded");
    }
  } catch (err) {
    console.error("Superadmin seed error:", err.message);
  }

  try {
    // The old unique index was {tenant, month} — a rent payment and a
    // deposit payment logged for the same tenant in the same month used to
    // collide and silently overwrite each other. Now that RentRecord keys
    // on {tenant, month, category}, sync the actual index on the
    // collection so existing databases (which still have the old one)
    // pick up the fix without a manual migration step.
    await RentRecord.syncIndexes();
  } catch (err) {
    console.error("RentRecord index sync error:", err.message);
  }

  startCronJob();

  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
}).catch((err) => {
  console.error("Failed to connect to database:", err.message);
  process.exit(1);
});

export default app;
