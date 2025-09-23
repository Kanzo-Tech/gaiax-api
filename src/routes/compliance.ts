import { Router } from "express";
import axios from "axios";

const router = Router();

router.post("/", async (req, res) => {
  const { credentials } = req.body;
  if (!credentials || !Array.isArray(credentials)) {
    return res
      .status(400)
      .json({ error: "credentials[] requerido con [Terms, Participant, LRN]" });
  }

  const vp = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiablePresentation",
    verifiableCredential: credentials,
  };

  try {
    const { data } = await axios.post(
      "https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers",
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
