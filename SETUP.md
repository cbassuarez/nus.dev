# Publishing nus.dev

The repo is already set up to publish: `CNAME` holds `nus.dev`, `.nojekyll`
stops Jekyll from touching the output, and the generated HTML is committed.
What is left is Pages and DNS.

## 1. Turn on Pages

GitHub → the repo → **Settings → Pages**:

- **Source:** Deploy from a branch
- **Branch:** `main`, folder `/ (root)`

The first deploy takes a minute or two. It will appear at
`https://cbassuarez.github.io/nus.dev/` until DNS is live — relative asset
paths mean the site works at either address.

## 2. DNS at the registrar

`nus.dev` is a `.dev` domain, so it is on the HSTS preload list: it only ever
loads over HTTPS. That is fine — Pages issues a certificate automatically —
but it does mean the site is unreachable until the certificate is provisioned.
Do not panic during that window.

### Apex (`nus.dev`)

Four `A` records and four `AAAA` records, all with the host left blank or `@`:

```
A     @   185.199.108.153
A     @   185.199.109.153
A     @   185.199.110.153
A     @   185.199.111.153

AAAA  @   2606:50c0:8000::153
AAAA  @   2606:50c0:8001::153
AAAA  @   2606:50c0:8002::153
AAAA  @   2606:50c0:8003::153
```

### `www`

One `CNAME`:

```
CNAME  www   cbassuarez.github.io.
```

GitHub redirects `www.nus.dev` → `nus.dev` once both are configured.

> These are GitHub's published Pages addresses as of this writing. Confirm them
> against
> <https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>
> before you paste them in — they have changed before.

## 3. Back on GitHub

**Settings → Pages → Custom domain**: enter `nus.dev`, save. GitHub checks the
DNS, then provisions the certificate. When the check passes, tick
**Enforce HTTPS**.

If the custom-domain field reports that the domain is already taken or the
check fails, it is almost always DNS propagation. `dig nus.dev +short` should
return the four A records above.

## 4. Verify the domain (recommended)

**Settings → Pages → verified domains** on the *account*, not the repo. Adding
the `TXT` record GitHub gives you stops anyone else's repo from claiming
`nus.dev` if you ever remove it from this one. Takes a minute, worth doing.

## Updating the site

```
npm run build
git commit -am "site: <what changed>"
git push
```

Pages redeploys on push to `main`. There is no build step on GitHub's side, so
whatever is committed is exactly what ships — which is why the generated HTML
is in the repo.

## When the docs change

```
npm run sync          # content/ ← ../nus/docs/
npm run build
git commit -am "docs: sync"
git push
```
