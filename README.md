# Held-Karp TSP Visualizer

**Author:** Harpreet Kaur Gothra &nbsp;|&nbsp; **SRN:** R24EI020  
**Course:** Design and Analysis of Algorithms &nbsp;|&nbsp; **Date:** 26-05-2026

---

## Overview

An interactive, animated visualizer for the **Held-Karp algorithm** — an exact, dynamic-programming solution to the classic **Travelling Salesman Problem (TSP)**. Built in C with a GTK+ 3 GUI and Cairo for rendering, it lets you place cities, tweak distances, and watch the optimal tour emerge step by step.

---

## What is the Travelling Salesman Problem?

Given a set of cities and the distances between them, find the **shortest possible route that visits every city exactly once and returns to the starting city**.

TSP is NP-hard — brute force checks all *n!* permutations. Held-Karp reduces that to **O(2ⁿ · n²)** using bitmask DP, making it practical for up to ~20 cities.

---

## The Held-Karp Algorithm

### Core Idea

Held-Karp uses **dynamic programming over subsets** (bitmask DP):

```
dp[S][i] = minimum cost to reach city i,
           having visited exactly the cities in subset S,
           starting from city 0.
```

### Recurrence

```
dp[S][i] = min over all j in S, j ≠ i:
               dp[S \ {i}][j] + dist[j][i]
```

**Base case:** `dp[{0}][0] = 0`

**Final answer:** `min over i ≠ 0: dp[full_set][i] + dist[i][0]`

### Complexity

| | Brute Force | Held-Karp |
|---|---|---|
| Time | O(n!) | O(2ⁿ · n²) |
| Space | O(n) | O(2ⁿ · n) |

### Why Bitmask?

Each subset of *n* cities is encoded as an integer: bit *i* is set if city *i* is in the subset. This allows O(1) subset operations (`|`, `&`, `^`) and compact 2D DP tables indexed by `(subset, last_city)`.

---

## Features

- **Interactive city placement** — left-click the canvas to drop a city (up to 12)
- **City deletion** — right-click any city to remove it
- **Editable distance matrix** — click any cell in the panel to type a custom distance (asymmetric distances fully supported)
- **One-click solve** — click **Solve TSP** to run Held-Karp and launch the animation
- **Step-by-step animation** with 5 phases:
  1. **Base** — shows all edges from the start city
  2. **Build-up** — highlights growing subsets as DP states expand
  3. **Closing** — shows the return edge that closes the tour
  4. **Reveal** — draws the optimal path edge by edge with cost labels
  5. **Done** — final tour highlighted on canvas and matrix
- **Computation time** displayed in milliseconds
- **Optimal tour cost** shown prominently in the right panel
- **Reset** — clears everything for a fresh run

---

## Build & Run

### Prerequisites

Install GTK+ 3 development libraries:

```bash
# Ubuntu / Debian
sudo apt install libgtk-3-dev

# Fedora / RHEL
sudo dnf install gtk3-devel

# Arch Linux
sudo pacman -S gtk3
```

### Compile

```bash
gcc main.c -o tsp `pkg-config --cflags --libs gtk+-3.0` -lm
```

### Run

```bash
./tsp
```

The window opens maximized at 1400 × 900 and is fully resizable.

---

## Usage Guide

| Action | How |
|---|---|
| Add a city | Left-click anywhere on the canvas |
| Delete a city | Right-click on a city node |
| Edit a distance | Click a matrix cell, type a number, press **Enter** |
| Cancel editing | Press **Escape** |
| Solve TSP | Click the blue **Solve TSP** button |
| Reset everything | Click the red **Reset** button |

> The start city is always **City 0** (highlighted in amber). The optimal tour begins and ends there.

---

## Project Structure

```
Held-Karp-algorithm/
├── main.c        # Full source — algorithm + GUI + animation
└── README.md     # This file
```

---

## Algorithm Implementation Details

The core solver lives in `held_karp()` (`main.c`, line 73):

- Iterates over all `2ⁿ` subsets in ascending order.
- Only processes subsets that include city 0 (the `!(s & 1) continue` guard).
- Stores the predecessor city in `parent_tbl[S][i]` for tour reconstruction.
- Times execution with `CLOCK_MONOTONIC` for accurate millisecond reporting.

Tour reconstruction (`reconstruct_tour()`) walks `parent_tbl` backwards from the last city in the full subset, then reverses the path to produce the forward tour `0 → c₁ → c₂ → … → 0`.

---

## Limitations

- Maximum **12 cities** (`MAX_CITIES` constant). The DP table allocates `2ⁿ × n` integers; at 12 cities that is 4096 × 12 — comfortably within RAM.
- Distances are integers in the range **1–999**. Self-loop cells (diagonal) are non-editable.
- Requires a GTK+ 3 runtime — on Windows, use WSL or MSYS2/UCRT64.

---

## References

1. Held, M. & Karp, R. M. (1962). *A Dynamic Programming Approach to Sequencing Problems.* SIAM Journal, 10(1), 196–210.
2. Cormen, T. H. et al. *Introduction to Algorithms*, 3rd ed. — Chapter 35: Approximation Algorithms.
3. GTK+ 3 Documentation: https://docs.gtk.org/gtk3/

---

*Mini Project — Design and Analysis of Algorithms*  
*Harpreet Kaur Gothra · R24EI020*
