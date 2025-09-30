import { Router } from "express";
import axios from "axios";
import { didToUrl } from "../utils/resolver";

const router = Router();

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
    id: didToUrl(`${did}:credentials:lrn.json`),
    "gx:vatID": vatId,
  };

  try {
    const { data } = await axios.post(
      "https://registration.lab.gaia-x.eu/v1-staging/registrationNumberVC",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error in notary LRN",
      details: err.message,
    });
  }
});

export default router;
