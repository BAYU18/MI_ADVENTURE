const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Battle Ending Spectacular Modal & Auto-Transition", async (t) => {
  const appJsPath = path.join(__dirname, "..", "public", "js", "app.js");
  const styleCssPath = path.join(__dirname, "..", "public", "css", "style.css");

  const appJs = fs.readFileSync(appJsPath, "utf8");
  const styleCss = fs.readFileSync(styleCssPath, "utf8");

  await t.test("1. public/js/app.js defines Screens.showBattleEndingSpectacularModal", () => {
    assert.ok(appJs.includes("Screens.showBattleEndingSpectacularModal = function"), "Screens.showBattleEndingSpectacularModal must be defined");
    assert.ok(appJs.includes("battle-ending-modal"), "must include id or testid battle-ending-modal");
  });

  await t.test("2. Modal contains spectacular win & loss animations matching story chest effects", () => {
    // Rotating radiant rays
    assert.ok(appJs.includes("chest-rays"), "must include chest-rays element");
    assert.ok(appJs.includes("chestRaysSpin"), "must animate chestRaysSpin");

    // Confetti and Ember particles
    assert.ok(appJs.includes("confetti-container"), "must include confetti-container");
    assert.ok(appJs.includes("confettiFall"), "must include confettiFall for win");
    assert.ok(appJs.includes("emberFloat"), "must include emberFloat for loss");

    // Pop-in card animation
    assert.ok(appJs.includes("itemPopIn"), "card must animate with itemPopIn");

    // Dynamic praise & encouragement copy
    assert.ok(appJs.includes("KEMENANGAN GEMILANG"), "must have victory praise headline");
    assert.ok(appJs.includes("PANTANG MENYERAH"), "must have loss encouragement headline");
    assert.ok(appJs.includes("Sang Monster"), "must have immersive narrative copy");
  });

  await t.test("3. Auto-transition progress bar and instant skip tap are supported", () => {
    assert.ok(appJs.includes("transition-fill-bar"), "must contain transition progress bar");
    assert.ok(appJs.includes("transition-timer-txt"), "must display timer");
    assert.ok(appJs.includes("modal.onclick = triggerComplete"), "tapping anywhere skips instantly");
    assert.ok(appJs.includes("autoFinishTimeout = setTimeout(triggerComplete, duration)"), "must auto-finish transition without requiring button click");
  });

  await t.test("4. Screens.battle integrates showEndingModal automatically on game over", () => {
    assert.ok(appJs.includes("showEndingModal(isWin, s, res, onComplete)"), "Screens.battle must have showEndingModal method");
    assert.ok(appJs.includes("this.showEndingModal(isWin, s, res, () => goNext())"), "renderCurrentQuestion must invoke showEndingModal when isOver");
  });

  await t.test("5. public/css/style.css defines required keyframes", () => {
    assert.ok(styleCss.includes("@keyframes chestRaysSpin"), "must define chestRaysSpin");
    assert.ok(styleCss.includes("@keyframes itemPopIn"), "must define itemPopIn");
    assert.ok(styleCss.includes("@keyframes confettiFall"), "must define confettiFall");
    assert.ok(styleCss.includes("@keyframes emberFloat"), "must define emberFloat");
    assert.ok(styleCss.includes("@keyframes victoryBounce"), "must define victoryBounce");
    assert.ok(styleCss.includes("@keyframes flamePulse"), "must define flamePulse");
  });
});