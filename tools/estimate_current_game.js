"use strict";

// Monte Carlo model of the current locked-door game. This is an optional
// analysis tool; Hotel of Horror itself does not require Node.js.

const trials = Math.max(1, Number(process.argv[2]) || 250000);
const seed = (Number(process.argv[3]) || 0x4b455953) >>> 0;
const turnLimit = Math.max(1, Number(process.argv[4]) || 100);
const policy = process.argv[5] === "aggressive" ? "aggressive" : "selective";

function makeRandom(initialSeed) {
  let value = initialSeed || 1;
  return function random() {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

const random = makeRandom(seed);
const randomInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;

function shuffle(items) {
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = randomInt(0, index);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

const keyOf = (level, position) => level + ":" + position;

const WEAPONS = {
  "Fists": { accuracy: 0.50, min: 1, max: 1 },
  "Bat": { accuracy: 0.50, min: 1, max: 2 },
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

function makeEnemy(kind, special) {
  const profile = MONSTERS[kind];
  return {
    kind,
    hp: profile.hp,
    maxHp: profile.hp,
    min: profile.min,
    max: profile.max,
    special,
    alive: true,
    revealed: special,
    gunSurpriseUsed: false,
    surprised: false
  };
}

function placeLoot(world, loot, levels) {
  const candidates = [];
  for (const level of levels) {
    for (let position = 1; position <= 10; position += 1) {
      const room = world.rooms[keyOf(level, position)];
      if (!room.loot) candidates.push(room);
    }
  }
  candidates[randomInt(0, candidates.length - 1)].loot = loot;
}

function generateWorld() {
  const world = {
    rooms: {},
    downstairs: {},
    specials: {},
    exit: randomInt(1, 10),
    locked: { 3: true, 6: true },
    frontLocked: true
  };
  for (let level = 1; level <= 10; level += 1) {
    for (let position = 1; position <= 10; position += 1) {
      world.rooms[keyOf(level, position)] = { level, position, loot: null, enemy: null, searched: false };
    }
  }
  for (let level = 2; level <= 10; level += 1) world.downstairs[level] = randomInt(1, 10);

  const common = shuffle(["Bat", "Bat", "Bat", "Club", "Club", "Club", "Wooden Stake", "Wooden Stake", "Knife", "Knife"]);
  for (let level = 1; level <= 10; level += 1) placeLoot(world, { type: "weapon", name: common[level - 1] }, [level]);
  placeLoot(world, { type: "weapon", name: "Gun" }, [3,4,5,6,7,8,9,10]);
  placeLoot(world, { type: "weapon", name: "Silver Sword" }, [1,2,3,4,5]);
  for (let level = 1; level <= 10; level += 1) {
    for (let count = randomInt(0, 2); count > 0; count -= 1) placeLoot(world, { type: "food", amount: 1 }, [level]);
  }
  for (let count = 0; count < 5; count += 1) placeLoot(world, { type: "bullets", amount: randomInt(1, 3) }, [1,2,3,4,5,6,7,8,9,10]);
  placeLoot(world, { type: "key", amount: 1 }, [3,4]);
  placeLoot(world, { type: "key", amount: 1 }, [6,7]);
  placeLoot(world, { type: "key", amount: 1 }, [1,2]);

  const enemyCount = randomInt(10, 20);
  const kinds = shuffle(Array.from({ length: enemyCount }, (_, index) => index < Math.floor(enemyCount / 2) ? "Zombie" : "Skeleton"));
  shuffle(Object.values(world.rooms)).slice(0, enemyCount).forEach((room, index) => {
    room.enemy = makeEnemy(kinds[index], false);
  });

  const levels = shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 3);
  ["Frankenstein", "Werewolf", "Vampire"].forEach((kind, index) => {
    world.specials[keyOf(levels[index], randomInt(1, 10))] = makeEnemy(kind, true);
  });
  return world;
}

function scanOrder(start) {
  let leftCost = 0;
  let rightCost = 0;
  for (let target = 1; target <= 10; target += 1) {
    leftCost += target <= start ? start - target : start - 1 + target - 1;
    rightCost += target >= start ? target - start : 10 - start + 10 - target;
  }
  const direction = leftCost <= rightCost ? -1 : 1;
  const end = direction < 0 ? 1 : 10;
  const order = [start];
  let position = start;
  while (position !== end) {
    position += direction;
    order.push(position);
  }
  while (position !== (direction < 0 ? 10 : 1)) {
    position -= direction;
    order.push(position);
  }
  return order;
}

function simulateOne() {
  const world = generateWorld();
  const player = {
    level: 10,
    position: randomInt(1, 10),
    health: 10,
    turns: turnLimit,
    actions: 0,
    food: 0,
    bullets: 0,
    keys: 0,
    matches: false,
    cloth: false,
    weapons: new Set(["Fists"]),
    readied: "Fists",
    foundWeapon: false,
    failure: null,
    active: null,
    fightsWon: 0,
    roomsChecked: 0
  };

  function room() { return world.rooms[keyOf(player.level, player.position)]; }
  function special() {
    const value = world.specials[keyOf(player.level, player.position)];
    return value && value.alive ? value : null;
  }
  function ordinary() {
    const value = room().enemy;
    return value && value.alive && value.revealed ? value : null;
  }
  function syncActive() { player.active = special() || ordinary() || null; }
  function spend(isExit) {
    player.turns -= 1;
    player.actions += 1;
    if (player.turns < 0 || (player.turns === 0 && !isExit)) {
      player.failure = "Death";
      return false;
    }
    return true;
  }
  function monsterAttack(enemy) {
    if (random() >= 0.50) return true;
    player.health -= randomInt(enemy.min, enemy.max);
    if (enemy.kind === "Vampire") enemy.hp = Math.min(enemy.maxHp, enemy.hp + 1);
    if (player.health <= 0) {
      player.failure = enemy.kind;
      return false;
    }
    return true;
  }
  function weaponScore(name) {
    if (name === "Gun" && player.bullets <= 0) return -1;
    const weapon = WEAPONS[name];
    return weapon.accuracy * (weapon.min + weapon.max) / 2;
  }
  function bestWeapon(enemy) {
    if (enemy.kind === "Frankenstein" && player.weapons.has("Torch")) return "Torch";
    if (enemy.kind === "Werewolf") return player.weapons.has("Silver Sword") ? "Silver Sword" : null;
    if (enemy.kind === "Vampire" && !player.weapons.has("Wooden Stake")) return null;
    if (enemy.kind === "Vampire" && enemy.hp <= 1) return "Wooden Stake";
    return Array.from(player.weapons).filter(name => name !== "Gun" || player.bullets > 0)
      .sort((a, b) => weaponScore(b) - weaponScore(a))[0] || "Fists";
  }
  function ready(name, enemy) {
    if (player.readied === name) return true;
    if (!spend(false)) return false;
    player.readied = name;
    if (enemy) {
      enemy.surprised = false;
      return monsterAttack(enemy);
    }
    return true;
  }
  function eat(enemy) {
    if (!player.food || player.health >= 10) return true;
    if (!spend(false)) return false;
    player.food -= 1;
    player.health = Math.min(10, player.health + randomInt(2, 4));
    if (enemy) {
      enemy.surprised = false;
      return monsterAttack(enemy);
    }
    return true;
  }
  function useCloth(enemy) {
    if (!player.cloth || player.health >= 10) return true;
    if (!spend(false)) return false;
    player.cloth = false;
    player.health = Math.min(10, player.health + randomInt(1, 2));
    if (enemy) {
      enemy.surprised = false;
      return monsterAttack(enemy);
    }
    return true;
  }
  function collect(loot) {
    if (!loot) return true;
    if (loot.type === "key") player.keys += 1;
    else if (loot.type === "food") player.food += 1;
    else if (loot.type === "bullets") player.bullets += loot.amount;
    else if (!player.weapons.has(loot.name)) {
      player.weapons.add(loot.name);
      if (!player.foundWeapon) {
        player.foundWeapon = true;
        player.readied = loot.name;
      }
    }
    return true;
  }
  function prepareOutsideCombat() {
    while (player.health <= 6 && player.food > 0) if (!eat(null)) return false;
    if (player.health <= 3 && player.food === 0 && player.cloth &&
        !(player.matches && player.weapons.has("Club"))) {
      if (!useCloth(null)) return false;
    }
    const best = Array.from(player.weapons).filter(name => name !== "Gun" || player.bullets > 0)
      .sort((a, b) => weaponScore(b) - weaponScore(a))[0];
    return best ? ready(best, null) : true;
  }
  function fight(enemy) {
    while (enemy.alive && !player.failure) {
      if (policy === "aggressive" && player.health <= 4 && player.food === 0 && !player.cloth) return false;
      if (player.health <= 5 && player.food > 0 && !eat(enemy)) return false;
      if (player.health <= 4 && player.food === 0 && player.cloth &&
          !(enemy.kind === "Frankenstein" && player.matches && player.weapons.has("Club"))) {
        if (!useCloth(enemy)) return false;
        continue;
      }
      if (enemy.kind === "Frankenstein" && player.weapons.has("Club") && player.matches && player.cloth) {
        if (!ready("Club", enemy)) return false;
        if (!spend(false)) return false;
        player.matches = false;
        player.cloth = false;
        player.weapons.delete("Club");
        player.weapons.add("Torch");
        player.readied = "Torch";
        enemy.surprised = false;
        if (!monsterAttack(enemy)) return false;
        continue;
      }
      const chosen = bestWeapon(enemy);
      if (!chosen) return false;
      if (!ready(chosen, enemy)) return false;
      const firstGunshot = chosen === "Gun" && !enemy.gunSurpriseUsed;
      if (enemy.surprised && !firstGunshot) enemy.surprised = false;
      if (chosen === "Gun") player.bullets -= 1;
      if (!spend(false)) return false;

      if (enemy.kind === "Frankenstein" && chosen === "Torch") {
        enemy.alive = false;
        player.active = null;
        player.fightsWon += 1;
        return true;
      }

      const weapon = WEAPONS[chosen];
      if (random() < weapon.accuracy) {
        let nextHp = enemy.hp - randomInt(weapon.min, weapon.max);
        if (enemy.kind === "Vampire" && chosen !== "Wooden Stake" && nextHp < 1) nextHp = 1;
        enemy.hp = nextHp;
      }
      if (enemy.hp <= 0) {
        enemy.alive = false;
        player.active = null;
        player.fightsWon += 1;
        collectDrop(enemy);
        return true;
      }
      if (firstGunshot) {
        enemy.gunSurpriseUsed = true;
        enemy.surprised = true;
      } else if (!monsterAttack(enemy)) return false;
    }
    return enemy.alive === false;
  }
  function collectDrop(enemy) {
    const roll = random();
    if (enemy.kind === "Zombie" || enemy.kind === "Skeleton") {
      if (roll < 0.05) player.keys += 1;
      else if (roll < 0.10) player.bullets += 1;
      else if (roll < 0.50) player.food += 1;
      else if (roll < 0.55 && enemy.kind === "Skeleton") player.matches = true;
      else if (roll < 0.55) player.cloth = true;
    } else if (enemy.kind === "Vampire") {
      if (roll < 0.25) player.keys += 1;
      else if (roll < 0.30) player.bullets += 1;
      else if (roll < 0.70) player.food += 1;
    } else if (enemy.kind === "Frankenstein") {
      if (roll < 0.50) player.keys += 1;
    } else if (enemy.kind === "Werewolf" && roll < 0.80) {
      player.food += 1;
    }
  }
  function shouldFightFor(loot) {
    if (policy === "aggressive") return player.health > 4 || player.food > 0;
    if (!loot) return false;
    if (loot.type === "key") return true;
    if (loot.type === "food") return player.health <= 7;
    if (loot.type === "bullets") return player.weapons.has("Gun");
    return !player.weapons.has(loot.name);
  }
  function searchCurrent() {
    const current = room();
    if (current.searched || special()) return false;
    if (!spend(false)) return false;
    player.roomsChecked += 1;
    if (current.enemy && current.enemy.alive && !current.enemy.revealed) {
      current.enemy.revealed = true;
      player.active = current.enemy;
      if (!shouldFightFor(current.loot)) return true;
      if (!fight(current.enemy)) return !player.failure;
    }
    current.searched = true;
    collect(current.loot);
    current.loot = null;
    return prepareOutsideCombat();
  }
  function shootToDodge(enemy) {
    if (player.readied !== "Gun" || player.bullets <= 0 || enemy.gunSurpriseUsed) return true;
    player.bullets -= 1;
    if (!spend(false)) return false;
    const gun = WEAPONS.Gun;
    if (random() < gun.accuracy) {
      let nextHp = enemy.hp - randomInt(gun.min, gun.max);
      if (enemy.kind === "Werewolf") nextHp = enemy.hp;
      if (enemy.kind === "Vampire" && nextHp < 1) nextHp = 1;
      enemy.hp = nextHp;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        player.active = null;
        return true;
      }
    }
    enemy.gunSurpriseUsed = true;
    enemy.surprised = true;
    return true;
  }
  function escapeAttack() {
    const enemy = player.active;
    if (!enemy || !enemy.alive) return true;
    if (!shootToDodge(enemy)) return false;
    if (!enemy.alive) return true;
    if (enemy.surprised) {
      enemy.surprised = false;
      return true;
    }
    return monsterAttack(enemy);
  }
  function moveOne(nextPosition) {
    if (policy === "aggressive" && player.active && (player.health > 4 || player.food > 0)) {
      fight(player.active);
      if (player.failure) return false;
    }
    if (!spend(false)) return false;
    if (!escapeAttack()) return false;
    player.active = null;
    player.position = nextPosition;
    syncActive();
    return true;
  }
  function moveDirect(target) {
    while (player.position !== target && !player.failure) {
      const next = player.position + (target > player.position ? 1 : -1);
      if (!moveOne(next)) return false;
    }
    return !player.failure;
  }
  function useStairs(direction) {
    if (policy === "aggressive" && player.active && (player.health > 4 || player.food > 0)) {
      fight(player.active);
      if (player.failure) return false;
    }
    if (!spend(false)) return false;
    if (!escapeAttack()) return false;
    player.active = null;
    player.level += direction;
    syncActive();
    return true;
  }
  function inspectFloor(searchForKey, deferred) {
    const target = player.level === 1 ? world.exit : world.downstairs[player.level];
    let targetSeen = player.position === target;
    for (const position of scanOrder(player.position)) {
      if (position !== player.position && !moveOne(position)) return false;
      if (position === target) targetSeen = true;
      if (searchForKey && player.keys === 0 && !room().searched) {
        if (special()) {
          let cleared = false;
          if (policy === "aggressive" && (player.health > 4 || player.food > 0)) {
            cleared = fight(special());
            if (player.failure) return false;
          }
          if (cleared) {
            if (!searchCurrent()) return false;
          } else if (!deferred.some(entry => entry.level === player.level && entry.position === player.position)) {
            deferred.push({ level: player.level, position: player.position });
          }
        } else if (!searchCurrent()) return false;
      }
      if ((!searchForKey || player.keys > 0) && targetSeen) break;
    }
    return moveDirect(target);
  }
  function goToLevel(targetLevel) {
    while (player.level < targetLevel && !player.failure) {
      const upPosition = world.downstairs[player.level + 1];
      if (!moveDirect(upPosition) || !useStairs(1)) return false;
    }
    while (player.level > targetLevel && !player.failure) {
      const downPosition = world.downstairs[player.level];
      if (!moveDirect(downPosition) || !useStairs(-1)) return false;
    }
    return true;
  }
  function resolveDeferred(deferred, lowerLevel) {
    for (const entry of deferred.slice().reverse()) {
      if (player.keys > 0) break;
      if (!goToLevel(entry.level) || !moveDirect(entry.position)) return false;
      const blocker = special();
      if (blocker && !fight(blocker)) continue;
      if (!searchCurrent() && player.failure) return false;
    }
    if (player.keys <= 0) {
      player.failure = "KeyBlocked";
      return false;
    }
    return goToLevel(lowerLevel);
  }
  function unlockStairs() {
    if (policy === "aggressive" && player.active && (player.health > 4 || player.food > 0)) {
      fight(player.active);
      if (player.failure) return false;
    }
    const enemy = player.active;
    if (player.weapons.has("Club")) {
      if (!spend(false)) return false;
      player.weapons.delete("Club");
      if (player.readied === "Club") player.readied = "Fists";
    } else if (player.keys > 0) {
      if (!spend(false)) return false;
      player.keys -= 1;
    } else {
      player.failure = "NoKey";
      return false;
    }
    world.locked[player.level] = false;
    if (enemy) {
      enemy.surprised = false;
      if (!monsterAttack(enemy)) return false;
    }
    return true;
  }
  function unlockFront() {
    if (player.keys <= 0) {
      player.failure = "NoKey";
      return false;
    }
    if (policy === "aggressive" && player.active && (player.health > 4 || player.food > 0)) {
      fight(player.active);
      if (player.failure) return false;
    }
    const enemy = player.active;
    player.keys -= 1;
    if (!spend(false)) return false;
    world.frontLocked = false;
    if (enemy) {
      enemy.surprised = false;
      if (!monsterAttack(enemy)) return false;
    }
    return true;
  }

  syncActive();
  const deferred = { 6: [], 3: [], 1: [] };
  const upperForLock = { 7: 6, 4: 3, 2: 1 };
  const lowerLocks = new Set([6, 3, 1]);

  for (let level = 10; level >= 1 && !player.failure; level -= 1) {
    if (player.level !== level) throw new Error("Simulator floor sequence drifted.");
    const lower = upperForLock[level];
    const isUpperCandidate = Boolean(lower);
    const isLowerLock = lowerLocks.has(level);
    const needsKey = player.keys === 0 && (isUpperCandidate || isLowerLock);
    const bucket = isUpperCandidate ? deferred[lower] : isLowerLock ? deferred[level] : [];

    if (!inspectFloor(needsKey, bucket)) break;

    if (isLowerLock && player.keys === 0 && !(level !== 1 && player.weapons.has("Club"))) {
      if (!resolveDeferred(deferred[level], level)) break;
      if (!moveDirect(level === 1 ? world.exit : world.downstairs[level])) break;
    }

    if (level === 1) {
      if (world.frontLocked && !unlockFront()) break;
      if (!spend(true)) break;
      if (!escapeAttack()) break;
      return { won: true, reason: "Escaped", ...player };
    }
    if (world.locked[level] && !unlockStairs()) break;
    if (!useStairs(-1)) break;
  }
  return { won: false, reason: player.failure || "Unknown", ...player };
}

const outcomes = {};
const winningActions = [];
let healthOnWin = 0;
let roomsCheckedOnWin = 0;
let fightsWonOnWin = 0;

for (let index = 0; index < trials; index += 1) {
  const result = simulateOne();
  outcomes[result.reason] = (outcomes[result.reason] || 0) + 1;
  if (result.won) {
    winningActions.push(result.actions);
    healthOnWin += result.health;
    roomsCheckedOnWin += result.roomsChecked;
    fightsWonOnWin += result.fightsWon;
  }
}

winningActions.sort((a, b) => a - b);
const wins = winningActions.length;
const probability = wins / trials;
const error = Math.sqrt(probability * (1 - probability) / trials);
const percentile = fraction => winningActions[Math.min(wins - 1, Math.floor(wins * fraction))];

console.log(JSON.stringify({
  strategy: policy === "aggressive"
    ? "Aggressive key-band search; fight encountered creatures unless health is 4 or less with no healing supplies"
    : "Systematic key-band search; collect useful loot; use Clubs on stair locks; fight only loot guards and necessary special monsters",
  policy,
  trials,
  seed,
  turnLimit,
  successfulRuns: wins,
  winProbability: probability,
  confidence95: [probability - 1.96 * error, probability + 1.96 * error],
  failures: outcomes,
  successfulRunStats: {
    averageActions: winningActions.reduce((sum, value) => sum + value, 0) / wins,
    actionPercentiles: { p10: percentile(0.10), p50: percentile(0.50), p90: percentile(0.90), p99: percentile(0.99) },
    averageHealth: healthOnWin / wins,
    averageRoomsChecked: roomsCheckedOnWin / wins,
    averageFightsWon: fightsWonOnWin / wins
  }
}, null, 2));
