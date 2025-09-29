"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const resolver_1 = require("../utils/resolver");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const { did, vatId } = req.body;
    if (!did || !vatId) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const payload = {
        "@context": [
            "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/participant",
        ],
        type: "gx:legalRegistrationNumber",
        id: (0, resolver_1.didToUrl)(`${did}:credentials:lrn.json`),
        "gx:vatID": vatId,
    };
    try {
        const { data } = await axios_1.default.post("https://registrationnumber.notary.lab.gaia-x.eu/v1/registrationNumberVC", payload, {
            headers: { "Content-Type": "application/json" },
        });
        return res.json(data);
    }
    catch (err) {
        return res.status(500).json({
            error: "Error in notary LRN",
            details: err.message,
        });
    }
});
exports.default = router;
