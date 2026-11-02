# Upload instructions

This bundle is prepared for the `HamzaShaikhAI/hamzashaikhai.github.io` repository. It contains:

- `index.html` — refreshed portfolio page and SEO/social metadata
- `README.md` — a proper repository landing page
- `robots.txt` — crawler access and sitemap declaration
- `sitemap.xml` — canonical homepage URL
- `favicon.svg` — browser tab icon
- `assets/hs-mark.svg` — reusable HS brand mark
- `assets/social-preview.png` — Open Graph / LinkedIn / social sharing banner

## Publish

1. Extract the ZIP locally.
2. Open the repository on GitHub and select **Add file → Upload files**.
3. Upload `index.html`, `README.md`, `robots.txt`, `sitemap.xml`, `favicon.svg`, and the `assets` folder with its two files.
4. Commit the changes to `main` with message: `feat: complete portfolio branding and SEO essentials`.
5. Check **Settings → Pages** and confirm `main` / `/(root)`.
6. Wait for the `github-pages` deployment to complete, then verify the homepage and these URLs:
   - `/favicon.svg`
   - `/robots.txt`
   - `/sitemap.xml`
   - `/assets/social-preview.png`

## Google Search Console

After deployment, add `https://hamzashaikhai.github.io/` as a URL-prefix property in Google Search Console. Verify ownership using one of the verification methods Google offers for the property. Then submit `https://hamzashaikhai.github.io/sitemap.xml`.

A sitemap helps discovery but does not guarantee indexing or a particular ranking.
