# Hotel of Horror - Game Plan

## Goal

Create a small, fun JavaScript game inspired by the original ZX81 version. The game will run entirely inside a web browser from a local `.html` file, with no Node.js installation, package manager, build step, web server, account, or network connection required.

## Confirmed Requirements

- The game is delivered as a locally playable HTML page.
- All gameplay is implemented with browser-native HTML, CSS, and JavaScript.
- Opening the HTML file directly from disk must be enough to play.
- The visual presentation uses a ZX81-style bitmap font.
- Required code, fonts, graphics, and sounds are stored locally with the game.
- The finished game must not depend on CDNs, analytics, remote APIs, or other online resources.

## Proposed Project Shape

Keep the project small and easy to inspect:

```text
HotelOfHorror/
|-- index.html       # Game page and entry point
|-- game.js          # Game state, rules, input, and rendering
|-- style.css        # Layout and ZX81-inspired presentation
|-- assets/          # Local bitmap font and its license
|-- tests/           # Optional developer smoke tests
|-- tools/           # Optional bitmap-font generator
`-- PLAN.md          # Living design and implementation plan
```

The exact file split can change if a single self-contained HTML file would better suit the final game.

## Technical Direction

- Use plain JavaScript with no external runtime or framework.
- Support direct `file://` use by avoiding features that require an HTTP server, such as module imports or fetching local data files.
- Embed game data in JavaScript or HTML so browser security restrictions do not prevent local play.
- Use a bundled or embedded ZX81-style font with an appropriate license; provide a bitmap/CSS fallback if needed.
- Favor a crisp, fixed-resolution game display that scales cleanly while retaining the original computer aesthetic.
- Use a black-and-white ZX81-style palette for the initial version.
- Present gameplay entirely as text, without room or monster illustrations.
- Use a playful, lightly campy Halloween-horror tone for descriptions and messages.
- Preserve gameplay output in a scrolling text history instead of replacing the screen each turn.
- Always pin the history to its absolute bottom as messages arrive, fonts finish loading, or the viewport changes.
- Vary room-search and empty-room descriptions to keep exploration playful and surprising.
- Keep game state and rendering separate enough that the rules remain easy to test and adjust.
- Keep the game silent, with no sound effects, music, or browser audio handling.

## Story and Objective

The player wakes up on the tenth floor of a hotel with no memory of how they arrived. Their goal is simple: make their way out of the hotel alive.

## Starting State

- Location: tenth floor of the hotel
- Health: 10
- Inventory: empty
- Knowledge: the player does not know how or why they are in the hotel

## Hotel Layout

- The hotel has 10 levels.
- Every level contains 10 rooms.
- Each level is a linear hallway arranged from left to right.
- Room 1 is at the far left, followed in order through room 10 at the far right.
- A left or right action moves the player exactly one adjacent doorway and consumes one turn.
- Left is not offered at room 1, and right is not offered at room 10.
- Rooms use the four-digit format `LLRR`, with both the level (`LL`) and room (`RR`) zero-padded to two digits.
- Room positions remain 1 through 10; for example, level 1 room 1 is `0101`, level 9 room 7 is `0907`, and level 10 room 10 is `1010`.
- The room number is displayed whenever the player is standing in front of its doorway.
- If the current room has already been searched, its number is visibly marked `SEARCHED`.
- Each level from 10 through 2 has one randomly placed stairwell leading to the level below.
- Level 10 has no stairs going up.
- Level 1 has no stairs going down; the exit is the only route out of the hotel.
- Stair connections preserve hallway position between levels. For example, stairs down beside room 7 on level 5 arrive beside room 7 on level 4.
- The same connection can be used in reverse to return upstairs at that position.
- A stairwell occupies a location without replacing the room at that location.
- A single location may therefore offer access to its room, stairs up, and stairs down at the same time.
- Stairs are revealed immediately when the player reaches their hallway position, with `U` and/or `D` offered as appropriate.
- The player begins on level 10 and must descend through the hotel.
- At the start of each new game, the player's initial position is chosen randomly from the 10 room doorways on level 10.
- One randomly selected room location on level 1 also has the hotel's exit.
- The exit is a separate hallway feature called the `Front Door`, not a room.
- The Front Door is always locked at the beginning of a game and requires one Key.
- Reaching its location reveals the locked Front Door immediately; no search is required.
- Unlocking it consumes one Key and one turn. Exiting is then a separate action.
- The room at that hallway position still exists and may be searched independently.
- The downward stairwell on level 6 and the downward stairwell on level 3 always begin locked.
- Each locked stairwell can be opened with one Key, consuming the Key and one turn.
- A locked stairwell can instead be forced open with an owned Club, consuming one turn and permanently breaking and removing that Club.
- Unlocking or forcing a stairwell does not move the player; descending remains a separate action.

