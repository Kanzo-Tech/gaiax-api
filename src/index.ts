import express from "express";
import bodyParser from "body-parser";
import lrnRoutes from "./routes/lrn";
import participantRoutes from "./routes/participant";
import termsRoutes from "./routes/terms";
import complianceRoutes from "./routes/compliance";

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));

// Montar routers
app.use("/api/lrn", lrnRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/compliance", complianceRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});
