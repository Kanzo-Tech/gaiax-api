export function didToUrl(did: string): string {
  if (!did.startsWith("did:web:")) throw new Error("Invalid did:web");
  const rest = did.replace("did:web:", "");
  const [domain, ...path] = rest.split(":");
  return `https://${domain}/${path.join("/")}`;
}
