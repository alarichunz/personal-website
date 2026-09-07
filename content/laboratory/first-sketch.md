+++
title = 'First Sketch'
date = 2026-06-16
description = 'A placeholder experiment with a live canvas hero.'
tags = ['webgl']
toc = false
hero = '/sketches/first-sketch.js'
+++

The Laboratory mounts live sketches above the title via the `hero` frontmatter
key. Point it at a `.js` ES-module under `static/sketches/` that grabs the
`[data-hero-canvas]` element and draws into it — Book-of-Shaders style.

This placeholder ships a tiny 2D-canvas animation so you can see the wiring.
Swap in WebGL / a fragment shader / a simulation when you build the real thing.
