import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync("public/assets", { recursive: true });
const palettes = {
  cards: ["#e7e4da", "#24433f"],
  polo: ["#e3e7e5", "#193b37"],
  shirt: ["#e8e7e3", "#a9c1d4"],
  tshirt: ["#ece4dd", "#dcc9af"],
  hoodie: ["#e6e5e9", "#535b68"],
  stamp: ["#e4e9ec", "#252c35"],
  poster: ["#e9e4dc", "#db672e"],
  flyer: ["#e6e9e1", "#4b5a38"],
  stickers: ["#e8e0d5", "#b16949"],
  packaging: ["#e6e0d6", "#b88c59"],
  notebook: ["#e1e5df", "#385b4f"],
  mug: ["#e9e0da", "#e9e3d5"],
  album: ["#e2e4e7", "#677763"],
  tote: ["#e6e5db", "#e2d4b9"],
  bottle: ["#e2e8e8", "#40615f"],
  cap: ["#e7e0d8", "#d1b191"],
  folder: ["#e3e4db", "#78917d"],
  pen: ["#e6e7e8", "#23393e"],
  banner: ["#e2e6e5", "#496864"],
  frame: ["#e7dfd5", "#8f6c43"],
};
const label = (x, y, text, size = 24, fill = "#faf8ed") =>
  `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" letter-spacing="3" text-anchor="middle" fill="${fill}">${text}</text>`;
