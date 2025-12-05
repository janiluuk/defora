const { readFileSync } = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");

describe("Deforumation Web UI", () => {
  let dom;
  let document;

  before(() => {
    const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it("renders tabs for all sections", () => {
    const tabs = [...document.querySelectorAll(".tab")].map((el) => el.textContent.trim());
    expect(tabs.join(" ")).to.include("LIVE");
    expect(tabs.join(" ")).to.include("PROMPTS");
    expect(tabs.join(" ")).to.include("MOTION");
    expect(tabs.join(" ")).to.include("AUDIO/BEATS");
    expect(tabs.join(" ")).to.include("CN");
    expect(tabs.join(" ")).to.include("SETTINGS");
  });

  it("has a video player and overlay HUD", () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    const overlay = document.querySelector(".overlay");
    expect(overlay.textContent).to.include("Seed");
  });

  it("includes video, sliders, and presets", () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    const sliderRows = [...document.querySelectorAll(".slider-row")];
    expect(sliderRows.length).to.be.greaterThan(5);
    const chips = [...document.querySelectorAll(".chip")].map((c) => c.textContent.trim());
    expect(chips.join(" ")).to.match(/Static|Orbit|Tunnel|Handheld|Chaos/);
  });

  it("shows prompts/morph table structure", () => {
    const morphTable = document.querySelector("table.table");
    expect(morphTable).to.exist;
    const headers = [...morphTable.querySelectorAll("th")].map((h) => h.textContent.trim());
    expect(headers.join(" ")).to.match(/ID|On|Name|Range/);
  });

  it("includes macro rack cards and MIDI mappings", () => {
    const headings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(headings.join(" ")).to.include("Beat macros");
    expect(headings.join(" ")).to.include("Controllers (WebMIDI)");
    const mappingRows = [...document.querySelectorAll("table.table tbody tr")];
    expect(mappingRows.length).to.be.greaterThan(1);
  });
});
