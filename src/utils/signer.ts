import * as jose from "jose";

const jsonld = require("jsonld");
const { canonize } = require("rdf-canonize");

function formatPemKey(singleLineKey: string): string {
  let base64Key = singleLineKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, ""); // quitar espacios/saltos de línea

  const wrapped = base64Key.match(/.{1,64}/g)?.join("\n");

  return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----`;
}

/**
 * El JWS con detached payload se "compacta" quitando la parte intermedia
 * Ejemplo: header.payload.signature → header..signature
 */
function compactToken(token: string): string {
  const parts = token.split(".");
  return `${parts[0]}..${parts[2]}`;
}

export async function signVC(
  credential: any,
  privateKeyPem: string,
  did: string,
) {
  // sacar el proof previo
  const { proof, ...credentialWithoutProof } = credential;

  // objeto proof inicial
  const proofObject = {
    type: "JsonWebSignature2020",
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    verificationMethod: `${did}#JWK2020-RSA`,
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
  };

  // documento que se firmará sin el proof previo
  const documentToSign = {
    ...credentialWithoutProof,
    proof: proofObject,
  };

  // Normalización URDNA2015 → N-Quads
  const rdfDataset = await jsonld.toRDF(documentToSign);
  const canonicalizedDoc = await canonize(rdfDataset, {
    algorithm: "URDNA2015",
    format: "application/n-quads",
  });

  // importar clave privada
  const pem = formatPemKey(privateKeyPem);
  const key = await jose.importPKCS8(pem, "PS256");

  // Firmar con payload "detached" (b64: false)
  const jws = await new jose.CompactSign(
    new TextEncoder().encode(canonicalizedDoc),
  )
    .setProtectedHeader({
      alg: "PS256", // también puedes usar RS256 si la clave lo requiere
      b64: false,
      crit: ["b64"],
    })
    .sign(key);

  // Compactar como en Python: quitar payload
  const detachedJws = compactToken(jws);

  return {
    ...credentialWithoutProof,
    proof: {
      ...proofObject,
      jws: detachedJws,
    },
  };
}
