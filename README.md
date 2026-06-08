# Pen Search Eval Site

A deterministic search fixture for testing agents that navigate paginated web pages.

## Behavior

- The home page shows a search box.
- Any submitted search query returns the same fixed set of 100 pen listings.
- Results are paginated with exactly one listing per page.
- Each listing has a stable, non-obvious `/bid/<listing-id>` link.
- The fixture data lives in `results.json`, so eval code can compare exact URLs across runs.

## GitHub Pages

This site is fully static. No Node.js server is required.

1. Push this repository to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Set the source to deploy from the branch and `/` root folder.
5. Open the published Pages URL.

## Local Preview

Any static file server works. For example:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Useful URLs

```text
http://127.0.0.1:4173/?q=blue%20pen&page=1
http://127.0.0.1:4173/?q=anything&page=100
http://127.0.0.1:4173/bid/ff8342-b378ce-7da17c/
```
