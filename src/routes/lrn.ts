import { Router } from "express";
import axios from "axios";
import { didToUrl } from "../utils/resolver";

const router = Router();

router.post("/", async (req, res) => {
  const { vatId, did } = req.body;
  if (!did || !vatId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const vcid = didToUrl(`${did}:credentials:lrn.json`);
  const url = `https://registrationnumber.notary.lab.gaia-x.eu/v1-staging/registrationNumberVC?vcid=${vcid}#subject`;
  const payload = {
    "@context": [
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/participant",
    ],
    type: "gx:legalRegistrationNumber",
    id: vcid,
    "gx:vatID": vatId,
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error in notary LRN",
      details: err.message,
    });
  }
});

export default router;
