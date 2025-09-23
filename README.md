# 🌐 Gaia‑X Credential API

API REST en **Node.js (Express + TypeScript)** para asistir en la generación de credenciales **Gaia‑X** y envío al servicio oficial de **Compliance**.

Endpoints:

- **/api/lrn** → Solicita un Legal Registration Number VC al notary Gaia‑X
- **/api/terms** → Genera un Terms VC firmado localmente
- **/api/participant** → Genera un Participant VC (referencia LRN y hash de Terms)
- **/api/compliance** → Empaqueta todos los VCs en una VP y la envía a Compliance

---

## 🚀 Despliegue con Docker Compose

### 1. Levantar servicio
```bash
docker compose up -d
```

La API quedará corriendo en: http://localhost:3000`


## 🔑 Generar claves ED25519

En local, antes de hacer peticiones al API:

```bash
openssl genpkey -algorithm ED25519 -out ed25519-private.pem
openssl pkey -in ed25519-private.pem -pubout -out ed25519-public.pem
```

El contenido de `ed25519-private.pem` lo pasarás en el campo `privateKeyPem`.

---

## 📌 Endpoints y ejemplos de uso

### 1. Obtener Legal Registration Number VC

```bash
curl -X POST http://localhost:3000/api/lrn \
  -H "Content-Type: application/json" \
  -d '{
    "vatId": "BE0762747721",
    "lrnDid": "did:web:identity.kanzo.tech:users:alice:lrn.json"
  }'
```

Devuelve un **LRN VC** emitido por el notary de Gaia‑X.
El `id` es un **DID Web** resoluble, que debe corresponder a un recurso accesible en tu dominio público

### 2. Generar Terms VC

```bash
curl -X POST http://localhost:3000/api/terms \
  -H "Content-Type: application/json" \
  -d '{
    "did": "did:web:identity.kanzo.tech:users:alice",
    "privateKeyPem": "-----BEGIN PRIVATE KEY-----\n..."
  }'
```

### 3. Generar Participant VC

```bash
curl -X POST http://localhost:3000/api/participant \
  -H "Content-Type: application/json" \
  -d '{
    "did": "did:web:identity.kanzo.tech:users:alice",
    "privateKeyPem": "-----BEGIN PRIVATE KEY-----\n...",
    "legalName": "MyCompany S.A.",
    "country": "ES",
    "lrnDid": "did:web:identity.kanzo.tech:users:alice:lrn.json",
    "termsVC": { ... Terms VC firmado ... }
  }'
```

### 4. Enviar a Compliance

```bash
curl -X POST http://localhost:3000/api/compliance \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": [
      { ... Terms VC firmado ... },
      { ... Participant VC firmado ... },
      { ... LRN VC del notary ... }
    ]
  }'
```
