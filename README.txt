HOTEL OF HORROR
===============

Hotel of Horror is a keyboard-only, turn-based horror game inspired by games
written for the Sinclair ZX81. It runs entirely inside a web browser from local
files. No web server, package installation, or Node.js runtime is required to
play.


THE GAME
--------

You wake on the tenth floor of a ten-level hotel with no memory of how you got
there. Your goal is to descend through the hotel, find the locked Front Door on
level 1, and escape before Death's turn counter reaches zero.

WARNING: Spoilers Follow. Play the Game First at https://lesink.com/hotelofhorror






























Each floor has ten room positions. Search rooms for keys, food, ammunition,
weapons, and stranger supplies while dealing with Zombies, Skeletons, and three
special monsters: Frankenstein, the Werewolf, and the Vampire. Combat and most
other actions consume one turn. The hotel layout, enemies, stairs, exit, and
loot are randomized for every game.

The title screen offers three difficulty levels:

  Easy     200 turns
  Medium   150 turns
  Hard     100 turns

To play, open index.html directly in a modern browser. Chrome, Edge, and Firefox
all support the local-file approach used by the game. Press a displayed action
key without pressing Enter. The in-game Instructions screen explains movement,
combat, inventory, locked doors, and keyboard aliases.


CODE ORGANIZATION
-----------------

  index.html
      Contains the title, instructions, gameplay, inventory overlay, and
      game-over screen structure. It loads style.css and game.js.

  style.css
      Defines the black-and-white ZX81-inspired presentation, responsive game
      cabinet, scrolling history, fixed-height action area, overlays, and the
      faded treatment for messages from earlier actions.

  game.js
      Contains all browser game logic: procedural hotel generation, state,
      movement, searching, loot, inventory, combat, special-monster rules,
      keyboard input, narrative history, and rendering. It has no external
      JavaScript dependencies.

  PLAN.md
      Records the agreed design and detailed gameplay rules.

  assets/hotel-zx81.ttf
      The local bitmap-style font used by the interface.

  assets/FONT-LICENSE.txt
      Licensing information for the font.

  tools/generate_font.py
      Development utility used to generate the local font asset.

  tests/smoke-test.js
      Node-based development test harness. It checks hotel generation,
      keyboard controls, action ordering, combat and Torch behavior, Cloth
      healing, message fading, scrolling, and randomized state transitions.

  tools/estimate_current_game.js
      Monte Carlo simulator for the current locked-door game and its player
      strategies.

  tools/estimate_speedrun.js
      Historical simulator for the earlier unlocked-door rules. Its results do
      not represent the current game balance.


RUNNING TESTS
-------------

Node.js is optional and is needed only for tests and simulations. From the
project directory, run:

  node tests/smoke-test.js

Basic JavaScript syntax can also be checked with:

  node --check game.js
  node --check tools/estimate_current_game.js


RUNNING THE CURRENT SIMULATION
------------------------------

The current Monte Carlo simulator accepts these positional arguments:

  node tools/estimate_current_game.js [trials] [seed] [turn-limit] [policy]

  trials
      Number of independently generated games. Default: 250000.

  seed
      Unsigned integer random seed. Reusing it makes a run reproducible.

  turn-limit
      Starting number of turns. Use 200 for Easy, 150 for Medium, or 100 for
      Hard. Default: 100.

  policy
      Use aggressive to fight most creatures encountered, retreating at low
      health without healing supplies. Any other value, including selective,
      uses the selective strategy, which fights mainly for useful or required
      loot. Default: selective.

Examples:

  node tools/estimate_current_game.js 50000 1179795788 200 selective
  node tools/estimate_current_game.js 50000 1179795788 150 selective
  node tools/estimate_current_game.js 50000 1179795788 100 aggressive

The simulator prints JSON containing the strategy, trial count, seed, turn
limit, number of wins, estimated win probability, a 95% confidence interval,
failure causes, and statistics for successful runs.

The reported percentage is an estimate for the scripted policy, not a single
intrinsic win probability for every human play style. More trials reduce random
sampling noise but take longer to run.


RUNNING THE HISTORICAL SIMULATION
---------------------------------

The original pre-lock speed-run model accepts an optional trial count and seed:

  node tools/estimate_speedrun.js [trials] [seed]

For example:

  node tools/estimate_speedrun.js 100000 1213158469

This script is retained for comparison only. Use estimate_current_game.js when
evaluating the current version of Hotel of Horror.
