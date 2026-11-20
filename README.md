# x402 example paywall

A small x402 seller on the Stellar test network, and the GitHub workflow that checks it with Wasit on every pull
request. It is practice material: testnet only, no real money, not a real service.

## What is in it

| Path | What it is |
| --- | --- |
| `server.mjs` | The seller. One paid route, `GET /paid`, answers `402 Payment Required` with a payment request. It refuses a request for a language it does not have (a header `x-quote-lang` other than `en`) with `400`. |
| `scripts/serve.mjs` | Starts the seller with a small local stand-in for the facilitator, so it runs with no internet access (for `npm run serve`). |
| `wasit.config.json` | Tells Wasit how to start the seller, where it listens, and which endpoint to check. |
| `.github/workflows/wasit.yml` | The workflow: install, start the seller, run the checks, comment on the pull request. |
| `project.json` | The seller's settings. The payee is the public address of a testnet account of ours that holds a testnet USDC trustline, so it can be paid. |

## What the workflow does

On every pull request, every push to `main` and every manual run (workflow_dispatch), one job named **Wasit**:

1. installs the seller with `npm ci`;
2. starts it inside the job with `npm start` (it uses the public testnet facilitator), and waits until it answers;
3. runs the read-only checks X402-01 to X402-05 against `GET /paid`. These check that an unpaid request is answered
   with `402`, that the payment header is there and decodes, that the required fields are present and that the
   network is a valid identifier. No payment is made and nothing is signed;
4. on a push to `main` and on a manual run only, runs the payment checks X402-06 to X402-11 on the Stellar test
   network, paying from a testnet account kept in the repository secret `WASIT_TESTNET_PAYER`. Each payment is
   at most $1.00 and a run at most $5.00; at this route's price of $0.005 a run signs at most $0.0225.
   X402-11 sends a valid payment with a request the seller must refuse, the `reject` case in `wasit.config.json`
   (a language it does not have), then reads the chain until that payment's authorization has expired, about
   five minutes at the default lifetime, to show it was never taken;
5. writes a summary and, on a pull request, one comment with the result and what changed since the last green run
   on `main`;
6. stops the seller and fails the job if any check failed.

On a pull request the payment checks are not run, and the key is not given to the job.

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
- There is no key, secret or token in the files of this repository. The payment checks read a testnet key from
  the repository secret `WASIT_TESTNET_PAYER`, given to the Wasit step only and only on a push to `main` or a manual
  run. It is a dedicated testnet account that holds no real funds.
- The workflow has `contents: read`, `pull-requests: write` and `actions: read`, and it does not use
  `pull_request_target`.
- The actions are pinned to full commit SHAs.

## License

MIT. See `LICENSE`.

Fork test of the Wasit run on a pull request.
