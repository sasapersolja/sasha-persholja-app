# Sasha Persholja App

Official Sasha Persholja mobile app project.

This repository is separate from the live website repository.

## Structure

- `app/index.html` - mobile app shell
- `app/styles.css` - mobile-first styling
- `app/app.js` - app controls and rendering
- `app/track-data.js` - configurable release data and platform links
- `app/manifest.webmanifest` - web app manifest
- `app/service-worker.js` - offline app-shell cache
- `assets/images/` - app artwork and poster images
- `assets/video/` - app video assets
- `android/` - reserved for the Android wrapper

## Current state

The first app shell is ready and currently uses Big Black Puppet as the initial data set. Media files have not been copied from the live website. A different release can be introduced through `app/track-data.js` and media stored inside this repository.
