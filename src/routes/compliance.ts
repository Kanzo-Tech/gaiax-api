import { Router } from "express";
import axios from "axios";
import { didToUrl } from "../utils/resolver";

const router = Router();

router.post("/", async (req, res) => {
  const { did } = req.body;
  if (!did) {
    return res.status(400).json({ error: "DID required" });
  }

  let participant = didToUrl(`${did}:credentials:participant.json`);
  participant = await fetch(participant).then((res) => res.json());
  let lrn = didToUrl(`${did}:credentials:lrn.json`);
  lrn = await fetch(lrn).then((res) => res.json());
  let terms = didToUrl(`${did}:credentials:terms.json`);
  terms = await fetch(terms).then((res) => res.json());

  const vp = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiablePresentation",
    verifiableCredential: [participant, lrn, terms],
  };

  try {
    const { data } = await axios.post(
      "https://compliance.lab.gaia-x.eu/v1/api/credential-offers",
      vp,
      { headers: { "Content-Type": "application/json" } },
    );
    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Error en Compliance", details: err.message });
  }
});

export default router;
