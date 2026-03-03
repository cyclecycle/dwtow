You are building Drone Wars TOW - **"Desert Strike meets Warpips with a COD dopamine drip,"** set in a gritty, automated future. Adding the spatial base-building mechanic (extractors on controlled territory) perfectly solves the "snowball" problem in tug-of-war games by forcing players to constantly choose between pushing the line or securing their income.

Here is the comprehensive technical and design specification for your browser-based prototype.

---

## 1. Technical Stack & Architecture

To keep this browser-native, performant, and visually striking, we will use a WebGL-based stack.

* **Rendering Engine:** **Three.js**. It’s lightweight, has a massive ecosystem, and handles thousands of simple 3D objects easily if we use Instanced Meshes.
* **Game Logic:** Vanilla JavaScript (ES6+). For a prototype, a simple Object-Oriented game loop `update(deltaTime)` is sufficient. If scaling, an Entity-Component-System (ECS) like `bitecs` would be ideal.
* **UI Framework:** Standard HTML/CSS overlaid on top of the `<canvas>`. This makes building the COD-style menus, progress bars, and floating hit-markers incredibly fast and responsive.
* **Physics/Collision:** A simple custom 2D bounding-box system. Since the game is essentially a 1D tug-of-war played on a 3D plane, we only need to check distance along the X-axis for range and collision.

---

## 2. Visual Style & Art Direction

We want the satisfying, chaotic "juice" of *Warpips* but in 3D.

* **The Aesthetic:** "Gritty Sci-Fi Diorama." The camera is locked in an isometric/orthographic side-view. The map looks like a slice of a ruined battlefield floating in a dark void.
* **Assets:** Low-poly models with flat shading. The visual detail comes from the lighting and VFX, not the textures.
* **The "COD Juice":** * **Hit Markers:** Every time a drone lands a shot, a crisp white `X` flashes on the UI with a satisfying *thwip* sound.
* **Explosions:** Volumetric smoke, screen-shake on artillery impacts, and bright emissive lasers (Bloom post-processing is a must in Three.js).
* **Debris:** When drones die, they don't play an animation; they shatter into physics-enabled low-poly chunks that clutter the battlefield.



---

## 3. The Map & Base Building Mechanic

The map is a linear, ruined highway divided into **5 Capture Zones**.

* **The Frontline:** Units automatically march toward the center. The "Frontline" is the exact midpoint between your furthest unit and the enemy's furthest unit.
* **Territory Control:** If your frontline pushes past a Zone Marker, that zone becomes "Secured."
* **The Economy Engine (Extractors):** Once a zone is secured, an icon appears on your UI. You can spend starting capital to build a **Flux Extractor** on that node. This permanently increases your passive income per second.
* **The Catch:** If the enemy pushes the frontline back into your zone, their units will automatically target and destroy your Extractor, crippling your economy.

---

## 4. The Core Loop: The Triangle of Trade-offs

Your primary resource is **Flux**. Every 10 seconds, you must make a critical decision with your Flux pool:

1. **Momentum (Volume):** Spam cheap Tier 1 units to push the frontline forward aggressively.
2. **Economy (Greed):** Hold the line with what you have and spend Flux to build an Extractor on a secure node.
3. **Upgrade (Tech):** Save your Flux to unlock Tier 2 units, sacrificing immediate presence for future firepower.

---

## 5. Unit Roster & Tech Tree

*Theme: Automated Corporate Warfare.*

| Unit              | Tier | Role           | Behavior                                                                                    |
| ----------------- | ---- | -------------- | ------------------------------------------------------------------------------------------- |
| **Scrap-Hound**   | 1    | Melee Swarm    | Moves fast. Ignored cover. Rushes the nearest enemy to detonate. Cheap volume.              |
| **Peacekeeper**   | 1    | Basic Infantry | Stops at max range to shoot. Low health, moderate damage.                                   |
| **Aegis Drone**   | 2    | Tank / Cover   | Moves slowly. Deploys a physical energy shield that blocks projectiles for units behind it. |
| **Mortar Walker** | 2    | Artillery      | Stays far back. Fires arcing explosive shells that deal AOE damage and cause screen-shake.  |
| **Goliath Mech**  | 3    | Behemoth       | Massive HP. Walks through cover, destroying it. Fires twin heavy lasers.                    |

---

## 6. Basic Unit AI (State Machine)

To make it feel like *Warpips*, units cannot just walk through each other. They need spatial awareness.

Each unit runs this simple logic tree every frame:

1. **Check Range:** Is an enemy within my `attackRange`?
* *Yes:* Transition to **ATTACK** state. Stop moving. Play shooting animation.
* *No:* Continue to Step 2.


2. **Check Cover:** Is there a ruined car or sandbag (Cover Object) slightly ahead of me, and am I taking fire?
* *Yes:* Transition to **SEEK COVER** state. Move to the exact X-coordinate behind the cover.


3. **Default:** Transition to **ADVANCE** state. Move forward along the X-axis at `movementSpeed`.

---

## 7. The Opponent AI (The "Bot")

For the prototype, the enemy AI doesn't need neural networks; it just needs a prioritized rule-set based on your Frontline position.

* **If Frontline is pushing into AI territory:** Panic mode. AI spends all available Flux on Tier 1 volume to stop the bleeding.
* **If Frontline is neutral (Middle):** Balanced approach. AI spawns a mix of T1/T2 units.
* **If Frontline is pushing into Player territory:** Greed mode. AI holds back spawning and builds Extractors on its captured nodes to snowball its economy.

---

## 8. UI/UX Flow

1. **Main Menu:** Clean, dark military aesthetic. "DEPLOY" button.
2. **HUD (In-Game):**
* **Top Center:** A Tug-of-War progress bar showing territory control (Blue vs. Red) with 5 node pips.
* **Top Right:** Your current Flux balance and `+X/sec` income rate.
* **Bottom Bar (The Deck):** Hotkeys (1, 2, 3, 4) to queue units. They have short cooldown sweeps after spawning.
* **Floating World UI:** Little wrench icons hovering over secured territory to click and build Extractors.
