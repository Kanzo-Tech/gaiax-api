import { Router } from "express";
import { signCredential } from "../utils/signer";
import { hashVC } from "../utils/hash";
import { didToUrl } from "../utils/resolver";
import { fetchCredential } from "../utils/fetch";

const router = Router();

router.post("/", async (req, res) => {
  const { did, jwk, legalName, country } = req.body;

  if (!did || !jwk || !legalName || !country) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const termsURL = didToUrl(`${did}:credentials:terms.json`);
    const terms = await fetchCredential(termsURL);
    const termsHash = hashVC(terms);

    const participantVC = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
      ],
      type: ["VerifiableCredential"],
      id: didToUrl(`${did}:credentials:participant.json`),
      issuer: did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: didToUrl(`${did}:credentials:participant.json#subject`),
        type: "gx:LegalParticipant",
        "gx:legalName": legalName,
        "gx:legalRegistrationNumber": {
          id: didToUrl(`${did}:credentials:lrn.json`),
        },
        "gx:headquarterAddress": { "gx:countrySubdivisionCode": country },
        "gx:legalAddress": { "gx:countrySubdivisionCode": country },
        "gx-terms-and-conditions:gaiaxTermsAndConditions": termsHash,
      },
    };

    const signed = await signCredential(participantVC, jwk, did);
    return res.json(signed);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error signing Participant VerifiableCredential",
      details: err.message,
    });
  }
});

export default router;