## Rooms and Exploration

- Every room can be listened at repeatedly.
- Each listening attempt consumes one turn and makes a new independent attempt to detect an enemy inside.
- A Skeleton is heard with a 50% chance per listening attempt.
- A Zombie is heard with a 25% chance per listening attempt.
- Hearing nothing does not guarantee that the room is empty.
- A successful listening message warns only that something is inside and does not identify whether it is a Zombie or Skeleton.
- Listening can detect an unrevealed Zombie or Skeleton while it is still inside the room; it never reveals a special monster waiting outside.
- Choosing to search from a doorway both enters and searches the room as one action costing one turn.
- If an enemy is inside, it interrupts that search, emerges into the hallway, and starts an encounter instead.
- When the interrupting enemy is killed, the room is searched automatically without requiring or charging another action.
- Escaping before defeating the enemy leaves the room unsearched.
- Most room searches find nothing.
- Some rooms contain a Zombie or Skeleton.
- Rooms may contain useful items that are discovered by searching.
- A room can contain at most one loot placement: food, a Key, an ordinary weapon cache, the gun, the silver sword, or a bullet cache.
- Loot placements must never overlap; for example, the gun and bullets cannot be in the same room.
- A room containing a Zombie or Skeleton may also contain one loot placement, which is found after the enemy is killed and the interrupted search completes.
- Any food, weapon, special weapon, or ammunition found during a successful search is picked up automatically.
- The game must track whether a room has already been searched and what remains inside it.
- After a successful search, the room is permanently marked as searched.
- Search and listen actions are no longer offered at a searched room.

### Food

- Each level contains 0, 1, or 2 food items.
- Food is carried in the inventory as a single item type with a quantity.
- When at least one unit is carried, `E` is the contextual command to eat food.
- Eating consumes one unit of food, restores a randomly determined 2 to 4 health points, and consumes one turn.
- Player health cannot exceed the maximum of 10; excess healing is discarded.
- The `E` action is not offered while the player is already at 10 health.
- The player may eat during combat when food is carried and health is below 10.
- Eating during combat uses the player's action, after which the surviving creature makes its normal attack attempt.

### Weapons and Ammunition

Searchable weapon and ammunition types include:

- Bat
- Club
- Wooden Stake
- Knife
- Bullets, found in quantities of 1 to 3
- Gun, located in one special room on level 3 through 10
- Silver sword, located in a different special room on level 1 through 5

The gun room and silver-sword room must be distinct.

- The special gun and silver sword do not count as ordinary weapon caches.
- Each level contains exactly one ordinary weapon cache, for 10 ordinary weapon caches across the hotel.
- Ordinary weapon caches contain bats, clubs, wooden stakes, or knives.
- Across the 10 ordinary caches there are exactly 3 bats, 3 clubs, 2 wooden stakes, and 2 knives, assigned randomly among the levels.
- Five additional bullet caches are placed randomly across the hotel.
- Each bullet cache contains 1 to 3 bullets.
- Exactly three generic Keys are placed as loot: one on level 3 or 4, one on level 6 or 7, and one on level 1 or 2.
- Any Key can open either locked stairwell or the Front Door and is consumed when used.
- Keys may be guarded by ordinary room enemies like any other loot.

