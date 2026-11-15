# x402 example paywall

A small x402 seller on the Stellar test network, and the GitHub workflow that checks it with Wasit on every pull
request. It is practice material: testnet only, no real money, not a real service.

## What is in it

| Path | What it is |
| --- | --- |
| `server.mjs` | The seller. One paid route, `GET /paid`, answers `402 Payment Required` with a payment request. |
| `scripts/serve.mjs` | Starts the seller with a small local stand-in for the facilitator, so it runs with no internet access. |
| `wasit.config.json` | Tells Wasit how to start the seller, where it listens, and which endpoint to check. |
| `.github/workflows/wasit.yml` | The workflow: install, start the seller, run the checks, comment on the pull request. |
| `project.json` | The seller's settings. The payee is a public address; its secret key was discarded on purpose. |

## What the workflow does

On every pull request and every push to `main`, one job named **Wasit**:

1. installs the seller with `npm ci`;
2. starts it inside the job, and waits until it answers;
3. runs the read-only checks X402-01 to X402-05 against `GET /paid`. These check that an unpaid request is answered
   with `402`, that the payment header is there and decodes, that the required fields are present and that the
   network is a valid identifier. No payment is made and nothing is signed;
4. writes a summary and, on a pull request, one comment with the result and what changed since `main`;
5. stops the seller and fails the job if any check failed.

The payment checks (X402-06 to X402-10) are not part of this workflow.

## Run the same checks on your computer

You need Node.js 22 or newer.

```
npm ci
npm run check -- --offline
```

`npm run check -- --offline` starts the seller with the local stand-in for the facilitator, runs Wasit's read-only checks
and writes `report.md` and `report.json`, the same way the workflow does.

## The `broken-paywall` branch

`main` conforms: all five checks pass. The `broken-paywall` branch adds one block to `server.mjs`, "show friendlier
network names in the challenge", which rewrites `stellar:testnet` as `stellar-testnet`. A client expects the standard
CAIP-2 form (`namespace:reference`), so X402-05 fails and the pull request check turns red. The comment shows the
expected and the actual value and what to change. Fix the block (or delete it) and the check turns green again.

## Safety

- The seller listens on `127.0.0.1` only and uses the Stellar test network.
- There is no key, secret or token in this repository, and the workflow needs none.
- The workflow has `contents: read`, `pull-requests: write` and `actions: read`, and it does not use
  `pull_request_target`.
- The actions are pinned to full commit SHAs.

## License

MIT. See `LICENSE`.
