"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");
const testSource = source.replace(
  "window.HotelOfHorror = Object.freeze({ inspect: debugSnapshot });",
  `window.HotelOfHorror = Object.freeze({
    inspect: debugSnapshot,
    arrangeTorchTest: function () {
      const entry = Object.entries(state.hotel.specials).find(function (item) { return item[1].kind === "Frankenstein"; });
      const location = entry[0].split(":").map(Number);
      state.level = location[0];
      state.position = location[1];
      state.health = 10;
      state.matches = true;
      state.cloth = true;
      state.weapons.add("Club");
      state.readied = "Club";
      beginEncounter(entry[1], true);
      render();
    },
    arrangeClothTest: function () {
      state.activeEnemy = null;
      state.health = 8;
      state.cloth = true;
      render();
    }
  });`
);

assert.match(styles, /height:\s*calc\(4\.65em \+ 35px\)/, "Action area should reserve three prompt rows");

class ClassList {
  constructor() { this.values = new Set(); }
  toggle(name, force) {
    if (force) this.values.add(name);
    else this.values.delete(name);
  }
}

class ElementStub {
  constructor() {
    this.classList = new ClassList();
    this.innerHTML = "";
    this.textContent = "";
    this.scrollTop = 0;
    this.scrollHeight = 100;
  }
  focus() {}
}

function boot() {
  const elements = new Map();
  let keyHandler = null;
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new ElementStub());
      return elements.get(id);
    },
    addEventListener(type, callback) {
      if (type === "keydown") keyHandler = callback;
    }
  };
  const window = { addEventListener() {} };
  const context = vm.createContext({ console, document, window, Set, Math });
  vm.runInContext(testSource, context, { filename: "game.js" });
  const press = (key) => keyHandler({ key, repeat: false });
  return {
    elements,
    press,
    inspect: () => window.HotelOfHorror.inspect(),
    arrangeTorchTest: () => window.HotelOfHorror.arrangeTorchTest(),
    arrangeClothTest: () => window.HotelOfHorror.arrangeClothTest()
  };
}

{
  const game = boot();
  game.press("m");
  game.arrangeClothTest();
  const beforeCloth = game.inspect();
  assert.ok(beforeCloth.availableKeys.includes("C"));
  game.press("c");
  const afterCloth = game.inspect();
  assert.equal(afterCloth.turns, beforeCloth.turns - 1);
  assert.ok(afterCloth.health === 9 || afterCloth.health === 10);
  assert.equal(afterCloth.cloth, false);
  assert.ok(!afterCloth.availableKeys.includes("C"));
}

{
  const game = boot();
  game.press("m");
  game.arrangeTorchTest();
  const beforeBurn = game.inspect();
  assert.equal(beforeBurn.readied, "Club");
  assert.ok(beforeBurn.availableKeys.includes("B"));
  assert.equal(beforeBurn.availableKeys[0], "A");
  game.press("b");
  const afterBurn = game.inspect();
  assert.equal(afterBurn.turns, beforeBurn.turns - 1);
  assert.equal(afterBurn.readied, "Torch");
  assert.equal(afterBurn.matches, false);
  assert.equal(afterBurn.cloth, false);
  assert.ok(afterBurn.weapons.includes("Torch"));
  assert.ok(!afterBurn.weapons.includes("Club"));
  assert.equal(afterBurn.activeEnemy, "Frankenstein");
  game.press("a");
  assert.equal(game.inspect().turns, beforeBurn.turns - 2);
  assert.equal(game.inspect().inCombat, false);
}

for (const alias of [",", ".", "ArrowLeft", "ArrowRight"]) {
  const game = boot();
  game.press("m");
  const before = game.inspect();
  const movesLeft = alias === "," || alias === "ArrowLeft";
  if ((movesLeft && before.availableKeys.includes("<")) || (!movesLeft && before.availableKeys.includes(">"))) {
    game.press(alias);
    assert.equal(game.inspect().turns, 149);
    assert.notEqual(game.inspect().position, before.position);
  }
}

let testedVerticalArrow = false;
for (let attempt = 0; attempt < 200 && !testedVerticalArrow; attempt += 1) {
  const game = boot();
  game.press("m");
  const before = game.inspect();
  if (before.availableKeys.includes("D")) {
    game.press("ArrowDown");
    assert.equal(game.inspect().turns, 149);
    assert.equal(game.inspect().level, 9);
    if (!game.inspect().inCombat && game.inspect().availableKeys.includes("U")) {
      game.press("ArrowUp");
      assert.equal(game.inspect().turns, 148);
      assert.equal(game.inspect().level, 10);
      testedVerticalArrow = true;
    }
  }
}
assert.ok(testedVerticalArrow, "Expected to generate a starting position with visible downstairs");