const leaf = `<path d="M0 0Q-55-65-12-110Q35-65 0 0M0 0Q65-45 95-15Q55 25 0 0" fill="none" stroke="currentColor" stroke-width="2"/>`;
function art(type, color) {
  if (type === "cards")
    return `<g transform="translate(290 445) rotate(-17)" filter="url(#shadow)"><rect x="-178" y="-97" width="355" height="199" rx="4" fill="#c4c1ae"/><rect x="-178" y="-111" width="355" height="199" rx="3" fill="#fcf9ef"/>${label(0, -28, "MIRA STUDIO", 27, "#294841")}${label(0, 8, "DESIGN WITH PURPOSE", 10, "#294841")}<path d="M-25 40H25" stroke="#294841"/></g><g transform="translate(290 280) rotate(12)" filter="url(#shadow)"><rect x="-165" y="-100" width="330" height="192" rx="3" fill="${color}"/>${label(0, -8, "mira.", 54)}${label(0, 28, "A LITTLE INTRODUCTION.", 10)}</g>`;
  if (["polo", "shirt", "tshirt", "hoodie"].includes(type)) {
    const polo = type === "polo" || type === "shirt",
      hood = type === "hoodie";
    return `<g filter="url(#shadow)" transform="translate(0 20)"><path d="M211 155L135 191 67 300 140 341 177 285 162 570Q302 594 441 570L424 285 461 341 534 300 465 191 389 155Q300 185 211 155Z" fill="url(#material)"/><path d="M211 155Q300 215 389 155L356 203Q300 230 244 203Z" fill="${color}" stroke="#ffffff44" stroke-width="2"/>${polo ? `<path d="M211 155L256 137 299 182 270 222ZM389 155L344 137 299 182 328 222Z" fill="${color}" stroke="#ffffff44" stroke-width="2"/><path d="M299 183V${type === "shirt" ? 565 : 275}" stroke="#ffffff70" stroke-width="3"/><circle cx="309" cy="237" r="3" fill="#e3e5e0"/><circle cx="309" cy="260" r="3" fill="#e3e5e0"/>` : ""}${hood ? '<path d="M211 155Q221 66 300 82Q379 66 389 155L346 193H254Z" fill="url(#material)" stroke="#ffffff40"/><path d="M264 205V307M336 205V307M237 470Q300 505 363 470L376 536H224Z" stroke="#ffffff55" fill="none"/>' : ""}<path d="M185 558Q301 578 418 558M79 296L142 329M458 329L521 296" stroke="#ffffff44" fill="none"/>${label(364, 288, "NORTH", 12, type === "shirt" ? "#344a57" : "#f7f5ea")}</g>`;
  }
  if (type === "stamp")
    return `<g filter="url(#shadow)" transform="translate(5 -5)"><ellipse cx="300" cy="560" rx="148" ry="29" fill="#0001"/><path d="M174 366L413 366 439 536Q300 576 150 529Z" fill="url(#material)"/><rect x="164" y="340" width="265" height="86" rx="24" fill="#36434b"/><rect x="184" y="212" width="222" height="166" rx="34" fill="#1e252c"/><rect x="204" y="245" width="181" height="80" rx="6" fill="#f3f0e6"/>${label(294, 278, "APPROVED", 17, "#243c3b")}${label(294, 302, "MIRA STUDIO", 10, "#243c3b")}<rect x="176" y="476" width="237" height="38" rx="7" fill="#c8d7dc"/></g>`;
  if (type === "mug")
    return `<g filter="url(#shadow)"><path d="M399 280C557 240 555 479 406 470V430C495 432 493 301 400 325Z" fill="#d4cdbd"/><path d="M174 261Q291 225 412 261L402 496Q296 548 182 496Z" fill="url(#material)"/><ellipse cx="293" cy="261" rx="119" ry="28" fill="#f9f6ee"/><ellipse cx="293" cy="263" rx="105" ry="18" fill="#c8c0ac"/>${label(293, 378, "slow", 49, "#425e50")}${label(293, 410, "MORNINGS", 15, "#425e50")}</g>`;
  if (type === "bottle")
    return `<g filter="url(#shadow)"><rect x="244" y="129" width="112" height="57" rx="12" fill="#232e31"/><path d="M245 177V224Q210 252 210 286V567Q300 605 390 567V286Q390 252 355 224V177Z" fill="url(#material)"/><path d="M233 292V545" stroke="#ffffff44" stroke-width="9" stroke-linecap="round"/>${label(300, 372, "NORTH", 23)}${label(300, 400, "GO FURTHER", 10)}</g>`;
  if (type === "cap")
    return `<g filter="url(#shadow)"><path d="M151 424Q128 207 308 200Q482 209 465 431Z" fill="url(#material)"/><path d="M171 417Q333 383 466 430Q547 465 506 499Q362 577 112 483Q69 458 171 417Z" fill="${color}"/><path d="M308 204Q272 302 285 414M167 438Q339 411 490 468" fill="none" stroke="#ffffff44" stroke-width="3"/>${label(310, 348, "NORTH", 25, "#40503c")}</g>`;
  if (type === "tote" || type === "packaging")
    return `<g filter="url(#shadow)" transform="rotate(-7 300 400)"><path d="M209 288V204Q209 121 276 121Q343 121 343 204V288M256 284V204Q256 123 324 123Q391 123 391 204V288" stroke="${type === "tote" ? "#c6b58f" : "#7d5836"}" stroke-width="13" fill="none"/><path d="M137 260L443 260 469 587Q293 624 122 582Z" fill="url(#material)"/><path d="M417 264L443 260 469 587 431 568Z" fill="#0002"/>${label(291, 399, type === "tote" ? "WANDER" : "GOOD THINGS", type === "tote" ? 29 : 23, "#37594a")}${label(291, 435, type === "tote" ? "A LITTLE EVERY DAY" : "COME IN SMALL PACKAGES", 10, "#37594a")}<g transform="translate(291 528) scale(.5)" color="#37594a">${leaf}</g></g>`;
  if (type === "stickers")
    return `<g transform="translate(300 365) rotate(-13)" filter="url(#shadow)"><rect x="-186" y="-218" width="371" height="465" rx="4" fill="#fffdf7"/>${[-1, 0, 1].flatMap((x) => [-1, 0, 1].map((y) => `<g transform="translate(${x * 113} ${y * 135})"><circle r="48" fill="${(x + y) % 2 ? color : "#405e4e"}"/>${label(0, 4, "fresh.", 16)}${label(0, 21, "MADE WITH LOVE", 5)}</g>`)).join("")}</g>`;
  if (type === "poster" || type === "banner")
    return `<g filter="url(#shadow)"><path d="M141 120H459V593H141Z" fill="#f4f0e8"/><path d="M155 134H445V577H155Z" fill="${color}"/><circle cx="376" cy="220" r="90" fill="#f6c96a"/><path d="M155 438Q270 254 445 416V577H155Z" fill="#314f48"/>${label(298, 219, "MAKE", 52)}${label(298, 279, "YOUR", 52)}${label(298, 339, "MARK.", 52)}${label(298, 510, "BIG IDEAS. BEAUTIFULLY PRINTED.", 9)}${type === "banner" ? '<path d="M128 594H472V612H128ZM223 614L178 658M377 614L422 658" stroke="#53575b" stroke-width="12"/>' : ""}</g>`;
  if (type === "flyer")
    return `<g transform="rotate(13 300 350)" filter="url(#shadow)"><rect x="154" y="160" width="305" height="430" fill="#abb294"/></g><g transform="rotate(-9 300 350)" filter="url(#shadow)"><rect x="116" y="115" width="313" height="442" fill="#f5f0df"/><rect x="132" y="131" width="281" height="204" fill="${color}"/><g transform="translate(270 310)" color="#d9dfb7">${leaf}</g>${label(272, 392, "GROW", 46, "#40513b")}${label(272, 426, "SOMETHING GOOD.", 17, "#40513b")}<path d="M191 467H353M213 482H331M228 496H316" stroke="#8a9078" stroke-width="3"/></g>`;
  if (type === "pen")
    return `<g transform="rotate(30 300 375)" filter="url(#shadow)"><rect x="275" y="141" width="50" height="410" rx="14" fill="url(#material)"/><path d="M275 520H325L300 603Z" fill="#b7b6b0"/><path d="M300 603L295 585H305Z" fill="#303336"/><rect x="275" y="170" width="50" height="12" fill="#c6c9c5"/><path d="M322 158V288" stroke="#bec6c6" stroke-width="9" stroke-linecap="round"/>${label(300, 381, "m", 24)}</g>`;
  if (type === "frame")
    return `<g filter="url(#shadow)" transform="rotate(-7 300 375)"><rect x="118" y="143" width="364" height="454" fill="${color}"/><rect x="136" y="161" width="328" height="418" fill="#faf7ec"/><rect x="161" y="189" width="278" height="361" fill="#c4b9a1"/><circle cx="346" cy="288" r="61" fill="#f4d9a1"/><path d="M161 489L269 319 439 498V550H161Z" fill="#6e8064"/><path d="M161 510L226 427 314 550H161Z" fill="#a5ad88"/></g>`;
  return `<g filter="url(#shadow)" transform="translate(300 370) rotate(-13)"><rect x="-153" y="-226" width="325" height="452" rx="7" fill="#d5d1bf"/><rect x="-164" y="-233" width="325" height="452" rx="7" fill="url(#material)"/><path d="M-144-229V215" stroke="#ffffff33" stroke-width="3"/>${label(0, -70, type === "album" ? "our story" : type === "folder" ? "MIRA STUDIO" : "NOTES", type === "album" ? 35 : 24)}${label(0, -35, type === "album" ? "THE MOMENTS THAT MATTER" : "ROOM FOR GREAT IDEAS", 9)}<g transform="translate(0 125) scale(.7)" color="#d9dfbd">${leaf}</g>${type === "notebook" ? '<path d="M122-230V218" stroke="#192c25" stroke-width="11"/>' : ""}</g>`;
}
for (const [type, [background, color]] of Object.entries(palettes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><defs><linearGradient id="bg" x2=".8" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${background}" stop-opacity=".75"/></linearGradient><linearGradient id="material"><stop stop-color="${color}"/><stop offset=".4" stop-color="${color}"/><stop offset=".7" stop-color="${color}" stop-opacity=".88"/><stop offset="1" stop-color="${color}"/></linearGradient><filter id="shadow" x="-50%" y="-30%" width="210%" height="180%"><feDropShadow dx="12" dy="23" stdDeviation="16" flood-color="#25251c" flood-opacity=".21"/></filter></defs><rect width="600" height="750" fill="url(#bg)"/><path d="M0 590L600 390V750H0Z" fill="#ffffff" opacity=".1"/>${art(type, color)}</svg>`;
  writeFileSync(`public/assets/${type}.svg`, svg);
}
console.log(`Generated ${Object.keys(palettes).length} original SVG assets.`);
