# Mesa Serena

Landing de venta del recetario. La app de Next.js está en `web/`.

## Vercel

Al importar el repositorio:

1. Root Directory: `web`
2. Framework: Next.js
3. Cada push a `main` despliega solo.

Variables (los valores reales van en el panel de Vercel, no en el repo):

- `SKYLINK_API_URL`
- `SKYLINK_COMMERCE_CODE`
- `SKYLINK_API_KEY`
- `NEXT_PUBLIC_PRICE_USD`
- `NEXT_PUBLIC_PRICE_VES`
- `PRICE_VES_CENTS`
- `NEXT_PUBLIC_SITE_URL`
- `MAIL_WEBHOOK_URL`
- `SMTP2GO_USERNAME`
- `SMTP2GO_PASSWORD`
- `SMTP2GO_HOST`
- `SMTP2GO_PORT`
- `MAIL_FROM`
- `MAIL_FROM_NAME`
- `RECETARIO_DOWNLOAD_URL`

`NEXT_PUBLIC_SITE_URL` debe ser la URL pública del deploy. El webhook de Skylink apunta a `https://TU-DOMINIO/api/webhooks/skylink`.
