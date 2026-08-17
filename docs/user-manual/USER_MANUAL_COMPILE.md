# Compiling the User Manual to PDF

The user manual is split into 7 markdown files. To compile them into a single
`USER_MANUAL.pdf`, use any of the following approaches:

---

## Option A — Pandoc + LaTeX (recommended for high quality)

### Install

```bash
# Ubuntu/Debian
sudo apt-get install pandoc texlive-xetex fonts-noto

# macOS (Homebrew)
brew install pandoc basictex
sudo tlmgr install xetex fonts-noto

# Windows (winget)
winget install --id JohnMacFarlane.Pandoc
winget install --id MiKTeX.MiKTeX
```

### Compile

Run this from the `docs/user-manual/` directory:

```bash
pandoc \
  01-getting-started.md \
  02-adding-properties.md \
  03-risk-analysis.md \
  04-generating-reports.md \
  05-comparing-properties.md \
  06-exporting-data.md \
  07-account-management.md \
  -o ../USER_MANUAL.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=2cm \
  -V fontsize=11pt \
  -V mainfont="Noto Serif" \
  --toc \
  --toc-depth=2 \
  -V title="Real Estate Due Diligence — User Manual" \
  -V date="2026"
```

---

## Option B — VS Code extension (no CLI needed)

1. Install the **Markdown PDF** extension by `yzane` in VS Code.
2. Open `01-getting-started.md`.
3. Right-click → **Markdown PDF: Export (pdf)**.
4. Repeat for each file, then merge the PDFs using a tool like **PDF Merge**
   (https://pdfmerge.com) or Adobe Acrobat.

---

## Option C — GitHub Actions (automated)

Add a workflow in `.github/workflows/docs.yml` to auto-build the PDF on push:

```yaml
name: Build User Manual PDF
on:
  push:
    paths:
      - 'docs/user-manual/**'
jobs:
  build-pdf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: baileypolo/pandoc-latex-action@v1
        with:
          files: >
            docs/user-manual/01-getting-started.md
            docs/user-manual/02-adding-properties.md
            docs/user-manual/03-risk-analysis.md
            docs/user-manual/04-generating-reports.md
            docs/user-manual/05-comparing-properties.md
            docs/user-manual/06-exporting-data.md
            docs/user-manual/07-account-management.md
          output: docs/USER_MANUAL.pdf
      - uses: actions/upload-artifact@v4
        with:
          name: user-manual-pdf
          path: docs/USER_MANUAL.pdf
```
