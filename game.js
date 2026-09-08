(function () {
  "use strict";

  const MAX_HEALTH = 10;
  const DIFFICULTIES = {
    "Easy": 200,
    "Medium": 150,
    "Hard": 100
  };
  const LOCKED_STAIR_LEVELS = [3, 6];
  const WEAPON_ORDER = ["Fists", "Fork", "Club", "Torch", "Wooden Stake", "Knife", "Gun", "Silver Sword"];
  const WEAPONS = {
    "Fists": { accuracy: 0.50, min: 1, max: 1 },
    "Fork": { accuracy: 0.50, min: 1, max: 2 },
    "Club": { accuracy: 0.50, min: 1, max: 3 },
    "Torch": { accuracy: 0.50, min: 1, max: 3 },
    "Wooden Stake": { accuracy: 0.50, min: 1, max: 1 },
    "Knife": { accuracy: 0.50, min: 2, max: 3 },
    "Gun": { accuracy: 0.75, min: 3, max: 6 },
    "Silver Sword": { accuracy: 0.50, min: 2, max: 5 }
  };
  const MONSTERS = {
    "Zombie": { hp: 5, min: 1, max: 2 },
    "Skeleton": { hp: 3, min: 1, max: 1 },
    "Frankenstein": { hp: 30, min: 1, max: 6 },
    "Werewolf": { hp: 10, min: 2, max: 4 },
    "Vampire": { hp: 10, min: 1, max: 3 }
  };
  const SEARCH_SCENES = [
    "You check beneath a bed whose mattress appears to be breathing.",
    "You pull open a wardrobe. Something inside politely moves farther back.",
    "You inspect the bathroom. The mirror refuses to show your reflection for a moment.",
    "You search behind curtains stiff with dust and possibly ancient gravy.",
    "You lift the rug. The floorboards underneath spell RUN in old scratches.",
    "You investigate a luggage rack holding one invisible suitcase.",
    "You peer into the bathtub. It is dry, cold, and wearing a shower cap.",
    "You search the bedside cabinet while its telephone whispers room service specials.",
    "You prod a suspicious mound of blankets. It snores, then thinks better of it.",
    "You examine every corner while the wallpaper quietly peels away from you.",
    "You look behind a portrait whose painted eyes are trying much too hard to seem innocent.",
    "You search the minibar. A tiny handwritten sign says GUESTS ARE THE SNACKS.",
    "You rummage through a dresser whose drawers groan in their sleep.",
    "You kneel beside the radiator. It ticks like a nervous metal heart.",
    "You open the nightstand while the lamp leans over to watch.",
    "You lift every pillow. One seems oddly reluctant to be moved.",
    "You examine the writing desk. Its ink blot looks freshly frightened.",
    "You check a hollow bedpost and hear something scuttle deeper inside.",
    "You peer behind the shower curtain. The curtain peers back somehow.",
    "You inspect an ice bucket containing warm water and one perfect snowflake.",
    "You crawl beneath the bed while the bed politely pretends not to notice.",
    "You test a loose wall panel. The knocking behind it immediately stops.",
    "You search the coat closet among garments that sway without a breeze.",
    "You investigate a cracked television showing static from tomorrow.",
    "You squeeze behind an armchair that sighs when you touch it.",
    "You check inside the lampshade. The bulb whispers that it saw nothing.",
    "You push aside a ceiling tile and quickly reconsider looking upward.",
    "You open an abandoned suitcase. It exhales the air of a distant country.",
    "You search the vanity while your reflection searches you.",
    "You check the wastebasket. Something at the bottom circles once.",
    "You look beneath the sink where the pipes twist into an unhappy smile.",
    "You explore the minibar as its tiny bottles clink out a warning.",
    "You unfold the towels. Each one has been monogrammed with HELP.",
    "You search the curtain hems while shadows gather on the wrong side.",
    "You examine the back of a painting. The wall beneath is warm.",
    "You probe a torn mattress seam that tries to pinch your fingers.",
    "You check a pair of shoes positioned as if their owner vanished mid-step.",
    "You inspect a room-service cart whose covered tray softly rattles.",
    "You search a laundry bag that smells of soap, smoke, and thunderstorms.",
    "You examine the air vent. A tiny voice asks whether checkout is near.",
    "You check a dusty flower vase. The dead flowers turn toward you.",
    "You open the Gideon drawer. Something has added a thirteenth commandment.",
    "You feel along the carpet edge as the pattern wriggles away.",
    "You search a dented footlocker chained to absolutely nothing.",
    "You examine the chandelier one dangling crystal at a time.",
    "You inspect an umbrella stand full of long, suspicious shadows.",
    "You check behind the headboard and find scratch marks facing inward.",
    "You open a tiny wall safe that yawns wider than its hinges allow.",
    "You search the pockets of a bathrobe that appears to be occupied.",
    "You pry at a loose floorboard. Cold air breathes through the gap.",
    "You reach behind the radiator and disturb a committee of silverfish.",
    "You examine a stack of newspapers reporting your arrival tomorrow.",
    "You search a sewing kit whose needles all point toward the door.",
    "You peer inside a pillowcase. Something has written GOOD NIGHT within.",
    "You check a cracked teapot that smells strongly of graveyard soil.",
    "You investigate a dumbwaiter hatch. A dinner bell rings far below.",
    "You search beneath the desk blotter and hear paper being folded nearby.",
    "You examine the sealed connecting door. Someone examines it from the other side.",
    "You inspect a wall clock whose hands spin faster whenever you blink.",
    "You search an old steamer trunk lined with maps of impossible coastlines.",
    "You look inside the toilet cistern. The water reflects a moonless sky.",
    "You inspect the fire-extinguisher cabinet while distant alarms chuckle."
  ];
  const EMPTY_ROOM_RESULTS = [
    "Nothing useful. The dust is complimentary.",
    "You find only a mint old enough to vote.",
    "Nothing but three coat hangers arranged in a threatening manner.",
    "You find a room-service menu. Every dish is crossed out except YOU.",
    "Nothing useful turns up, though something under the bed giggles.",
    "The drawers contain lint, gloom, and one very judgmental spider.",
    "You find no supplies. The wallpaper seems pleased about this.",
    "Nothing. Even the cobwebs have checked out.",
    "You discover a Gideon Bible with all the happy endings removed.",
    "No loot here. A cold spot follows you back into the hallway.",
    "You find a single black sock. It is not yours. You hope.",
    "Nothing useful, unless mildew becomes legal tender.",
    "You find only a hotel receipt charging extra for screaming.",
    "Nothing but a dead moth wearing an expression of profound relief.",
    "You find a bottle marked SHAMPOO FOR DEPARTED GUESTS. It is empty.",
    "Only a bent coat hanger shaped like a question mark remains.",
    "You discover one button and no evidence of what once wore it.",
    "Nothing useful, just half a crossword with every answer listed as RUN.",
    "You find an unplugged alarm clock that still insists it is midnight.",
    "Only a dust bunny large enough to require its own room number.",
    "You uncover a postcard reading WISH YOU WEREN'T HERE.",
    "Nothing but a bar of soap carved into a tiny tombstone.",
    "You find an old menu where all prices are listed in years.",
    "Only a cobweb arranged like a map of the hallway outside.",
    "You discover a curtain cord tied into a very nervous knot.",
    "Nothing useful, just a bottle cap stamped DO NOT OPEN.",
    "You find a television remote with a single button marked FLEE.",
    "Only a guest complaint card filled out in red crayon.",
    "You uncover one tarnished cufflink engraved with the word LEFT.",
    "Nothing but a paper crown sized for an unusually small ghost.",
    "You find a broken umbrella that is wet despite the dry room.",
    "Only a laundry ticket claiming one invisible sheet.",
    "You pull open a false drawer. Behind it is a more convincing wall.",
    "Nothing useful, just a plastic flower that smells faintly of thunder.",
    "You find an old coin firmly glued heads-down to the floor.",
    "Only a cracked teacup with a fresh lipstick mark on the rim.",
    "You uncover a luggage label addressed to NO ONE, NOWHERE.",
    "Nothing but a pillow tag warning against prolonged eye contact.",
    "You find a comb with far too many teeth and wisely leave it.",
    "Only a telephone directory listing the same number for every guest.",
    "You discover a desk fan that turns slowly toward you while unplugged.",
    "Nothing useful, just a bath plug attached to an impossibly long chain.",
    "You find one domino with skulls instead of dots.",
    "Only a cold puddle of candle wax shaped like the hotel.",
    "You uncover a service bell whose clapper has been carefully removed.",
    "Nothing but a shoelace tied around a handwritten apology.",
    "You find a napkin folded into a bat that refuses to unfold.",
    "Only a packet of sugar that has petrified into a tiny brick.",
    "You discover a moth-eaten doily depicting your current expression.",
    "Nothing useful, just a cork from a bottle labeled BAD IDEA.",
    "You find three marbles. A fourth rolls away before you can count it.",
    "Only a hotel pen that runs out of ink halfway through the word HELP.",
    "You uncover a blank postcard already bearing tomorrow's postmark.",
    "Nothing but a cracked magnifying lens that makes everything smaller.",
    "You find a paperclip twisted into the shape of a tiny staircase.",
    "Only a curtain ring that feels unpleasantly warm.",
    "You discover an empty envelope addressed in your own handwriting.",
    "Nothing useful, just a loose mattress spring humming a funeral march.",
    "You find a wooden nickel bearing the hotel manager's fanged portrait.",
    "Only an instruction card reading PLEASE DO NOT SEARCH THE ROOM.",
    "You uncover a tiny white flag. Something beneath the floor surrenders.",
    "Nothing. The dust settles back into place with theatrical disappointment."
  ];

  const ui = {
    game: document.getElementById("game"),
    title: document.getElementById("title-screen"),
    instructions: document.getElementById("instructions-screen"),
    play: document.getElementById("play-screen"),
    gameover: document.getElementById("gameover-screen"),
    titleOptions: document.getElementById("title-options"),
    instructionsOptions: document.getElementById("instructions-options"),
    status: document.getElementById("status"),
    location: document.getElementById("location"),
    history: document.getElementById("history"),
    overlay: document.getElementById("overlay"),
    actions: document.getElementById("actions"),
    gameoverKicker: document.getElementById("gameover-kicker"),
    gameoverTitle: document.getElementById("gameover-title"),
    gameoverCopy: document.getElementById("gameover-copy"),
    gameoverOptions: document.getElementById("gameover-options")
  };

  let state = createShellState();

  function createShellState() {
    return {
      mode: "title",
      difficulty: null,
      returnMode: "playing",
      hotel: null,
      level: 10,
      position: 1,
      health: MAX_HEALTH,
      turns: 0,
      food: 0,
      bullets: 0,
      keys: 0,
      matches: false,
      cloth: false,
      weapons: new Set(["Fists"]),
      readied: "Fists",
      foundFirstWeapon: false,
      activeEnemy: null,
      history: [],
      messageBatch: 0,
      ending: null
    };
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomChoice(items) {
    return items[randomInt(0, items.length - 1)];
  }

  function shuffle(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = randomInt(0, index);
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function roomKey(level, position) {
    return level + ":" + position;
  }

  function roomNumber(level, position) {
    return String(level).padStart(2, "0") + String(position).padStart(2, "0");
  }

  function makeEnemy(kind, special) {
    const profile = MONSTERS[kind];
    return {
      kind: kind,
      hp: profile.hp,
      maxHp: profile.hp,
      minDamage: profile.min,
      maxDamage: profile.max,
      alive: true,
      revealed: Boolean(special),
      special: Boolean(special),
      gunSurpriseUsed: false,
      surprised: false
    };
  }

  function generateHotel() {
    const hotel = {
      rooms: {},
      stairsDown: {},
      exitPosition: randomInt(1, 10),
      frontDoorLocked: true,
      lockedStairs: { 3: true, 6: true },
      specials: {}
    };

    for (let level = 1; level <= 10; level += 1) {
      for (let position = 1; position <= 10; position += 1) {
        hotel.rooms[roomKey(level, position)] = {
          level: level,
          position: position,
          searched: false,
          loot: null,
          enemy: null
        };
      }
    }

    for (let level = 2; level <= 10; level += 1) {
      hotel.stairsDown[level] = randomInt(1, 10);
    }

    const commonWeapons = shuffle([
      "Fork", "Fork", "Fork",
      "Club", "Club", "Club",
      "Wooden Stake", "Wooden Stake",
      "Knife", "Knife"
    ]);
    for (let level = 1; level <= 10; level += 1) {
      placeLoot(hotel, { type: "weapon", name: commonWeapons[level - 1] }, [level]);
    }

    placeLoot(hotel, { type: "weapon", name: "Gun" }, shuffle([3, 4, 5, 6, 7, 8, 9, 10]));
    placeLoot(hotel, { type: "weapon", name: "Silver Sword" }, shuffle([1, 2, 3, 4, 5]));

    for (let level = 1; level <= 10; level += 1) {
      const foodCount = randomInt(0, 2);
      for (let count = 0; count < foodCount; count += 1) {
        placeLoot(hotel, { type: "food", amount: 1 }, [level]);
      }
    }

    for (let count = 0; count < 5; count += 1) {
      placeLoot(hotel, { type: "bullets", amount: randomInt(1, 3) }, shuffle([1,2,3,4,5,6,7,8,9,10]));
    }

    placeLoot(hotel, { type: "key", amount: 1 }, shuffle([3, 4]));
    placeLoot(hotel, { type: "key", amount: 1 }, shuffle([6, 7]));
    placeLoot(hotel, { type: "key", amount: 1 }, shuffle([1, 2]));

    const ordinaryCount = randomInt(10, 20);
    const ordinaryKinds = [];
    const zombies = Math.floor(ordinaryCount / 2);
    for (let count = 0; count < ordinaryCount; count += 1) {
      ordinaryKinds.push(count < zombies ? "Zombie" : "Skeleton");
    }
    const enemyRooms = shuffle(Object.values(hotel.rooms)).slice(0, ordinaryCount);
    shuffle(ordinaryKinds).forEach(function (kind, index) {
      enemyRooms[index].enemy = makeEnemy(kind, false);
    });

    const specialLevels = shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 3);
    ["Frankenstein", "Werewolf", "Vampire"].forEach(function (kind, index) {
      const level = specialLevels[index];
      const position = randomInt(1, 10);
      hotel.specials[roomKey(level, position)] = makeEnemy(kind, true);
    });

    validateHotel(hotel);
    return hotel;
  }

  function placeLoot(hotel, loot, preferredLevels) {
    const candidates = [];
    preferredLevels.forEach(function (level) {
      for (let position = 1; position <= 10; position += 1) {
        const room = hotel.rooms[roomKey(level, position)];
        if (!room.loot) candidates.push(room);
      }
    });
    if (!candidates.length) throw new Error("No valid room remains for loot placement.");
    candidates[randomInt(0, candidates.length - 1)].loot = loot;
  }

  function validateHotel(hotel) {
    const rooms = Object.values(hotel.rooms);
    const loot = rooms.filter(function (room) { return room.loot; }).map(function (room) { return room.loot; });
    const common = loot.filter(function (item) {
      return item.type === "weapon" && ["Fork", "Club", "Wooden Stake", "Knife"].includes(item.name);
    });
    const ordinary = rooms.filter(function (room) { return room.enemy; });
    const specials = Object.entries(hotel.specials);
    const specialLevels = specials.map(function (entry) { return Number(entry[0].split(":")[0]); });
    const gunRoom = rooms.find(function (room) { return room.loot && room.loot.name === "Gun"; });
    const swordRoom = rooms.find(function (room) { return room.loot && room.loot.name === "Silver Sword"; });
    const keyRooms = rooms.filter(function (room) { return room.loot && room.loot.type === "key"; });

    if (rooms.length !== 100) throw new Error("Hotel must contain 100 rooms.");
    if (Object.keys(hotel.stairsDown).length !== 9) throw new Error("Hotel must contain nine down stairways.");
    if (common.length !== 10) throw new Error("Hotel must contain ten common weapon caches.");
    if (loot.filter(function (item) { return item.type === "bullets"; }).length !== 5) throw new Error("Hotel must contain five bullet caches.");
    if (!gunRoom || gunRoom.level < 3) throw new Error("Gun placement is invalid.");
    if (!swordRoom || swordRoom.level > 5) throw new Error("Silver sword placement is invalid.");
    if (keyRooms.length !== 3) throw new Error("Hotel must contain three keys.");
    if (!keyRooms.some(function (room) { return room.level === 3 || room.level === 4; })) throw new Error("Level 3/4 key is missing.");
    if (!keyRooms.some(function (room) { return room.level === 6 || room.level === 7; })) throw new Error("Level 6/7 key is missing.");
    if (!keyRooms.some(function (room) { return room.level === 1 || room.level === 2; })) throw new Error("Level 1/2 key is missing.");
    if (ordinary.length < 10 || ordinary.length > 20) throw new Error("Ordinary enemy count is invalid.");
    if (specials.length !== 3 || new Set(specialLevels).size !== 3) throw new Error("Special monsters must occupy distinct levels.");
  }

  function getRoom() {
    return state.hotel.rooms[roomKey(state.level, state.position)];
  }

  function getSpecial() {
    if (!state.hotel) return null;
    const monster = state.hotel.specials[roomKey(state.level, state.position)];
    return monster && monster.alive ? monster : null;
  }

  function getOrdinary() {
    if (!state.hotel) return null;
    const monster = getRoom().enemy;
    return monster && monster.alive && monster.revealed ? monster : null;
  }

  function getActiveEnemy() {
    if (!state.activeEnemy) return null;
    const monster = state.activeEnemy.special ? getSpecial() : getOrdinary();
    if (!monster || monster.kind !== state.activeEnemy.kind) {
      state.activeEnemy = null;
      return null;
    }
    return monster;
  }

  function newGame(difficulty) {
    const selectedDifficulty = difficulty || state.difficulty || "Medium";
    state = createShellState();
    state.mode = "playing";
    state.difficulty = selectedDifficulty;
    state.turns = DIFFICULTIES[selectedDifficulty];
    state.hotel = generateHotel();
    state.position = randomInt(1, 10);
    addMessage("You wake beneath a buzzing hallway light. Your memory is blank. Somewhere far below, the Front Door waits.", "danger");
    addMessage("You chose " + selectedDifficulty + ". Death will arrive in " + state.turns + " turns. Move quickly.", "event");
    arriveAtLocation(true);
    render();
  }

  function addMessage(text, tone) {
    state.history.push({ text: text, tone: tone || "event", batch: state.messageBatch });
    if (state.history.length > 250) state.history.shift();
  }

  function beginActionMessages() {
    state.messageBatch += 1;
  }

  function arriveAtLocation(initial) {
    const room = getRoom();
    const features = [];
    if (canGoUp()) features.push("stairs leading up");
    if (isAtDownstairs()) features.push(isDownstairsLocked() ? "locked stairs leading down" : "stairs leading down");
    if (isAtExit()) features.push(state.hotel.frontDoorLocked ? "the locked Front Door" : "the open Front Door");

    addMessage((initial ? "You stand" : "You arrive") + " outside room " + roomNumber(state.level, state.position) + "." +
      (features.length ? " Here you find " + joinWords(features) + "." : " The hallway creaks around you."));

    const special = getSpecial();
    const ordinary = getOrdinary();
    if (special) beginEncounter(special, true);
    else if (ordinary) beginEncounter(ordinary, false);
  }

  function joinWords(items) {
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + " and " + items[1];
    return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
  }

  function beginEncounter(enemy, special) {
    state.activeEnemy = { kind: enemy.kind, special: special };
    const introductions = {
      "Zombie": "A Zombie lurches into the hallway, hungry and horribly enthusiastic!",
      "Skeleton": "A Skeleton clatters into the hallway and raises its bony fists!",
      "Frankenstein": "Frankenstein blocks the hallway like a wall in very bad shoes!",
      "Werewolf": "A Werewolf springs from the shadows, all teeth and terrible breath!",
      "Vampire": "The Vampire smiles politely. The fangs are less polite."
    };
    addMessage(introductions[enemy.kind], "danger");
  }

  function canGoUp() {
    return state.level < 10 && state.hotel.stairsDown[state.level + 1] === state.position;
  }

  function canGoDown() {
    return isAtDownstairs() && !isDownstairsLocked();
  }

  function isAtDownstairs() {
    return state.level > 1 && state.hotel.stairsDown[state.level] === state.position;
  }

  function isDownstairsLocked() {
    return Boolean(state.hotel.lockedStairs[state.level]);
  }

  function isAtExit() {
    return state.level === 1 && state.position === state.hotel.exitPosition;
  }

  function spendTurn() {
    state.turns = Math.max(0, state.turns - 1);
    if (state.turns > 0 && state.turns <= 5) {
      addMessage("A cold shadow crosses the ceiling. Death is coming for you. " + state.turns + " turn" + (state.turns === 1 ? "" : "s") + " remain!", "danger");
    }
  }

  function checkDeathCountdown() {
    if (state.turns <= 0 && state.mode !== "gameover") {
      endGame(false, "DEATH HAS ARRIVED", "A black shape swoops down the corridor. Your time in the Hotel of Horror is over.");
      return true;
    }
    return false;
  }

  function moveHorizontal(delta, fromCombat) {
    if (fromCombat) {
      fleeCombat(delta < 0 ? "left" : "right", function () {
        state.position += delta;
        arriveAtLocation(false);
      });
      return;
    }
    spendTurn();
    state.position += delta;
    arriveAtLocation(false);
    checkDeathCountdown();
    render();
  }

  function useStairs(direction, fromCombat) {
    const travel = function () {
      state.level += direction === "up" ? 1 : -1;
      arriveAtLocation(false);
    };
    if (fromCombat) fleeCombat(direction, travel);
    else {
      spendTurn();
      travel();
      checkDeathCountdown();
      render();
    }
  }

  function useExit(fromCombat) {
    if (fromCombat) {
      fleeCombat("through the Front Door", function () {
        endGame(true, "YOU ESCAPED", "The Front Door slams behind you. Dawn has never looked so beautiful.");
      }, true);
      return;
    }
    spendTurn();
    endGame(true, "YOU ESCAPED", "The Front Door slams behind you. Dawn has never looked so beautiful.");
  }

  function unlockWithKey() {
    if (state.keys <= 0) return;
    const unlockingStairs = isAtDownstairs() && isDownstairsLocked();
    const unlockingFrontDoor = isAtExit() && state.hotel.frontDoorLocked;
    if (!unlockingStairs && !unlockingFrontDoor) return;

    const enemy = getActiveEnemy();
    state.keys -= 1;
    spendTurn();
    if (unlockingStairs) {
      state.hotel.lockedStairs[state.level] = false;
      addMessage("The Key turns with a rusty shriek. The stairwell door is unlocked!", "event");
    } else {
      state.hotel.frontDoorLocked = false;
      addMessage("The Key opens the Front Door. Cold night air slips into the lobby!", "event");
    }
    if (enemy) enemy.surprised = false;
    if (!checkDeathCountdown() && enemy) enemyAttack(enemy);
    render();
  }

  function forceStairwell() {
    if (!state.weapons.has("Club") || !isAtDownstairs() || !isDownstairsLocked()) return;
    const enemy = getActiveEnemy();
    spendTurn();
    state.hotel.lockedStairs[state.level] = false;
    state.weapons.delete("Club");
    addMessage("You smash the Club against the lock. The stairwell opens - and the Club breaks in two!", "danger");
    if (state.readied === "Club") {
      state.readied = "Fists";
      addMessage("With the Club gone, you ready your Fists.");
    }
    if (enemy) enemy.surprised = false;
    if (!checkDeathCountdown() && enemy) enemyAttack(enemy);
    render();
  }

  function listenAtRoom() {
    spendTurn();
    const enemy = getRoom().enemy;
    if (enemy && enemy.alive && !enemy.revealed) {
      const chance = enemy.kind === "Skeleton" ? 0.50 : 0.25;
      if (Math.random() < chance) addMessage("You press an ear to the door. Something is moving inside.", "danger");
      else addMessage("You listen carefully. Nothing. Not even suspicious breathing.");
    } else {
      addMessage("You listen carefully. The room is silent.");
    }
    checkDeathCountdown();
  }

  function searchRoom() {
    spendTurn();
    const room = getRoom();
    if (room.enemy && room.enemy.alive && !room.enemy.revealed) {
      room.enemy.revealed = true;
      addMessage("The door opens - and something inside comes out!", "danger");
      if (room.loot) addMessage("Behind it, you can see " + describeLoot(room.loot) + " - but the creature blocks the doorway.", "event");
      beginEncounter(room.enemy, false);
      checkDeathCountdown();
      return;
    }
    completeSearch(room);
    checkDeathCountdown();
  }

  function completeSearch(room, afterCombat) {
    if (room.searched) return;
    room.searched = true;
    if (afterCombat) addMessage("With the hallway clear, you enter room " + roomNumber(room.level, room.position) + ".");
    else addMessage("You enter room " + roomNumber(room.level, room.position) + ".");
    addMessage(randomChoice(SEARCH_SCENES));

    if (!room.loot) {
      addMessage(randomChoice(EMPTY_ROOM_RESULTS));
      return;
    }
    collectLoot(room.loot);
    room.loot = null;
  }

  function collectLoot(loot) {
    if (loot.type === "key") {
      state.keys += loot.amount;
      addMessage("You find a heavy brass Key. Somewhere, a lock is suddenly nervous.", "event");
      return;
    }
    if (loot.type === "food") {
      state.food += loot.amount;
      addMessage("You find Food. It looks questionable, which is still better than deadly.", "event");
      return;
    }
    if (loot.type === "bullets") {
      state.bullets += loot.amount;
      addMessage("You find " + loot.amount + " bullet" + (loot.amount === 1 ? "" : "s") + ".", "event");
      return;
    }
    if (state.weapons.has(loot.name)) {
      addMessage("But you already have a " + loot.name + ".");
      return;
    }
    state.weapons.add(loot.name);
    addMessage("You find a " + loot.name + "!", "event");
    if (!state.foundFirstWeapon) {
      state.foundFirstWeapon = true;
      state.readied = loot.name;
      addMessage("You ready the " + loot.name + ".", "event");
    }
  }

  function describeLoot(loot) {
    if (loot.type === "key") return "a Key";
    if (loot.type === "food") return "Food";
    if (loot.type === "bullets") return loot.amount + " bullet" + (loot.amount === 1 ? "" : "s");
    return "a " + loot.name;
  }

  function attack() {
    const enemy = getActiveEnemy();
    if (!enemy) return;
    const weapon = WEAPONS[state.readied];
    const firstGunshot = state.readied === "Gun" && !enemy.gunSurpriseUsed;
    if (enemy.surprised && !firstGunshot) enemy.surprised = false;
    if (state.readied === "Gun") {
      if (state.bullets <= 0) return;
      state.bullets -= 1;
    }
    spendTurn();

    if (enemy.kind === "Frankenstein" && state.readied === "Torch") {
      enemy.alive = false;
      state.activeEnemy = null;
      addMessage("You thrust the Torch toward Frankenstein. He recoils from the flames!", "danger");
      addMessage("With a frightened howl, Frankenstein crashes away down the hall. The way is clear!", "event");
      checkDeathCountdown();
      render();
      return;
    }

    if (Math.random() >= weapon.accuracy) {
      addMessage("Your " + attackName(state.readied) + " misses the " + enemy.kind + ".");
    } else if (enemy.kind === "Werewolf" && state.readied !== "Silver Sword") {
      addMessage("A perfect hit - but the Werewolf is unharmed. Only silver can wound it!", "danger");
    } else {
      const damage = randomInt(weapon.min, weapon.max);
      let nextHp = enemy.hp - damage;
      if (enemy.kind === "Vampire" && state.readied !== "Wooden Stake" && nextHp < 1) nextHp = 1;
      const dealt = enemy.hp - nextHp;
      enemy.hp = nextHp;
      addMessage("Your " + attackName(state.readied) + " hits the " + enemy.kind + " for " + dealt + " damage.", "event");

      if (enemy.kind === "Vampire" && enemy.hp === 1 && state.readied !== "Wooden Stake" && damage >= dealt) {
        addMessage("The Vampire refuses to fall. It must be finished with the Wooden Stake!", "danger");
      }

      if (enemy.hp <= 0) {
        defeatEnemy(enemy);
        checkDeathCountdown();
        render();
        return;
      }
      describeEnemyCondition(enemy);
    }

    if (firstGunshot && enemy.alive) {
      enemy.gunSurpriseUsed = true;
      enemy.surprised = true;
      addMessage("The first gunshot catches the " + enemy.kind + " by surprise. Now is your chance to dodge past!", "danger");
    }

    if (checkDeathCountdown()) {
      render();
      return;
    }
    if (enemy.surprised) {
      render();
      return;
    }
    enemyAttack(enemy);
    render();
  }

  function attackName(weapon) {
    if (weapon === "Fists") return "punch";
    if (weapon === "Gun") return "shot";
    return weapon;
  }

  function describeEnemyCondition(enemy) {
    const ratio = enemy.hp / enemy.maxHp;
    if (ratio <= 0.25) addMessage("The " + enemy.kind + " is barely holding together.");
    else if (ratio <= 0.5) addMessage("The " + enemy.kind + " looks badly hurt.");
    else if (ratio < 1) addMessage("The " + enemy.kind + " is wounded, but still dangerous.");
    else addMessage("The " + enemy.kind + " looks entirely too healthy.");
  }

  function defeatEnemy(enemy) {
    enemy.alive = false;
    state.activeEnemy = null;
    addMessage("The " + enemy.kind + " collapses. The hallway is clear!", "danger");
    collectMonsterDrop(enemy);
    if (!enemy.special) completeSearch(getRoom(), true);
  }

  function collectMonsterDrop(enemy) {
    const roll = Math.random();
    let drop = null;
    if (enemy.kind === "Zombie" || enemy.kind === "Skeleton") {
      if (roll < 0.05) drop = "key";
      else if (roll < 0.10) drop = "bullet";
      else if (roll < 0.50) drop = "food";
      else if (roll < 0.55) drop = enemy.kind === "Skeleton" ? "matches" : "cloth";
    } else if (enemy.kind === "Vampire") {
      if (roll < 0.25) drop = "key";
      else if (roll < 0.30) drop = "bullet";
      else if (roll < 0.70) drop = "food";
    } else if (enemy.kind === "Frankenstein") {
      if (roll < 0.50) drop = "key";
    } else if (enemy.kind === "Werewolf") {
      if (roll < 0.80) drop = "food";
    }

    if (drop === "key") {
      state.keys += 1;
      addMessage("The " + enemy.kind + " drops a Key! You pocket it.", "event");
    } else if (drop === "bullet") {
      state.bullets += 1;
      addMessage("The " + enemy.kind + " drops 1 bullet! You pocket it.", "event");
    } else if (drop === "food") {
      state.food += 1;
      addMessage("The " + enemy.kind + " drops Food. Best not to wonder where it kept it.", "event");
    } else if (drop === "matches") {
      if (state.matches) addMessage("But you already have Matches.");
      else {
        state.matches = true;
        addMessage("The Skeleton drops Matches. They are old, but still dry!", "event");
      }
    } else if (drop === "cloth") {
      if (state.cloth) addMessage("But you already have Cloth.");
      else {
        state.cloth = true;
        addMessage("The Zombie drops a strip of Cloth. You try not to identify the stains.", "event");
      }
    } else {
      addMessage("The " + enemy.kind + " leaves behind nothing useful.");
    }
  }

  function enemyAttack(enemy) {
    if (!enemy || !enemy.alive || state.mode === "gameover") return;
    if (Math.random() >= 0.50) {
      addMessage("The " + enemy.kind + " attacks and misses you.");
      return;
    }
    const damage = randomInt(enemy.minDamage, enemy.maxDamage);
    state.health = Math.max(0, state.health - damage);
    addMessage("The " + enemy.kind + " hits you for " + damage + " damage!", "danger");
    if (enemy.kind === "Vampire") {
      const before = enemy.hp;
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + 1);
      if (enemy.hp > before) addMessage("The Vampire drinks deep and grows stronger.", "danger");
    }
    if (state.health <= 0) {
      endGame(false, "YOU HAVE DIED", "The hotel claims another permanent guest.");
    }
  }

  function fleeCombat(route, travel, isExit) {
    const enemy = getActiveEnemy();
    if (!enemy) return;
    spendTurn();
    addMessage("You make a break " + (route === "left" || route === "right" ? "to the " + route : route) + "!");
    if (enemy.surprised) {
      enemy.surprised = false;
      addMessage("The surprised " + enemy.kind + " ducks away from the gun smoke. You slip past safely!", "event");
    } else {
      enemyAttack(enemy);
    }
    if (state.mode === "gameover") {
      render();
      return;
    }
    state.activeEnemy = null;
    travel();
    if (!isExit) checkDeathCountdown();
    render();
  }

  function eatFood() {
    if (state.food <= 0 || state.health >= MAX_HEALTH) return;
    const enemy = getActiveEnemy();
    state.food -= 1;
    spendTurn();
    const healing = randomInt(2, 4);
    const gained = Math.min(healing, MAX_HEALTH - state.health);
    state.health += gained;
    addMessage("You eat one Food and recover " + gained + " health. Best not to ask what was in it.");
    if (enemy) enemy.surprised = false;
    if (!checkDeathCountdown() && enemy) enemyAttack(enemy);
    render();
  }

  function useCloth() {
    if (!state.cloth || state.health >= MAX_HEALTH) return;
    const enemy = getActiveEnemy();
    state.cloth = false;
    spendTurn();
    const healing = randomInt(1, 2);
    const gained = Math.min(healing, MAX_HEALTH - state.health);
    state.health += gained;
    addMessage("You bind your wounds with the Cloth and recover " + gained + " health. It is not exactly hospital clean.");
    if (enemy) enemy.surprised = false;
    if (!checkDeathCountdown() && enemy) enemyAttack(enemy);
    render();
  }

  function burnClub() {
    if (state.readied !== "Club" || !state.weapons.has("Club") || !state.matches || !state.cloth) return;
    const enemy = getActiveEnemy();
    state.matches = false;
    state.cloth = false;
    state.weapons.delete("Club");
    state.weapons.add("Torch");
    state.readied = "Torch";
    spendTurn();
    addMessage("You wrap the Cloth around the Club and strike a Match. The Club becomes a blazing Torch!", "event");
    if (enemy) enemy.surprised = false;
    if (!checkDeathCountdown() && enemy) enemyAttack(enemy);
    render();
  }

  function openReadyMenu() {
    state.mode = "ready";
    render();
  }

  function chooseWeapon(index) {
    const choices = ownedWeapons();
    if (index < 0 || index >= choices.length) return;
    const enemy = getActiveEnemy();
    beginActionMessages();
    state.readied = choices[index];
    state.mode = "playing";
    spendTurn();
    addMessage("You ready the " + state.readied + ".", "event");
    if (enemy) enemy.surprised = false;
    if (!checkDeathCountdown() && enemy) enemyAttack(enemy);
    render();
  }

  function ownedWeapons() {
    return WEAPON_ORDER.filter(function (weapon) { return state.weapons.has(weapon); });
  }

  function toggleInventory() {
    if (state.mode === "inventory") {
      state.mode = state.returnMode;
    } else {
      state.returnMode = state.mode;
      state.mode = "inventory";
    }
    render();
  }

  function endGame(won, title, copy) {
    state.mode = "gameover";
    state.ending = { won: won, title: title, copy: copy };
    render();
  }

  function optionsForCurrentState() {
    const options = [];
    const enemy = getActiveEnemy();
    if (enemy) {
      if (state.readied !== "Gun" || state.bullets > 0) options.push(["A", "Attack"]);
      if (state.position > 1) options.push(["<", "Flee Left"]);
      if (state.position < 10) options.push([">", "Flee Right"]);
      options.push(["R", "Ready"]);
      if (state.readied === "Club" && state.matches && state.cloth) options.push(["B", "Burn Club"]);
      if (state.food > 0 && state.health < MAX_HEALTH) options.push(["E", "Eat Food"]);
      if (state.cloth && state.health < MAX_HEALTH) options.push(["C", "Use Cloth"]);
      options.push(["I", "Inventory"]);
      if (canGoUp()) options.push(["U", "Flee Upstairs"]);
      if (canGoDown()) options.push(["D", "Flee Downstairs"]);
      if (isAtDownstairs() && isDownstairsLocked()) {
        if (state.keys > 0) options.push(["K", "Unlock Stairs"]);
        if (state.weapons.has("Club")) options.push(["F", "Force Stairs With Club"]);
      }
      if (isAtExit() && state.hotel.frontDoorLocked && state.keys > 0) options.push(["K", "Unlock Front Door"]);
      if (isAtExit() && !state.hotel.frontDoorLocked) options.push(["X", "Flee Through Front Door"]);
      return options;
    }

    if (state.position > 1) options.push(["<", "Move Left"]);
    if (state.position < 10) options.push([">", "Move Right"]);
    const room = getRoom();
    if (!room.searched) {
      options.push(["S", "Search Room"]);
      options.push(["L", "Listen"]);
    }
    if (canGoUp()) options.push(["U", "Go Upstairs"]);
    if (canGoDown()) options.push(["D", "Go Downstairs"]);
    if (isAtDownstairs() && isDownstairsLocked()) {
      if (state.keys > 0) options.push(["K", "Unlock Stairs"]);
      if (state.weapons.has("Club")) options.push(["F", "Force Stairs With Club"]);
    }
    if (isAtExit() && state.hotel.frontDoorLocked && state.keys > 0) options.push(["K", "Unlock Front Door"]);
    if (isAtExit() && !state.hotel.frontDoorLocked) options.push(["X", "Exit"]);
    options.push(["R", "Ready"]);
    if (state.readied === "Club" && state.matches && state.cloth) options.push(["B", "Burn Club"]);
    if (state.food > 0 && state.health < MAX_HEALTH) options.push(["E", "Eat Food"]);
    if (state.cloth && state.health < MAX_HEALTH) options.push(["C", "Use Cloth"]);
    options.push(["I", "Inventory"]);
    return options;
  }

  function handlePlayingKey(key) {
    const valid = new Set(optionsForCurrentState().map(function (option) { return option[0]; }));
    if (!valid.has(key)) return;
    if (key !== "I" && key !== "R") beginActionMessages();
    const inCombat = Boolean(getActiveEnemy());
    if (key === "<") moveHorizontal(-1, inCombat);
    else if (key === ">") moveHorizontal(1, inCombat);
    else if (key === "S") { searchRoom(); render(); }
    else if (key === "L") { listenAtRoom(); render(); }
    else if (key === "U") useStairs("up", inCombat);
    else if (key === "D") useStairs("down", inCombat);
    else if (key === "X") useExit(inCombat);
    else if (key === "A") attack();
    else if (key === "R") openReadyMenu();
    else if (key === "E") eatFood();
    else if (key === "C") useCloth();
    else if (key === "I") toggleInventory();
    else if (key === "K") unlockWithKey();
    else if (key === "F") forceStairwell();
    else if (key === "B") burnClub();
  }

  function handleKey(event) {
    if (event.repeat) return;
    let key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (event.key === "<" || event.key === ">") key = event.key;
    if (event.key === "," || event.key === "ArrowLeft") key = "<";
    if (event.key === "." || event.key === "ArrowRight") key = ">";
    if (event.key === "ArrowUp") key = "U";
    if (event.key === "ArrowDown") key = "D";
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && event.preventDefault) event.preventDefault();

    if (state.mode === "title") {
      if (key === "E") newGame("Easy");
      else if (key === "M") newGame("Medium");
      else if (key === "H") newGame("Hard");
      else if (key === "I") { state.mode = "instructions"; render(); }
    } else if (state.mode === "instructions") {
      if (key === "B" || key === "N") { state.mode = "title"; render(); }
    } else if (state.mode === "inventory") {
      if (key === "I") toggleInventory();
    } else if (state.mode === "ready") {
      if (/^[1-9]$/.test(key)) chooseWeapon(Number(key) - 1);
    } else if (state.mode === "gameover") {
      if (key === "Y") newGame(state.difficulty);
      else if (key === "N") { state = createShellState(); render(); }
    } else if (state.mode === "playing") {
      handlePlayingKey(key);
    }
  }

  function optionMarkup(options) {
    return options.map(function (option) {
      return '<span class="option"><span class="key">' + escapeHtml(option[0]) + '</span>' + escapeHtml(option[1]) + '</span>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render() {
    ui.title.classList.toggle("hidden", state.mode !== "title");
    ui.instructions.classList.toggle("hidden", state.mode !== "instructions");
    ui.play.classList.toggle("hidden", !["playing", "inventory", "ready"].includes(state.mode));
    ui.gameover.classList.toggle("hidden", state.mode !== "gameover");

    ui.titleOptions.innerHTML = optionMarkup([
      ["E", "Easy - 200 Turns"],
      ["M", "Medium - 150 Turns"],
      ["H", "Hard - 100 Turns"],
      ["I", "Instructions"]
    ]);
    ui.instructionsOptions.innerHTML = optionMarkup([["B", "Back"]]);

    if (["playing", "inventory", "ready"].includes(state.mode)) renderPlay();
    if (state.mode === "gameover") {
      ui.gameoverKicker.textContent = state.ending.won ? "YOU LIVE TO CHECK OUT" : "NO VACANCY";
      ui.gameoverTitle.textContent = state.ending.title;
      ui.gameoverCopy.textContent = state.ending.copy;
      ui.gameoverOptions.innerHTML = '<p>RESTART?</p>' + optionMarkup([["Y", "Yes"], ["N", "No - Title"]]);
    }
    ui.game.focus({ preventScroll: true });
  }

  function renderPlay() {
    ui.status.innerHTML =
      '<span>HEALTH<strong>' + state.health + "/" + MAX_HEALTH + '</strong></span>' +
      '<span>TURNS<strong>' + state.turns + '</strong></span>' +
      '<span>READIED<strong>' + escapeHtml(state.readied) + '</strong></span>';

    const room = getRoom();
    const labels = ["LEVEL " + state.level, "ROOM " + roomNumber(state.level, state.position)];
    if (room.searched) labels.push("SEARCHED");
    if (isAtDownstairs() && isDownstairsLocked()) labels.push("STAIRS LOCKED");
    if (isAtExit()) labels.push(state.hotel.frontDoorLocked ? "FRONT DOOR LOCKED" : "FRONT DOOR OPEN");
    ui.location.textContent = labels.join(" / ");

    ui.history.innerHTML = state.history.map(function (message) {
      const ageClass = message.batch < state.messageBatch ? " previous" : "";
      return '<p class="message ' + message.tone + ageClass + '">' + escapeHtml(message.text) + '</p>';
    }).join("");
    scrollHistoryToBottom();

    ui.overlay.classList.toggle("hidden", !["inventory", "ready"].includes(state.mode));
    if (state.mode === "inventory") {
      ui.overlay.innerHTML =
        '<h2>INVENTORY</h2>' +
        '<div class="inventory-grid"><span>FOOD</span><strong>' + state.food + '</strong>' +
        '<span>BULLETS</span><strong>' + state.bullets + '</strong>' +
        '<span>KEYS</span><strong>' + state.keys + '</strong></div>' +
        '<h3>SUPPLIES</h3><ul class="weapon-list">' +
          '<li>MATCHES: ' + (state.matches ? 'YES' : 'NO') + '</li>' +
          '<li>CLOTH: ' + (state.cloth ? 'YES' : 'NO') + '</li></ul>' +
        '<h3>WEAPONS</h3><ul class="weapon-list">' + ownedWeapons().map(function (weapon) {
          return '<li>' + (weapon === state.readied ? '&gt; ' : '') + escapeHtml(weapon) + (weapon === state.readied ? ' - READIED' : '') + '</li>';
        }).join("") + '</ul>' +
        '<div class="menu">' + optionMarkup([["I", "Close Inventory"]]) + '</div>';
    } else if (state.mode === "ready") {
      const choices = ownedWeapons();
      ui.overlay.innerHTML =
        '<h2>READY A WEAPON</h2>' +
        '<p>CHOOSING A WEAPON USES ONE TURN.</p>' +
        '<div class="menu">' + optionMarkup(choices.map(function (weapon, index) {
          return [String(index + 1), weapon + (weapon === state.readied ? " - Readied" : "")];
        })) + '</div>';
    } else {
      ui.overlay.innerHTML = "";
    }

    ui.actions.innerHTML = state.mode === "playing" ? optionMarkup(optionsForCurrentState()) : "";
  }

  function scrollHistoryToBottom() {
    const pinToBottom = function () {
      ui.history.scrollTop = ui.history.scrollHeight;
    };
    pinToBottom();
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(function () {
        pinToBottom();
        requestAnimationFrame(pinToBottom);
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(pinToBottom);
  }

  function debugSnapshot() {
    if (!state.hotel) return { mode: state.mode };
    const rooms = Object.values(state.hotel.rooms);
    return {
      mode: state.mode,
      difficulty: state.difficulty,
      health: state.health,
      turns: state.turns,
      level: state.level,
      position: state.position,
      readied: state.readied,
      food: state.food,
      bullets: state.bullets,
      keys: state.keys,
      matches: state.matches,
      cloth: state.cloth,
      weapons: ownedWeapons(),
      inCombat: Boolean(getActiveEnemy()),
      activeEnemy: getActiveEnemy() ? getActiveEnemy().kind : null,
      currentRoomSearched: getRoom().searched,
      roomCount: rooms.length,
      ordinaryEnemies: rooms.filter(function (room) { return room.enemy; }).length,
      bulletCaches: rooms.filter(function (room) { return room.loot && room.loot.type === "bullets"; }).length,
      keyCaches: rooms.filter(function (room) { return room.loot && room.loot.type === "key"; }).length,
      commonWeapons: rooms.filter(function (room) {
        return room.loot && room.loot.type === "weapon" && ["Fork", "Club", "Wooden Stake", "Knife"].includes(room.loot.name);
      }).length,
      searchSceneCount: SEARCH_SCENES.length,
      emptyRoomResultCount: EMPTY_ROOM_RESULTS.length,
      specials: Object.keys(state.hotel.specials).length,
      availableKeys: optionsForCurrentState().map(function (option) { return option[0]; })
    };
  }

  window.HotelOfHorror = Object.freeze({ inspect: debugSnapshot });
  document.addEventListener("keydown", handleKey);
  window.addEventListener("resize", scrollHistoryToBottom);
  render();
}());
