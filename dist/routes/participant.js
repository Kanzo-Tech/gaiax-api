"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signer_1 = require("../utils/signer");
const hash_1 = require("../utils/hash");
const resolver_1 = require("../utils/resolver");
const fetch_1 = require("../utils/fetch");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const { did, privateKey, legalName, country } = req.body;
    if (!did || !privateKey || !legalName || !country) {
        return res.status(400).json({
            error: "Missing required fields",
        });
    }
    try {
        const termsURL = (0, resolver_1.didToUrl)(`${did}:credentials:terms.json`);
        const terms = await (0, fetch_1.fetchCredential)(termsURL);
        const termsHash = (0, hash_1.hashVC)(terms);
        const participantVC = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://w3id.org/security/suites/jws-2020/v1",
                "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
            ],
            type: ["VerifiableCredential"],
            id: `${did}#Participant`,
            issuer: did,
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: (0, resolver_1.didToUrl)(`${did}#subject`),
                type: "gx:LegalParticipant",
                "gx:legalName": legalName,
                "gx:legalRegistrationNumber": {
                    id: (0, resolver_1.didToUrl)(`${did}:credentials:lrn.json#subject`),
                },
                "gx:headquarterAddress": { "gx:countrySubdivisionCode": country },
                "gx:legalAddress": { "gx:countrySubdivisionCode": country },
                "gx-terms-and-conditions:gaiaxTermsAndConditions": termsHash,
            },
        };
        const signed = await (0, signer_1.signVC)(participantVC, privateKey, did);
        return res.json(signed);
    }
    catch (err) {
        return res.status(500).json({
            error: "Error signing Participant VerifiableCredential",
            details: err.message,
        });
    }
});
exports.default = router;
