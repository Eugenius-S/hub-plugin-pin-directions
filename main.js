// Pinned directions: a pin on each direction row; pinned ones go to the top of the "Directions" block
// in pin order, the rest stay as the hub orders them. Pins are stored in this browser.
// UI strings: en by default, ru when the hub language is Russian (picked at use time by hub.lang).
const STR = {
  en: { unpin: "Unpin", pin: "Pin to the top of Directions" },
  ru: { unpin: "Открепить", pin: "Закрепить вверху «Направлений»" },
};
const t = (hub, k) => (STR[hub.lang] ?? STR.en)[k] ?? STR.en[k];
const KEY = "hub.pinnedDirections";
const pins = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));
// a direction as the hub sees it: not a specialist, keeps a backlog or is in the directions list
const isDirection = (s, snap) => s.role !== "agent" && (!!s.backlog || (snap.directions || []).includes(s.name));

export default function register(hub) {
  hub.addStyle("style.css");
  hub.addOrder((group, rows) => {
    if (group !== "directions") return rows;
    const p = pins();
    const top = p.map((n) => rows.find((r) => r.name === n)).filter(Boolean);
    return [...top, ...rows.filter((r) => !p.includes(r.name))];
  });
  hub.addSlot("sidebar.session", {
    id: "pin",
    render(root, snap, { session }) {
      if (!isDirection(session, snap)) { root.replaceChildren(); return; }
      const on = pins().includes(session.name);
      let b = root.querySelector(".pin-dir");
      if (!b) {
        b = hub.el("span", "pin-dir");
        b.setAttribute("role", "button");
        b.tabIndex = 0;
        b.dataset.session = session.name;
        const toggle = (e) => {
          e.stopPropagation(); e.preventDefault();   // the row does not open
          const p = pins();
          save(p.includes(session.name) ? p.filter((n) => n !== session.name) : [...p, session.name]);
          hub.redraw();
        };
        b.addEventListener("click", toggle);
        b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") toggle(e); });
        root.replaceChildren(b);
      }
      b.classList.toggle("on", on);
      b.title = on ? t(hub, "unpin") : t(hub, "pin");
      b.setAttribute("aria-pressed", String(on));
      b.replaceChildren(hub.icon ? iconPin(hub) : "📌");
    },
  });
}

function iconPin(hub) {
  const i = hub.el("span", "pin-ico");
  i.style.maskImage = i.style.webkitMaskImage = `url(${hub.url("icon.svg")})`;
  return i;
}
