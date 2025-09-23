import * as jose from "jose";

export async function signVC(vc: any, privateKeyPem: string, did: string) {
  const privateKey = await jose.importPKCS8(privateKeyPem, "EdDSA");

  const payload = new TextEncoder().encode(JSON.stringify(vc));
  const jws = await new jose.CompactSign(payload)
    .setProtectedHeader({ alg: "EdDSA" })
    .sign(privateKey);

  return {
    ...vc,
    proof: {
      type: "Ed25519Signature2020",
      created: new Date().toISOString(),
      verificationMethod: `${did}#ed25519-key-1`,
      proofPurpose: "assertionMethod",
      jws,
    },
  };
}
