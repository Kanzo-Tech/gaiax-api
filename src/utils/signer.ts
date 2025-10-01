import { importJWK } from "jose";
import { JsonWebSignature2020Signer } from "@gaia-x/json-web-signature-2020";

export const signCredential = async (
  verifiableCredential: any,
  jwk: any,
  did: string,
) => {
  const privateKey = await importJWK(jwk);

  const signer = new JsonWebSignature2020Signer({
    privateKey,
    privateKeyAlg: jwk.alg,
    verificationMethod: `${did}#JWK2020-RSA`,
  });

  return signer.sign(verifiableCredential);
};