- The player can always punch when no weapon is available or selected.
- A successful punch inflicts 1 damage.
- `Fists` are always present in the ready-weapon menu and are the player's initial readied weapon.
- A successful bat hit inflicts 1 to 2 damage.
- A successful club hit inflicts 1 to 3 damage.
- When a Club is readied and both Matches and Cloth are carried, `B` burns the Club. This consumes one turn, the Matches, the Cloth, and the Club, then adds and automatically readies a Torch.
- The Torch remains a carried weapon, attacks like a Club for 1 to 3 damage with 50% accuracy, and cannot force a locked stairwell.
- Burning a Club during combat gives the engaged creature its normal attack for that turn.
- A successful knife hit inflicts 2 to 3 damage.
- A successful wooden-stake hit inflicts 1 damage.
- A successful silver-sword hit inflicts 2 to 5 damage.
- The gun has a 75% chance to hit and inflicts 3 to 6 damage on a successful shot.
- The first gunshot fired at each individual creature surprises it, whether the shot hits or misses.
- A surprised creature does not counterattack after that first shot, and the player's immediately following flee action succeeds without a creature attack.
- The surprise opportunity works only once per creature. Taking a non-flee action gives up the dodge opening.
- Every shot consumes 1 bullet, whether it hits or misses.
- The gun cannot be fired with no bullets remaining.
- If the gun is readied with no bullets, attacking is unavailable. The player must spend a turn using `R` to ready Fists or another carried weapon.
- The gun is treated as always loaded with all remaining ammunition; reloading is not an action.
- The player can carry any number of bullets.
- The player may carry every weapon they find; there is no weapon inventory limit.
- Weapon inventory records ownership by type rather than storing duplicate copies.
- Finding a weapon type already owned does not add another copy and displays `But you already have a X`, substituting the weapon name for `X`.
- The room is still considered searched and the duplicate loot is removed.
- Only one weapon can be readied at a time.
- When the player collects their first weapon, it is readied automatically without consuming an additional turn.
- Automatic readying displays the same confirmation message as manual readying.
- When available, `R` is the contextual command to ready a weapon.
- Choosing `R` opens a numbered list of carried weapons, and the player selects one with a single digit from `1` through `9`.
- The complete ready-and-select operation consumes one turn; choosing the digit does not consume a second turn.
- Attacks use the currently readied weapon, subject to its special requirements such as gun ammunition.
- The player may ready a different weapon during combat.
- Readying during combat uses the player's action, after which the surviving creature makes its normal attack attempt.

## Combat Rules

- Unless a specific trait or weapon says otherwise, every player and monster attack has a 50% chance to hit.
- A missed attack still consumes the action and advances combat normally.
- Damage is applied only on a successful hit.
- Enemy hit-point totals are not displayed during combat.
- Hits, misses, worsening condition, and defeat are conveyed through narrative messages.

## Enemies

### Monster Drops

- Defeated monsters make one mutually exclusive drop roll, and any result is collected automatically in addition to room loot.
- Zombies: 5% Key, 5% one bullet, 40% Food, 5% Cloth, and 45% nothing.
- Skeletons: 5% Key, 5% one bullet, 40% Food, 5% Matches, and 45% nothing.
- Matches and Cloth are unique supplies. A duplicate drop is not added again.
- Cloth can be consumed with `C` while the player is injured, healing 1 to 2 health up to the maximum of 10. Using Cloth costs one turn and gives an engaged creature its normal attack.
- Consumed Cloth is no longer available for making a Torch. Matches have no separate use.
- Vampire: 25% Key, 5% one bullet, 40% Food, and 30% nothing.
- Frankenstein: 50% Key and 50% nothing.
- Werewolf: 80% Food and 20% nothing.

### Room Enemies

