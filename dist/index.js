"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const lrn_1 = __importDefault(require("./routes/lrn"));
const participant_1 = __importDefault(require("./routes/participant"));
const terms_1 = __importDefault(require("./routes/terms"));
const compliance_1 = __importDefault(require("./routes/compliance"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: "2mb" }));
// Montar routers
app.use("/api/lrn", lrn_1.default);
app.use("/api/participant", participant_1.default);
app.use("/api/terms", terms_1.default);
app.use("/api/compliance", compliance_1.default);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
});
