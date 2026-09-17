# WKND Site Scope Analysis Plan

## Objective
Perform a **site scope analysis** for `https://wknd.site/us/en` — discover the site's URLs, analyze representative pages, group them into page templates, catalog the blocks each template needs, and produce a migration scope report. This is a **discovery/planning pass only**; it does not import content or generate block code.

## Target
- **Source site:** `https://wknd.site/us/en`
- **Destination project:** `eds-site-wknd` (org `sanjanaJat98`)
- **Content source:** Document Authoring (`content.da.live/sanjanaJat98/eds-site-wknd/`)

## Approach
The scope analysis runs as a pipeline: discover URLs → sample and analyze pages → cluster into templates → inventory blocks → report. The WKND demo site is a well-known reference site (adventure/travel content) with a handful of distinct page types (home, magazine/article listing, article detail, adventure detail).

## Checklist

- [ ] **Confirm scope parameters** — crawl depth, whether to include all locales or just `/us/en`, and URL cap (see open questions below)
- [ ] **Discover URLs** — fetch the site's sitemap (or crawl from `/us/en`) to enumerate all reachable pages under the scope
- [ ] **Group URLs by pattern** — cluster discovered URLs by path structure to identify candidate page types
- [ ] **Analyze representative pages** — scrape and analyze one or more sample pages per candidate group (structure, sections, images, metadata)
- [ ] **Catalog page templates** — consolidate the analysis into a set of distinct page templates with counts of how many URLs map to each
- [ ] **Inventory blocks** — for each template, identify the EDS blocks required (hero, cards, columns, article header, etc.), cross-referencing the project's available block library
- [ ] **Flag gaps** — note blocks not yet present in the repo that would need to be built, and any content patterns that are hard to model
- [ ] **Generate scope report** — produce a migration scope report summarizing URL counts, templates, per-template block needs, and effort/complexity notes
- [ ] **Review with user** — present the scope report and confirm which templates/pages to carry into the actual migration

## Deliverables
- URL inventory for `https://wknd.site/us/en`
- Page-template catalog (distinct page types + URL-to-template mapping)
- Per-template block inventory (available vs. needs-to-be-built)
- Written migration scope report

## Out of Scope (this phase)
- Content import / HTML generation
- Block code or CSS generation
- Navigation/footer instrumentation
- Publishing to Document Authoring

## Open Questions
Resolved before execution — see the questions I'm asking now.

---

Before I finalize this for execution, a couple of scope decisions will shape the URL discovery step.I'll update the plan with your choices: full sitemap discovery and analysis of all discovered pages.

# WKND Site Scope Analysis Plan

## Objective
Perform a **site scope analysis** for `https://wknd.site/us/en` — discover the full sitemap, analyze **all** discovered pages, group them into page templates, catalog the blocks each template needs, and produce a migration scope report. This is a **discovery/planning pass only**; it does not import content or generate block code.

## Target
- **Source site:** `https://wknd.site/us/en` (entry point; discovery expands to the full sitemap)
- **Destination project:** `eds-site-wknd` (org `sanjanaJat98`)
- **Content source:** Document Authoring (`content.da.live/sanjanaJat98/eds-site-wknd/`)

## Scope Decisions (confirmed)
- **URL discovery:** Full site sitemap — enumerate every page the site exposes, regardless of locale/path.
- **Analysis depth:** Analyze **all** discovered pages (not just one sample per type). Most complete inventory; higher time/token cost accepted.

## Approach
The scope analysis runs as a pipeline: discover the full sitemap → analyze every page → cluster into templates → inventory blocks per template → report. WKND is a reference adventure/travel site with several recurring page types (home, magazine/article listing, article detail, adventure detail, faqs, about) that this pass will confirm empirically from the sitemap rather than assume.

## Checklist

- [ ] **Discover full sitemap** — fetch the site's sitemap.xml (fall back to crawl) to enumerate every reachable URL across all paths/locales
- [ ] **Group URLs by pattern** — cluster discovered URLs by path structure to identify candidate page types and per-type counts
- [ ] **Analyze every page** — scrape and analyze each discovered URL (structure, sections, images, metadata, block candidates); batch to manage volume
- [ ] **Catalog page templates** — consolidate analyses into distinct page templates with the full URL-to-template mapping
- [ ] **Inventory blocks per template** — identify EDS blocks each template needs (hero, cards, columns, article header, etc.), cross-referenced against the project's available block library
- [ ] **Flag gaps** — list blocks not yet in the repo that must be built, plus content patterns that are hard to model
- [ ] **Generate scope report** — summarize URL counts, templates, per-template block needs, and effort/complexity estimates
- [ ] **Review with user** — present the scope report and confirm which templates/pages to carry into the actual migration

## Deliverables
- Full URL inventory for the site
- Page-template catalog (distinct page types + complete URL-to-template mapping)
- Per-template block inventory (available in repo vs. needs-to-be-built)
- Written migration scope report with complexity/effort notes

## Out of Scope (this phase)
- Content import / HTML generation
- Block code or CSS generation
- Navigation/footer instrumentation
- Publishing to Document Authoring

## Notes
- Analyzing all discovered pages may surface a large URL set; the report will note total counts and any batching applied so nothing is silently truncated.
- **Execution requires Execute mode** — this plan is ready; approve to begin URL discovery.