- Each new game places a random total of 10 to 20 ordinary enemies across the hotel.
- The generated group is split approximately 50/50 between Zombies and Skeletons.
- Ordinary enemies may be distributed across levels without a per-level limit.
- A room can initially contain at most one ordinary enemy.
- Zombies have 5 hit points and inflict 1 to 2 damage when they hit.
- Skeletons have 3 hit points and inflict 1 damage when they hit.
- Zombies and Skeletons begin inside rooms.
- Attempting to search an occupied room reveals its ordinary enemy; the creature moves into the hallway and begins an encounter.
- If an occupied room contains loot, that loot is announced when the creature emerges, but cannot be collected until the creature is defeated.
- Once revealed, the creature remains an active problem at that hallway location until killed.
- If the player later returns to that hallway location, the creature automatically restarts the encounter.
- The revealed enemy must be killed before its room can be searched successfully.
- On entering, the player is warned about the creature before choosing an action.
- During combat, the player acts first and may attack or run.
- If the creature survives the player's action, it attacks the player.
- Running always exposes the player to one creature attack before the escape completes.
- Combat continues as an exchange of blows until the creature dies, the player dies, or the player escapes.
- The player may escape instead of continuing the fight.
- Escaping requires choosing left or right and, after the creature's attack, moves the player to the adjacent hallway position in that direction.
- Only directions with an adjacent doorway are offered.
- If stairs or the Front Door are present at the encounter location, they are also valid escape actions.
- A surviving creature attacks before a stair or Front Door escape completes.
- If that attack kills the player, the selected escape fails and the player loses.
- Taking stairs during an encounter does not remove the creature; returning through those stairs automatically resumes combat.
- Escaping does not remove the creature; it remains at that hallway location for a later encounter.
- Any damage already inflicted on an escaped creature is retained when the player encounters it again.

### Special Monsters

Three unique monsters are placed on random levels:

- Frankenstein
- Werewolf
- Vampire

Placement and encounter rules:

- The three monsters must be on three different levels; two special monsters can never appear on the same level.
- Each special monster waits outside one of the rooms on its assigned level.
- Special monsters are never inside rooms and do not require a search action to reveal.
- Arriving at a special monster's hallway position starts combat immediately.
- Returning after an escape also restarts combat immediately.
- A special monster's guarded room may also contain a Zombie or Skeleton inside.
- A special monster always blocks access to its guarded room until defeated.
- If the room also contains an ordinary enemy, the outside special monster is fought first.
- Defeating the special monster does not search the room automatically. A later search action enters the room and reveals its Zombie or Skeleton.
- Killing that ordinary enemy then completes the interrupted room search automatically.
- On the player's next action after arrival, the contextual choices include attacking with the currently readied weapon or fleeing using an available route.
- After either choice, a surviving special monster gets one attack against the player.
- Moving left or right completes the escape after the monster's attack.
- While the encounter remains active, the player cannot search the guarded room normally.

Special traits:

- **Frankenstein:** Extremely tough, has 30 hit points, and inflicts 1 to 6 damage on a successful hit. Attacking him with a readied Torch makes him flee immediately, clearing the hallway without a counterattack or monster drop.
- **Werewolf:** Has 10 hit points, inflicts 2 to 4 damage on a successful hit, and can take damage only from the silver sword. All other attacks inflict no damage.
- **Vampire:** Starts with and cannot exceed 10 hit points. It inflicts 1 to 3 damage on a successful hit, and each successful hit against the player restores 1 of its health up to that maximum. It cannot be reduced below 1 hit point unless the attack that would finish it is made with the wooden stake.

## Core Interaction

The game follows the turn-based style of early computer games:

1. Present a short summary of the player's current surroundings and situation.
2. Display the player's current health and any other relevant status.
3. Present only the actions that apply to the current situation.
4. Assign each action a unique single-character keyboard command.
5. Wait for the player to press the corresponding key; no Enter key should be required.
6. Resolve that action, advance the situation, and present the next turn.

Command letters must never be duplicated within the same list of options. The available actions may change from turn to turn according to the player's location and circumstances.

### Action Keys

