# Portfolio analytics setup

The implementation is deliberately minimal:

- `worker.mjs` — Cloudflare Worker endpoints: `POST /visit`, `POST /heartbeat`, `GET /pixel`
- `schema.sql` — D1 table and indexes
- `wrangler.jsonc` — optional CLI configuration; dashboard setup does not require Wrangler
- `../assets/js/analytics.js` — browser client, kept separate from the main site logic

The dependency-free Python reader and its credentials are intentionally stored
outside this public repository in a private local folder.

Do not add the GitHub Pages domain to Cloudflare and do not change DNS. This
system only needs a free `workers.dev` endpoint.

Deployed Worker: `https://naadir-portfolio-analytics.naadir-duglas.workers.dev`

## 1. Create the Worker

1. In Cloudflare, open **Compute** and then **Workers & Pages** (some accounts
   show **Workers**).
2. Select **Create application** or **Create app**.
3. Select **Create Worker**. If the dashboard presents templates, choose the
   basic **Hello World** Worker.
4. Name it `naadir-portfolio-analytics`.
5. Select **Deploy**.
6. If this is the account's first Worker, Cloudflare may ask you to choose a
   `workers.dev` subdomain. Choose a stable name; it becomes part of the URL.
7. Copy the final URL, which should resemble:
   `https://naadir-portfolio-analytics.YOUR-SUBDOMAIN.workers.dev`

Stay on the Workers Free plan. A payment card is not required for this setup.

## 2. Create D1 and its table

1. Open **Storage & databases** > **D1 SQL database**.
2. Select **Create database**.
3. Name it `naadir-portfolio-analytics-db`.
4. Leave data location on automatic, or select **Western Europe** if a location
   hint is offered.
5. Select **Create**.
6. Open the database and copy its database ID from **Settings**. It is a UUID.
7. Open the database's **Console**.
8. Paste the complete contents of `schema.sql` and select **Execute**.
9. Open **Tables** and confirm that `visits` exists.

## 3. Bind D1 to the Worker

1. Return to **Compute** > **Workers & Pages** and open
   `naadir-portfolio-analytics`.
2. Open **Settings** > **Bindings**. Some dashboard variants place this under
   **Settings** > **Variables** > **D1 Database Bindings**.
3. Select **Add binding** > **D1 database**.
4. Set the variable/binding name to exactly `DB`.
5. Select `naadir-portfolio-analytics-db` as the database.
6. Save the binding and deploy the resulting Worker version if prompted.

## 4. Install the Worker code

1. Open the Worker and select **Edit code** (`</>`).
2. Replace the entire Hello World script with the complete contents of
   `worker.mjs`.
3. Select **Deploy**.
4. Open the root Worker URL. It should return:

   ```json
   {"service":"portfolio-analytics","status":"ok"}
   ```

## 5. Test all Worker routes

In PowerShell, replace the example URL with the real Worker URL:

```powershell
$workerUrl = 'https://naadir-portfolio-analytics.YOUR-SUBDOMAIN.workers.dev'
$headers = @{ Origin = 'https://naadir-dev-portfolio.github.io' }

$visit = Invoke-RestMethod `
  -Method Post `
  -Uri "$workerUrl/visit" `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"page":"/manual-js-test"}'

$visit

$heartbeatBody = @{
  id = $visit.id
  active_seconds = 15
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$workerUrl/heartbeat" `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body $heartbeatBody
```

Then open this URL in a browser, again using the real Worker URL:

```text
https://YOUR-WORKER.workers.dev/pixel?page=/manual-pixel-test
```

The page is a transparent one-pixel GIF, so a blank browser view is expected.

In the D1 Console, run:

```sql
SELECT id, ip_address, country, page, started_at, last_seen_at,
       active_seconds, tracking_method
FROM visits
ORDER BY started_at DESC
LIMIT 10;
```

Expected results:

- `/manual-js-test` has `tracking_method = javascript` and
  `active_seconds = 15`.
- `/manual-pixel-test` has `tracking_method = pixel` and
  `active_seconds = 0`.

## 6. Create the local read-only token

1. Open **Manage account** > **Account API tokens**.
2. Select **Create Token**.
3. In the current permission-template screen, select **Start from scratch**.
   This is the custom-token builder in the current dashboard.
4. Name it `local-portfolio-analytics-readonly`.
5. In the permission policy, select **Account** > **D1** > **Read**.
6. Limit resources to this specific Cloudflare account.
7. Optionally add an expiry date. Do not add D1 Write, Workers Write, DNS, or
   billing permissions.
8. Leave client-IP filtering empty unless the computer has a deliberately
   fixed public IP address.
9. Continue to the summary, create the token, and copy it immediately. The
   secret is shown once.

Never paste the token into the Worker, `analytics.js`, GitHub, or a chat.

## 7. Configure and use the external Python client

Keep `analytics.py`, `.env.example`, and the private `.env` together in a
standalone folder outside this repository. Fill the private `.env` with:

```text
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_DATABASE_ID=...
CLOUDFLARE_D1_TOKEN=...
```

To copy the account ID in the current dashboard, press **Ctrl+K**, search for
**Copy account ID**, and select it. Never place the private `.env` in this
repository.

Open PowerShell in the standalone folder and run:

```powershell
python analytics.py recent
python analytics.py today
python analytics.py countries
python analytics.py live
```

IP addresses are masked in terminal output by default. Use
`python analytics.py --full-ip recent` only when the complete stored address is
actually needed.

## 8. Final website integration

`index.html` loads the separate `assets/js/analytics.js` client from a small
script tag and includes a `noscript` pixel using the deployed Worker URL. The
JavaScript path keeps the server-issued visit ID only in page memory; the pixel
runs only when JavaScript is disabled.
