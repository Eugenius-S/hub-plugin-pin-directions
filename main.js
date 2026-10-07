// Закреплённые направления : булавка у строки направления; закреплённые — вверху блока «Направления»
// в порядке закрепления, остальные — как в хабе. Закрепления хранятся в этом браузере.
const KEY = "hub.pinnedDirections";
const pins = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));
// направление — как его видит хаб: не специалист, ведёт бэклог или есть в списке направлений
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
          e.stopPropagation(); e.preventDefault();   // строка не открывается
          const p = pins();
          save(p.includes(session.name) ? p.filter((n) => n !== session.name) : [...p, session.name]);
          hub.redraw();
        };
        b.addEventListener("click", toggle);
        b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") toggle(e); });
        root.replaceChildren(b);
      }
      b.classList.toggle("on", on);
      b.title = on ? "Открепить" : "Закрепить вверху «Направлений»";
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
