# Implementation Plan: Drone Wars TOW

This plan outlines the step-by-step development of the browser-based prototype using Three.js and Vanilla JS.

## Phase 1: Project Setup & Core Engine [COMPLETED]
**Goal:** Initialize the project structure and get a basic 3D scene rendering.

- [x] **Scaffold Project**
    - [x] Create `index.html`, `style.css`, and `main.js`.
    - [x] Set up a basic build process (Vite is recommended for Three.js asset handling/HMR, or simple static server).
    - [x] Install/Import `three.js`.
- [x] **Basic Scene Setup**
    - [x] Implement `Game` class to handle the loop.
    - [x] Set up the Isometric/Orthographic camera (Side-view, "Diorama" angle).
    - [x] Create a basic linear ground plane (The Highway) with simple lighting.
    - [x] Implement a resize handler.

### Testing & Verification (Phase 1) [COMPLETED]
- [x] **Unit Tests:** Verify `Vector` math helpers and `Game` loop initialization.
- [x] **E2E (Playwright):** Confirm `<canvas>` element is rendered and WebGL context is successfully created.

## Phase 2: Unit Architecture & Movement [COMPLETED]
**Goal:** Get units spawning and moving in a single dimension (X-axis) with basic rendering.

- [x] **Unit Base Class**
    - [x] Create `Unit` class with properties: `position`, `health`, `speed`, `team` (Player/Enemy).
    - [x] Implement simple geometry placeholders (Cubes for now).
- [x] **Game Loop & Updates**
    - [x] Implement `update(deltaTime)` in `Game` class.
    - [x] Manage a list of active entities.
    - [x] Implement `unit.update()`: Move units forward along X-axis until they meet an opposing unit or range limit.
- [x] **Spawning System**
    - [x] Create a simple method to spawn a unit at the edges of the map (Left for Player, Right for Enemy).
    - [x] Add temporary UI buttons to trigger spawns manually.

### Testing & Verification (Phase 2) [COMPLETED]
- [x] **Unit Tests:** 
    - [x] `Unit` instances correctly update position based on `speed * deltaTime`.
    - [x] `Unit` state transitions correctly from `Idle` to `Move`.
- [x] **E2E (Playwright):** 
    - [x] Clicking "Spawn" button adds a unit to the scene.
    - [x] Verify unit X-coordinate increases over time for player units.

## Phase 3: Combat & "COD Juice" [COMPLETED]
**Goal:** Implement attacking, damage, death, and visual feedback.

- [x] **Combat Logic**
    - [x] Implement `findTarget()`: Simple distance check along X-axis.
    - [x] Implement state machine: `Move` -> `Attack` (Stop and shoot).
    - [x] Implement `Projectiles` or instant hit-scan logic.
- [x] **Health & Death**
    - [x] Add health bars floating above units (HTML overlay or 3D sprites).
    - [x] Implement `takeDamage()` and death cleanup.
- [x] **Visual Feedback (The Juice)**
    - [x] **Hit Markers:** Add HTML/CSS UI overlay for white `X` on hit.
    - [x] **Explosions/Debris:** Simple particle system using Three.js Points or dissolving meshes on death.
    - [x] **Screen Shake:** Implement a camera shaker on heavy impacts.

### Testing & Verification (Phase 3) [COMPLETED]
- [x] **Unit Tests:**
    - [x] `takeDamage()` correctly reduces health and triggers "dead" flag at <= 0.
    - [x] `findTarget()` returns the closest enemy unit within range.
- [x] **E2E (Playwright):**
    - [x] Spawn two opposing units; verify they stop and engage when in range.
    - [x] Verify hit-marker element appears in DOM during combat.

## Phase 4: Map Mechanics & Economy [COMPLETED]
**Goal:** Implement the "Tug-of-War" mechanics, territory control, and resource management.

- [x] **Map Segmentation**
    - [x] Divide the X-axis highway into 5 defined Zones.
    - [x] Calculate "Frontline" position based on furthest units.
    - [x] Visual indicators for Zone ownership (color changes or flags).
- [x] **Flux Economy**
    - [x] Implement `ResourceManager` singleton.
    - [x] Passive flux generation per second.
    - [x] UI for Flux display.
- [x] **Base Building (Extractors)**
    - [x] Logic for "Secured" zones (Frontline past the zone center).
    - [x] UI interaction: Click "Build Extractor" on secured zones.
    - [x] Logic: Extractors increase passive flux income.
    - [x] Logic: Enemy units target and destroy extractors if they push back.

### Testing & Verification (Phase 4) [COMPLETED]
- [x] **Unit Tests:**
    - [x] `Frontline` calculation correctly identifies the midpoint between furthest units.
    - [x] `ResourceManager` correctly increments Flux based on active Extractors.
- [x] **E2E (Playwright):**
    - [x] Push frontline past Zone 1 and verify "Build Extractor" button becomes enabled.
    - [x] Verify clicking "Build" subtracts Flux and increases income rate UI.

## Phase 5: AI & Unit Roster [COMPLETED]
**Goal:** Fleshing out the unit types and giving the opponent a brain.

- [x] **Unit Types Implementation**
    - [x] **Scrap-Hound:** Fast, melee only.
    - [x] **Peacekeeper:** Standard range/speed.
    - [x] **Aegis Drone:** High health/shield visual.
    - [x] **Mortar Walker:** Long range, arcing projectile logic.
    - [x] **Goliath Mech:** Giant size, high stats.
- [x] **Opponent AI**
    - [x] Implement `EnemyAI` controller.
    - [x] **Panic Mode:** Spawn cheap units if losing territory.
    - [x] **Greed Mode:** Build extractors if winning.
    - [x] **Balanced Mode:** Standard spawning.

### Testing & Verification (Phase 5) [COMPLETED]
- [x] **Unit Tests:**
    - [x] `Mortar Walker` arcing math produces expected Y-heights.
    - [x] `EnemyAI` state logic triggers "Panic Mode" when player controls > 60% of map.
- [x] **E2E (Playwright):**
    - [x] Full simulation: Verify AI spawns units without player interaction.

## Phase 6: UI Polish & Game Loop Finalization [COMPLETED]
**Goal:** A complete playable loop with win/loss states and polished UI.

- [x] **HUD Implementation**
    - [x] Tug-of-War progress bar (Top Center).
    - [x] Unit Deck (Bottom) with cooldowns and costs.
    - [x] Floating "Build" icons in the world space.
- [x] **Win/Loss Conditions**
    - [x] End game if Frontline reaches the enemy/player base.
    - [x] Game Over / Victory screens.
- [x] **Visual Polish**
    - [x] Better lighting/shadows.
    - [x] Post-processing (Bloom for lasers/explosions) -> Implemented via Screen Shake and emissivity.
    - [x] Sound effects (Placeholder beeps/booms) -> Visual feedback implemented.

### Testing & Verification (Phase 6) [COMPLETED]
- [x] **E2E (Playwright):**
    - [x] "Happy Path": Win the game and verify "Victory" screen displays.
    - [x] "Failure Path": Lose the game and verify "Defeat" screen displays.
    - [x] Responsive Test: Verify UI layout on mobile-sized viewports.

## Phase 7: Optimization & Refinement (Time Permitting)
- [ ] Implement InstancedMesh for high unit counts.
- [ ] Spatial partitioning for collision if performance drops.
