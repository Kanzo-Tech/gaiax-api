import * as jose from "jose";

export async function signVC(vc: any, privateKeyPem: string, did: string) {
  const key = await jose.importPKCS8(privateKeyPem, "RS256");

  const payload = JSON.stringify(vc);
  const jws = await new jose.CompactSign(new TextEncoder().encode(payload))
    .setProtectedHeader({ alg: "RS256" })
    .sign(key);

  return {
    ...vc,
    proof: {
      type: "JsonWebSignature2020",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: `${did}#JWK2020-RSA`,
      jws,
    },
  };
}
