"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signVC = void 0;
exports.formatPemKey = formatPemKey;
exports.getPossiblePrivateKeyAlgs = getPossiblePrivateKeyAlgs;
exports.getPrivateKeyAlg = getPrivateKeyAlg;
const jose_1 = require("jose");
const json_web_signature_2020_1 = require("@gaia-x/json-web-signature-2020");
const jsrsasign_1 = require("jsrsasign");
/**
 * Normaliza una clave privada PKCS#8 que puede venir pegada en una sola línea
 * a formato PEM válido.
 */
function formatPemKey(singleLineKey) {
    let base64Key = singleLineKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s+/g, "");
    const wrapped = base64Key.match(/.{1,64}/g)?.join("\n");
    return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----`;
}
function getPossiblePrivateKeyAlgs(privateKey) {
    const pem = formatPemKey(privateKey);
    const key = jsrsasign_1.KEYUTIL.getKey(pem);
    if (key instanceof jsrsasign_1.KJUR.crypto.ECDSA) {
        return ["ES256", "ES384", "ES256K"];
    }
    else if (key instanceof jsrsasign_1.RSAKey) {
        return ["PS256"];
    }
    return ["EdDSA", "EdDSA256K"];
}
async function getPrivateKeyAlg(privateKey) {
    const pem = formatPemKey(privateKey);
    for (const alg of getPossiblePrivateKeyAlgs(pem)) {
        try {
            await (0, jose_1.importPKCS8)(pem, alg);
            return alg;
        }
        catch {
            // continuar intentando
        }
    }
    throw new Error("No valid private key algorithm found");
}
/**
 * Firma la Verifiable Credential y devuelve el **VC firmado** completo
 * (incluyendo el objeto `proof` con el JWS).
 */
const signVC = async (verifiableCredential, pemPrivateKey, verificationMethod) => {
    // Normalizar clave
    const pem = formatPemKey(pemPrivateKey);
    const alg = await getPrivateKeyAlg(pem);
    // Importar clave privada en jose
    const privateKey = await (0, jose_1.importPKCS8)(pem, alg);
    // Crear signer para la suite JsonWebSignature2020
    const signer = new json_web_signature_2020_1.JsonWebSignature2020Signer({
        privateKey,
        privateKeyAlg: alg,
        verificationMethod,
    });
    return signer.sign(verifiableCredential);
};
exports.signVC = signVC;
