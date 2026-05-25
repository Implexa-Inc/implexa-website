# deploy

## first time: link to vercel

```bash
cd /Users/rabigupta/revenoid-workspace/Implexa/implexa-website

# 1. log in (one-time, opens browser)
vercel login

# 2. link this repo to a new vercel project
#    - "set up and deploy?" → yes
#    - "which scope?" → pick Implexa team (or your personal account)
#    - "link to existing project?" → no
#    - "project name?" → implexa-website
#    - "code directory?" → ./
#    - "override settings?" → no
vercel

# 3. ship a production build
vercel --prod
```

vercel will print the production URL (e.g. `https://implexa-website-<hash>.vercel.app`).

## continuous deploys

once the project is linked, vercel auto-deploys on every push to `main`.
preview deploys fire on PR branches.

## env vars (set on vercel)

| var | what | required |
|---|---|---|
| `IMPLEXA_API_URL` | backend root | no, defaults to `https://core.implexa.ai` |
| `IMPLEXA_PUBLIC_SEARCH_TOKEN` | bearer token for public-search MCP role | yes, to enable live `/api/search` |

set them via the vercel dashboard, or:

```bash
vercel env add IMPLEXA_PUBLIC_SEARCH_TOKEN production
```

## custom domain

```bash
vercel domains add implexa.ai
vercel alias <production-deployment-url> implexa.ai
```

then point your DNS:
- `implexa.ai` A record → vercel's IP (vercel will show it)
- `www.implexa.ai` CNAME → `cname.vercel-dns.com`

## verify

```bash
curl -sI https://implexa.ai/ | head -1
# HTTP/2 200
```
