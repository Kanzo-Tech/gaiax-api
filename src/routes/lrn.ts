import { Router } from "express";
import axios from "axios";

const router = Router();

router.post("/", async (req, res) => {
  const { vatId, lrnDid } = req.body;
  if (!vatId || !lrnDid) {
    return res.status(400).json({ error: "faltan campos: vatId, lrnDid" });
  }

  const url =
    "https://registrationnumber.notary.lab.gaia-x.eu/v1/registrationNumberVC";

  const payload = {
    "@context": [
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/participant",
    ],
    type: "gx:legalRegistrationNumber",
    id: lrnDid,
    "gx:vatID": vatId,
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error en notary LRN",
      details: err.message,
    });
  }
});

export default router;