for (const choice of [["e", "Easy", 200], ["m", "Medium", 150], ["h", "Hard", 100]]) {
  const game = boot();
  game.press(choice[0]);
  assert.equal(game.inspect().difficulty, choice[1]);
  assert.equal(game.inspect().turns, choice[2]);
}

for (let run = 0; run < 100; run += 1) {
  const game = boot();
  assert.equal(game.inspect().mode, "title");

  game.press("i");
  assert.equal(game.inspect().mode, "instructions");
  game.press("b");
  assert.equal(game.inspect().mode, "title");
  game.press("m");

  const generated = game.inspect();
  assert.equal(generated.mode, "playing");
  assert.equal(generated.roomCount, 100);
  assert.ok(generated.ordinaryEnemies >= 10 && generated.ordinaryEnemies <= 20);
  assert.equal(generated.bulletCaches, 5);
  assert.equal(generated.keyCaches, 3);
  assert.equal(generated.commonWeapons, 10);
  assert.equal(generated.specials, 3);
  assert.equal(generated.health, 10);
  assert.equal(generated.difficulty, "Medium");
  assert.equal(generated.turns, 150);
  assert.equal(generated.readied, "Fists");

  game.press("i");
  assert.equal(game.inspect().mode, "inventory");
  assert.equal(game.inspect().turns, 150);
  game.press("i");
  assert.equal(game.inspect().mode, "playing");
  assert.equal(game.inspect().turns, 150);

  game.press("r");
  assert.equal(game.inspect().mode, "ready");
  game.press("1");
  assert.equal(game.inspect().mode, "playing");
  assert.equal(game.inspect().turns, 149);
  assert.equal(game.inspect().readied, "Fists");

  const beforeMove = game.inspect();
  if (!beforeMove.inCombat) {
    const move = beforeMove.availableKeys.includes(">") ? ">" : "<";
    game.press(move);
    assert.equal(game.inspect().turns, 148);
    assert.notEqual(game.inspect().position, beforeMove.position);
    const displayedRoom = String(game.inspect().level).padStart(2, "0") + String(game.inspect().position).padStart(2, "0");
    assert.match(game.elements.get("location").textContent, new RegExp("ROOM " + displayedRoom));
    assert.match(game.elements.get("status").innerHTML, /TURNS<strong>148<\/strong>/);
    assert.equal(game.elements.get("history").scrollTop, game.elements.get("history").scrollHeight);
  }

  const beforeInvalid = game.inspect();
  game.press("q");
  assert.equal(game.inspect().turns, beforeInvalid.turns);

  if (!game.inspect().inCombat && game.inspect().availableKeys.includes("S")) {
    const beforeSearch = game.inspect().turns;
    game.press("s");
    assert.equal(game.inspect().turns, beforeSearch - 1);
    assert.ok(game.inspect().inCombat || game.inspect().currentRoomSearched);
  }
}

// Exercise contextual actions in longer random sessions. This is intentionally
// not a winning strategy; it is a crash/state-transition fuzzer.
for (let run = 0; run < 50; run += 1) {
  const game = boot();
  game.press("m");
  for (let step = 0; step < 300; step += 1) {
    const snapshot = game.inspect();
    if (snapshot.mode === "gameover") {
      game.press("y");
      continue;
    }
    if (snapshot.mode === "ready") {
      game.press("1");
      continue;
    }
    if (snapshot.mode === "inventory") {
      game.press("i");
      continue;
    }
    assert.equal(snapshot.mode, "playing");
    assert.equal(new Set(snapshot.availableKeys).size, snapshot.availableKeys.length);
    const choices = snapshot.availableKeys;
    assert.ok(choices.length > 0);
    const expectedPrefix = [];
    if (choices.includes("A")) expectedPrefix.push("A");
    if (choices.includes("<")) expectedPrefix.push("<");
    if (choices.includes(">")) expectedPrefix.push(">");
    assert.equal(choices.slice(0, expectedPrefix.length).join("|"), expectedPrefix.join("|"), "Attack and horizontal options must remain first");
    game.press(choices[Math.floor(Math.random() * choices.length)]);
  }
}

console.log("Hotel of Horror smoke tests passed: 100 generation checks and 50 random-action sessions.");
