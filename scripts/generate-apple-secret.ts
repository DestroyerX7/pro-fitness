import { config } from "dotenv";
import { importPKCS8, SignJWT } from "jose";

config({ quiet: true });

async function main() {
  const key = await importPKCS8(process.env.APPLE_PRIVATE_KEY!, "ES256");
  const now = Math.floor(Date.now() / 1000);

  const secret = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);

  console.log(secret);
}

main();
