import { importPKCS8 } from "jose";
import { JsonWebSignature2020Signer } from "@gaia-x/json-web-signature-2020";
import { KEYUTIL, KJUR, RSAKey } from "jsrsasign";

export function formatPemKey(singleLineKey: string): string {
  let base64Key = singleLineKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const wrapped = base64Key.match(/.{1,64}/g)?.join("\n");
  return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----`;
}

export function getPossiblePrivateKeyAlgs(privateKey: string): string[] {
  const pem = formatPemKey(privateKey);
  const key = KEYUTIL.getKey(pem);

  if (key instanceof KJUR.crypto.ECDSA) {
    return ["ES256", "ES384", "ES256K"];
  } else if (key instanceof RSAKey) {
    return ["PS256"];
  }
  return ["EdDSA", "EdDSA256K"];
}

export async function getPrivateKeyAlg(privateKey: string): Promise<string> {
  const pem = formatPemKey(privateKey);
  for (const alg of getPossiblePrivateKeyAlgs(pem)) {
    try {
      await importPKCS8(pem, alg);
      return alg;
    } catch {
      // continuar intentando
    }
  }
  throw new Error("No valid private key algorithm found");
}

export const signVerifiableCredential = async (
  verifiableCredential: any,
  pemPrivateKey: string,
  did: string,
) => {
  const pem = formatPemKey(pemPrivateKey);
  const alg = await getPrivateKeyAlg(pem);

  const privateKey = await importPKCS8(pem, alg);

  const signer = new JsonWebSignature2020Signer({
    privateKey,
    privateKeyAlg: alg,
    verificationMethod: `${did}#JWK2020-RSA`,
  });

  return signer.sign(verifiableCredential);
};
