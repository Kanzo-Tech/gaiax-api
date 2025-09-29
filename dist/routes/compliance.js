"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const resolver_1 = require("../utils/resolver");
const fetch_1 = require("../utils/fetch");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const { did } = req.body;
    if (!did) {
        return res.status(400).json({ error: "DID required" });
    }
    try {
        const participantUrl = (0, resolver_1.didToUrl)(`${did}:credentials:participant.json`);
        const lrnUrl = (0, resolver_1.didToUrl)(`${did}:credentials:lrn.json`);
        const termsUrl = (0, resolver_1.didToUrl)(`${did}:credentials:terms.json`);
        const [participant, lrn, terms] = await Promise.all([
            (0, fetch_1.fetchCredential)(participantUrl),
            (0, fetch_1.fetchCredential)(lrnUrl),
            (0, fetch_1.fetchCredential)(termsUrl),
        ]);
        const vp = {
            "@context": "https://www.w3.org/2018/credentials/v1",
            type: "VerifiablePresentation",
            verifiableCredential: [participant, terms, lrn],
        };
        const { data } = await axios_1.default.post("https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers", vp, { headers: { "Content-Type": "application/json" } });
        return res.json(data);
    }
    catch (err) {
        console.error("Compliance error:", err);
        return res.status(500).json({
            error: "Error processing credentials",
            details: err.message,
        });
    }
});
exports.default = router;
