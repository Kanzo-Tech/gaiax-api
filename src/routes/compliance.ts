import { Router } from "express";
import axios from "axios";
import { didToUrl } from "../utils/resolver";
import { fetchCredential } from "../utils/fetch";

const router = Router();

router.post("/", async (req, res) => {
  const { did } = req.body;
  if (!did) {
    return res.status(400).json({ error: "DID required" });
  }

  try {
    const participantUrl = didToUrl(`${did}:credentials:participant.json`);
    const lrnUrl = didToUrl(`${did}:credentials:lrn.json`);
    const termsUrl = didToUrl(`${did}:credentials:terms.json`);

    const [participant, lrn, terms] = await Promise.all([
      fetchCredential(participantUrl),
      fetchCredential(lrnUrl),
      fetchCredential(termsUrl),
    ]);

    const vp = {
      "@context": "https://www.w3.org/2018/credentials/v1",
      type: "VerifiablePresentation",
      verifiableCredential: [participant, terms, lrn],
    };

    const { data } = await axios.post(
      "https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers",
      vp,
      { headers: { "Content-Type": "application/json" } },
    );

    return res.json(data);
  } catch (err: any) {
    console.error("Compliance error:", err);
    return res.status(500).json({
      error: "Error processing credentials",
      details: err.message,
    });
  }
});

export default router;
