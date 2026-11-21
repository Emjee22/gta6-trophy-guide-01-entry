# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Emjee22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Emjee22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that walks you to the platinum trophy of Grand Theft Auto VI on PlayStation 5. It covers all 55 trophies — 1 platinum, 2 gold, 6 silver and 46 bronze — with their official names, descriptions and grades exactly as PlayStation publishes them, and a step-by-step guide for every one of them, written in my own words with its sources named beside it.

## What it covers

- **55 trophies, all of them.** 28 are hidden on PlayStation until you earn them; this guide flags them and hides their names and descriptions behind the spoiler setting until you tick them off. One trophy is missable.
- **A tracker that remembers.** Tick a trophy's box to mark it earned — progress saves itself in your browser (localStorage), so it is still there when you come back. Export your progress to a file for a backup, and import it back any time.
- **Filters that narrow it down.** Filter by story, missable, collectibles, activities, side, crime or money, by hidden trophies, or by earned and not-earned, plus a search box for finding a trophy by name.
- **A spoiler setting that protects the story.** Turn on "Hide story spoilers" and the names and descriptions of the story trophies stay hidden until you earn them.

## Roadmap to the platinum

About 200 hours at difficulty 4/10, in a single playthrough, with no online trophies and no mission replay. Play the story first (about 60–80 hours across the five chapters), then work through the 100% completion checklist (about 100 hours), then finish the remaining side content and clean-up trophies in free roam. Cheats disable trophies and saving, so keep them off, and keep a manual save at the start and end of each chapter — there are 15 manual slots.

## The one missable trophy

Only one trophy can be missed: **Positive Mental Attitude**. It asks you to meditate at every spot across Leonida, and the first spot is the missable one — in Chapter 1, the morning after the mission Down to Earth, follow Lucia to the balcony at Jason's house and choose to meditate with her. Once Chapter 1 ends, that moment is gone for good and there is no mission replay. Everything else can be finished after the story in free roam.

## Sources

Every guide in this app names where its facts come from. The guides are written in this app's own words — a source is cited, never copied. The main sources are the PowerPyx Trophy Guide, the GTABase Trophy List, the KeenGamer Trophy Guide, the Push Square Trophy Guide and the HowToVideoGame Trophy List, with the official list as Exophase and PSNProfiles publish it. The Sources tab shows a matrix of what each source covers, and a section on where the sources disagree — the hidden count, the time to platinum, and the final mission's chapter — so you can see both sides instead of being handed one quietly.

## Run it

The app is static files under `app/`, with no build step. Serve it with any static HTTP server using `app/` as its root, then open `app/index.html` in desktop Chrome. It works with the network off: every script, stylesheet and data file it loads is a file under `app/`, and the only absolute URLs are the source links in the Sources tab, which load nothing unless you click one.

## A note on the guide

Leonida Trophy Guide is an unofficial fan guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide is not affiliated with Rockstar Games. Trophy names, descriptions and grades are shown as PlayStation publishes them.

Referral code: emjee.
