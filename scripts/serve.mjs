// Starts the seller for Wasit's read-only checks, with no internet needed.
//
// An x402 seller asks its facilitator what it supports before it can issue any 402. This script starts the small
// local stand-in from scripts/facilitator.mjs (it answers only GET /supported), points the seller at it, and then
// starts the seller. The stand-in cannot verify or settle a payment, so this is for the unpaid challenge checks
// only (X402-01 to X402-05): no payment is made and nothing is signed.
//
//   npm run serve          the seller on http://127.0.0.1:4402/paid, with the stand-in facilitator
//   npm start              the seller alone, with the public testnet facilitator (needs the internet)
import { startStubFacilitator } from "./facilitator.mjs";

const stub = await startStubFacilitator();
process.env.FACILITATOR_URL = stub.url;
await import("../server.mjs");
