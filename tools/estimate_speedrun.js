"use strict";

// Historical Monte Carlo baseline for the original unlocked-door rules. The
// current game requires keys, so this script's result no longer represents the
// current win rate. This is an analysis tool; the game does not require Node.js.

const trials = Math.max(1, Number(process.argv[2]) || 1000000);
const seed = (Number(process.argv[3]) || 0x484f5445) >>> 0;

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

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = randomInt(0, index);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function leftFirstExpectedCost(start) {
  let total = 0;
  for (let target = 1; target <= 10; target += 1) {
    total += target <= start ? start - target : (start - 1) + (target - 1);
  }
  return total / 10;
}

function rightFirstExpectedCost(start) {
  let total = 0;
  for (let target = 1; target <= 10; target += 1) {
    total += target >= start ? target - start : (10 - start) + (10 - target);
  }
  return total / 10;
}

function searchPath(start, target) {
  if (start === target) return [];
  const firstDirection = leftFirstExpectedCost(start) <= rightFirstExpectedCost(start) ? -1 : 1;
  const firstEnd = firstDirection < 0 ? 1 : 10;
  const positions = [];
  let current = start;

  while (current !== firstEnd) {
    current += firstDirection;
    positions.push(current);
    if (current === target) return positions;
  }
  while (current !== target) {
    current -= firstDirection;
    positions.push(current);
  }
  return positions;
}

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function simulateOne() {
  const downstairs = {};
  for (let level = 2; level <= 10; level += 1) downstairs[level] = randomInt(1, 10);
  const exitPosition = randomInt(1, 10);

  const specialLevels = shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 3);
  const specialByLevel = {};
  const profiles = [
    { kind: "Frankenstein", min: 1, max: 6 },
    { kind: "Werewolf", min: 2, max: 4 },
    { kind: "Vampire", min: 1, max: 3 }
  ];
  profiles.forEach(function (profile, index) {
    specialByLevel[specialLevels[index]] = {
      kind: profile.kind,
      min: profile.min,
      max: profile.max,
      position: randomInt(1, 10)
    };
  });

  let health = 10;
  let turns = 100;
  let position = randomInt(1, 10);
  const startingPosition = position;
  let actions = 0;
  let attacksFaced = 0;

  let plannedActions = 0;
  let plannedPosition = startingPosition;
  for (let plannedLevel = 10; plannedLevel >= 1; plannedLevel -= 1) {
    const plannedTarget = plannedLevel === 1 ? exitPosition : downstairs[plannedLevel];
    plannedActions += searchPath(plannedPosition, plannedTarget).length + 1;
    plannedPosition = plannedTarget;
  }

  function monsterAttack(level) {
    const monster = specialByLevel[level];
    if (!monster || monster.position !== position) return null;
    attacksFaced += 1;
    if (random() < 0.50) {
      health -= randomInt(monster.min, monster.max);
      if (health <= 0) return monster.kind;
    }
    return null;
  }

  for (let level = 10; level >= 1; level -= 1) {
    const target = level === 1 ? exitPosition : downstairs[level];
    const path = searchPath(position, target);

    for (const nextPosition of path) {
      turns -= 1;
      actions += 1;
      const killer = monsterAttack(level);
      if (killer) return { won: false, reason: killer, actions, health: 0, attacksFaced, plannedActions };
      position = nextPosition;
      if (turns <= 0) return { won: false, reason: "Death", actions, health, attacksFaced, plannedActions };
    }

    // Taking stairs or using the Front Door is itself an action. If a monster
    // occupies this position, it attacks before the travel or escape completes.
    turns -= 1;
    actions += 1;
    const killer = monsterAttack(level);
    if (killer) return { won: false, reason: killer, actions, health: 0, attacksFaced, plannedActions };

    // The exit wins on the final turn. Stairs do not receive that exception.
    if (level === 1) return { won: true, reason: "Escaped", actions, health, attacksFaced, plannedActions };
    if (turns <= 0) return { won: false, reason: "Death", actions, health, attacksFaced, plannedActions };
  }
  throw new Error("Simulation ended without an outcome.");
}

const outcomes = { Escaped: 0, Death: 0, Frankenstein: 0, Werewolf: 0, Vampire: 0 };
const winningActions = [];
let totalActions = 0;
let totalHealthOnWin = 0;
let totalAttacksFaced = 0;
let timeFeasibleRoutes = 0;

for (let index = 0; index < trials; index += 1) {
  const result = simulateOne();
  outcomes[result.reason] += 1;
  totalActions += result.actions;
  totalAttacksFaced += result.attacksFaced;
  if (result.plannedActions <= 100) timeFeasibleRoutes += 1;
  if (result.won) {
    winningActions.push(result.actions);
    totalHealthOnWin += result.health;
  }
}

winningActions.sort(function (a, b) { return a - b; });
const wins = outcomes.Escaped;
const probability = wins / trials;
const standardError = Math.sqrt(probability * (1 - probability) / trials);

console.log(JSON.stringify({
  strategy: "PRE-LOCK BASELINE: expected-distance sweep, ignore rooms, flee past special monsters",
  trials,
  seed,
  wins,
  winProbability: probability,
  confidence95: [Math.max(0, probability - 1.96 * standardError), Math.min(1, probability + 1.96 * standardError)],
  failures: {
    turnLimit: outcomes.Death,
    Frankenstein: outcomes.Frankenstein,
    Werewolf: outcomes.Werewolf,
    Vampire: outcomes.Vampire
  },
  routeFitsWithin100Turns: timeFeasibleRoutes / trials,
  averageActionsAllRuns: totalActions / trials,
  averageActionsOnWin: winningActions.reduce(function (sum, value) { return sum + value; }, 0) / wins,
  winningActionPercentiles: {
    p10: percentile(winningActions, 0.10),
    p50: percentile(winningActions, 0.50),
    p90: percentile(winningActions, 0.90),
    p99: percentile(winningActions, 0.99)
  },
  averageHealthOnWin: totalHealthOnWin / wins,
  averageSpecialAttacksFaced: totalAttacksFaced / trials
}, null, 2));
