import { Router } from "express";
import { signVC } from "../utils/signer";
import { hashVC } from "../utils/hash";
import { didToUrl } from "../utils/resolver";
import { fetchCredential } from "../utils/fetch";

const router = Router();

router.post("/", async (req, res) => {
  const { did, privateKey, legalName, country } = req.body;

  if (!did || !privateKey || !legalName || !country) {
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
      id: `${did}#Participant`,
      issuer: did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: didToUrl(`${did}#subject`),
        type: "gx:LegalParticipant",
        "gx:legalName": legalName,
        "gx:legalRegistrationNumber": {
          id: didToUrl(`${did}:credentials:lrn.json#subject`),
        },
        "gx:headquarterAddress": { "gx:countrySubdivisionCode": country },
        "gx:legalAddress": { "gx:countrySubdivisionCode": country },
        "gx-terms-and-conditions:gaiaxTermsAndConditions": termsHash,
      },
    };

    const signed = await signVC(participantVC, privateKey, did);
    return res.json(signed);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error signing Participant VerifiableCredential",
      details: err.message,
    });
  }
});

export default router;