- `<` - move or flee left
- `>` - move or flee right
- `S` - search the current room
- `L` - listen at the current room
- `U` - take stairs up
- `D` - take stairs down
- `X` - exit through the Front Door
- `A` - attack with the currently readied weapon, or punch when unarmed
- `R` - ready a carried weapon
- `E` - eat one unit of food
- `I` - view inventory
- `K` - use a Key on a lock
- `F` - force a locked stairwell with an owned Club
- `B` - burn a readied Club when Matches and Cloth are carried
- `C` - use Cloth to heal 1 to 2 health

Only actions valid in the current situation are displayed and accepted.
- Attack is always the first displayed action during combat. When present, `<` and `>` follow Attack and precede every other action; outside combat they are the first displayed actions.
- Gameplay actions are keyboard-only; prompts are not clickable mouse or touch controls.
- Comma (`,`) is an alias for `<`, and period (`.`) is an alias for `>`.
- Left Arrow and Right Arrow are aliases for horizontal movement.
- Up Arrow and Down Arrow take visible, usable stairs in the corresponding direction; otherwise they do nothing.

### Status and Inventory

- The persistent status display shows current health, turns remaining, and the readied weapon.
- The bottom action area always reserves enough height for three rows of prompts so changing contextual choices does not shift the history or status display.
- Food quantity, bullet count, Key count, Matches, Cloth, and all owned weapon types are shown in an inventory view opened with `I`.
- Food, bullets, and the full owned-weapon list are not part of the persistent status display.
- Viewing inventory is free: it consumes no turn and does not give an engaged creature an attack.
- Pressing `I` again closes the inventory and returns to the unchanged current situation, also for free.

### Title and Instructions

- The game opens on a `Hotel of Horror` title screen rather than starting immediately.
- The title screen provides single-key options to choose difficulty and view instructions.
- `E` starts Easy with 200 turns, `M` starts Medium with 150 turns, and `H` starts Hard with 100 turns.
- The instructions explain the objective, status display, action keys, combat basics, inventory, and Death countdown.

### End of Game

- A win or loss displays `Restart? (Y/N)`.
- `Y` immediately starts a fresh randomized game at the same difficulty.
- `N` returns to the title screen.
- Responding to the restart prompt does not consume a gameplay turn.

## Death Countdown

- The starting countdown is determined by difficulty: Easy has 200 turns, Medium has 150, and Hard has 100.
- The exact number of turns remaining is always displayed.
- Every action selected by pressing its assigned key consumes one turn.
- When the counter reaches zero, Death swoops in and kills the player immediately.
- When 5 or fewer turns remain, the game warns the player that Death is coming.
- The player must escape the hotel before the final turn expires.
- Exception: if exactly 1 turn remains, choosing the exit wins even though that action reduces the counter to zero; escape resolves before Death.

## Victory and Defeat

- The player wins by using the exit on level 1 with at least 1 turn showing when the action is selected.
- The player loses if their health reaches zero or Death arrives when the turn counter reaches zero.

## Future Play-Test Decisions

The first playable version is fully specified. These values can be revisited after play-testing:

- Whether the three difficulty limits give the desired progression after hands-on play.
- Enemy, food, and item placement balance.
- Weapon damage and monster difficulty.
- Narrative variety and pacing.
- Any desired expansion beyond the initial ZX81-inspired version.

## Implementation Stages

1. [x] Record the gameplay rules and resolve blocking ambiguities.
2. [x] Build the playable core loop.
3. [x] Add the ZX81-style display, local typography, and responsive scaling.
4. [x] Add title, instructions, inventory, combat, and restart flows.
5. [x] Run automated checks across randomized games.
6. [ ] Play-test and tune pacing after hands-on feedback.

## Definition of Done

- A player can download or copy the directory and start the game by opening `index.html`.
- The complete game works without Node.js, installation, a server, or internet access.
- The documented controls, rules, win state, and loss state all work.
- Text and graphics remain legible while clearly evoking the ZX81.
- Restarting or starting a new game does not require reloading the browser manually.
- The browser console shows no errors during normal play.

## Open Questions

No blocking design questions remain for the first playable version.
