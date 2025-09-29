"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signer_1 = require("../utils/signer");
const resolver_1 = require("../utils/resolver");
const router = (0, express_1.Router)();
const TERMS_AND_CONDITIONS = "The PARTICIPANT signing the Self-Description agrees as follows:\n- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n\nThe keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD).";
router.post("/", async (req, res) => {
    let { did, privateKey } = req.body;
    if (!did || !privateKey) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const vc = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/security/suites/jws-2020/v1",
            "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
        ],
        id: (0, resolver_1.didToUrl)(`${did}:credentials:terms.json`),
        type: ["VerifiableCredential", "TermsAndConditionsCredential"],
        issuer: did,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
            id: `${did}#subject`,
            type: "gx:GaiaXTermsAndConditions",
            "gx:termsAndConditions": TERMS_AND_CONDITIONS,
        },
    };
    try {
        const signed = await (0, signer_1.signVC)(vc, privateKey, did);
        return res.json(signed);
    }
    catch (err) {
        return res.status(500).json({
            error: "Error signing Terms VerifiableCredential",
            details: err.message,
        });
    }
});
exports.default = router;
