# Leonida Trophy Guide

An offline web app that guides you to the platinum trophy of Grand Theft
Auto VI on PlayStation 5: all 55 trophies with their official names,
descriptions and grades, a step-by-step guide for each one in my own words
with its sources named, a checklist that saves your progress in the browser,
and a roadmap to the platinum.

## What it covers

- **55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze. 28 of them are
  hidden on PlayStation until earned; this guide flags them and hides their
  details behind the spoiler setting until you earn them.
- **A tracker** — tick trophies off as you earn them. Progress is saved in
  the browser (localStorage) and can be exported to a file and imported back.
  Filters cover story, missable, collectibles, activities, side, crime and
  money, plus earned / not earned and a search box.
- **A roadmap** — about 200 hours at difficulty 4/10, one playthrough, no
  online trophies, no mission replay. Story first (60–80 hours), then the
  100% completion checklist (about 100 hours), then Strangers & Freaks and
  the last clean-up trophies.
- **One missable trophy** — Positive Mental Attitude. A meditation at Jason's
  house in Chapter 1 can only be done there; do it before the chapter ends.
  Everything else can be finished after the story in free roam.
- **Cited guides** — every trophy's guide names where its facts come from
  (PowerPyx, GTABase, KeenGamer, Push Square, HowToVideoGame, and the
  official list as Exophase and PSNProfiles publish it). Where sources
  disagree — the hidden count, the platinum time, the final mission's
  chapter, whether the Chapter 1 meditation is required — the guide says so
  instead of picking one side quietly. One trophy, Bad Luck, I Guess, has no
  confirmed method yet; the guide says that plainly rather than guessing.

## How to use it

Open `app/index.html` in a desktop browser. No build step, no network: every
file the app loads lives under `app/`, so it works with the network off.

- **Checklist** — the full list with filters, search and a spoiler toggle.
  Click a trophy to open its guide and sources beside the list.
- **Roadmap** — the three steps to the platinum, with the chapter and
  collectible counts the checklist needs.
- **Missables** — the one trophy that can be missed, and why the rest cannot.
- **Sources** — every source the guides draw on, and where they disagree.

## How it is built

- `main.ts` hands the guide in: it copies `app/` and `screenshots/` into the
  output directory and writes `dossier.json` with the vendored make.fun
  library. Run it with `MAKEFUN_OUTPUT_DIR=out node main.ts`.
- `app/index.html`, `app/app.js`, `app/style.css` — the app itself.
- `app/data/trophies.json` — the 55 trophies: official name, description and
  grade, hidden and missable flags, kind, counts where the game tracks one,
  and the guide with its sources.
- `screenshots/` — four renders of the app taken in a headless browser.

## Verification

- The kit's check command must report ok with no failures.
- The program runs twice under the grader's conditions (a different working
  directory, a pre-created empty output directory, a read-only filesystem)
  and must exit 0 both times with a byte-identical dossier.
- No script, stylesheet, image or data file in `app/` loads anything over the
  network. The only absolute URLs are the source links in the Sources tab,
  which load nothing unless the reader clicks one.
- All 55 official names are present in `app/data/trophies.json`, each with a
  non-blank guide and at least one named source.
- All four screenshots are at most 256 KiB each.

Referral code: emjee.
