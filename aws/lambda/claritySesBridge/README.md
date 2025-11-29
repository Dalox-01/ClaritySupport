# claritySesBridge

Lambda Node.js handler that pulls SES inbound emails from S3, parses them, and forwards them to the existing Clarity Support webhook so the backend treats AWS SES like Resend.

## Files

- `index.mjs` – Lambda handler (Node 20) reading from S3, parsing with `mailparser`, posting to `/api/webhooks/resend-inbound`.
- `package.json` – Dependency manifest (`@aws-sdk/client-s3`, `mailparser`, `node-fetch`).

## Required environment variables

| Key | Description |
| --- | --- |
| `MAILCENTER_ENDPOINT` | HTTPS endpoint of the Next.js webhook (ex: `https://app.claritysupport.app/api/webhooks/resend-inbound?secret=...`). |
| `API_SECRET` | Optional header (`x-internal-secret`) if you prefer not to pass the secret in the query string. |
| `S3_BUCKET` | Bucket where SES stores raw messages (e.g. `claritysupport-inbound`). |
| `AWS_REGION` | Optional override (defaults to `us-east-1`). |
| `DELETE_AFTER_FORWARD` | Defaults to `true`. Set to `false` to retain emails in S3.

## Deployment steps

1. Install deps locally:
   ```bash
   cd aws/lambda/claritySesBridge
   npm install
   ```
2. Zip the folder (without `node_modules` if you rely on Lambda layers, otherwise include them) and upload via the Lambda console (`Code` tab → `Upload from` → `.zip file`).
3. Ensure the Lambda execution role has:
   - `AWSLambdaBasicExecutionRole` (CloudWatch Logs).
   - Inline S3 policy with `s3:ListBucket`, `s3:GetObject`, `s3:DeleteObject` on `claritysupport-inbound`.
4. Configure the environment variables listed above and increase timeout/memory (e.g. 30s / 512 MB).
5. In Amazon SES (us-east-1), create a receipt rule for your recipient (`*@inbox.claritysupport.app`) with actions:
   - S3 → bucket `claritysupport-inbound`.
   - Lambda → `claritySesBridge` (include original headers, enable invocation permissions).
6. Send a test email to the routing address and verify:
   - Object arrives in S3 (and is removed if `DELETE_AFTER_FORWARD=true`).
   - CloudWatch logs show a successful invocation.
   - Clarity Support inbox displays the email via `/api/webhooks/resend-inbound`.
