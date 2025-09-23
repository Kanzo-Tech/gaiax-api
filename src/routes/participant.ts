import { Router } from "express";
import { signVC } from "../utils/signer";
import { hashVC } from "../utils/hash";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/", async (req, res) => {
  const { did, privateKeyPem, legalName, country, lrnDid, termsVC } = req.body;

  if (!did || !privateKeyPem || !legalName || !country || !lrnDid || !termsVC) {
    return res.status(400).json({
      error:
        "faltan campos: did, privateKeyPem, legalName, country, lrnDid, termsVC",
    });
  }

  try {
    const termsHash = hashVC(termsVC);

    const participantVC = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
      ],
      type: ["VerifiableCredential"],
      id: `urn:uuid:${uuidv4()}`,
      issuer: did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `${did}#subject`,
        type: "gx:LegalParticipant",
        "gx:legalName": legalName,

        "gx:legalRegistrationNumber": { id: lrnDid + "#subject" },
        "gx:headquarterAddress": { "gx:countrySubdivisionCode": country },
        "gx:legalAddress": { "gx:countrySubdivisionCode": country },
        "gx-terms-and-conditions:gaiaxTermsAndConditions": termsHash,
      },
    };

    const signed = await signVC(participantVC, privateKeyPem, did);
    return res.json(signed);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error firmando Participant VC",
      details: err.message,
    });
  }
});

export default router;
