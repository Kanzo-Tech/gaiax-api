"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.didToUrl = didToUrl;
function didToUrl(did) {
    if (!did.startsWith("did:web:"))
        throw new Error("Invalid did:web");
    const rest = did.replace("did:web:", "");
    const [domain, ...path] = rest.split(":");
    return `https://${domain}/${path.join("/")}`;
}
