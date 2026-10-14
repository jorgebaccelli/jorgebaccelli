(() => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#navegacao");
  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir menu");
    nav.classList.remove("is-open");
  }
  menu.addEventListener("click", () => {
    const isOpen = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!isOpen));
    menu.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    nav.classList.toggle("is-open", !isOpen);
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      menu.focus();
    }
  });
  window
    .matchMedia("(min-width: 901px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const horizontalTabs = window.matchMedia("(max-width: 600px)");
  function updateTabOrientation() {
    document
      .querySelector('[role="tablist"]')
      .setAttribute(
        "aria-orientation",
        horizontalTabs.matches ? "horizontal" : "vertical",
      );
  }
  updateTabOrientation();
  horizontalTabs.addEventListener("change", updateTabOrientation);
  function activateTab(tab) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let target;
      if (event.key === "ArrowRight" || event.key === "ArrowDown")
        target = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft" || event.key === "ArrowUp")
        target = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === "Home") target = tabs[0];
      if (event.key === "End") target = tabs[tabs.length - 1];
      if (target) {
        event.preventDefault();
        activateTab(target);
        target.focus();
      }
    });
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
})();

// Decorative binary streams: no external assets or personal data.
(() => {
  const canvas = document.querySelector("#binary-backdrop");
  const toggle = document.querySelector("#motion-toggle");
  const context = canvas?.getContext("2d");
  if (!context || !toggle) return;

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let enabled = !motionPreference.matches;
  let animationFrame = null;
  let previousFrame = null;
  let width = 0;
  let height = 0;
  let streams = [];

  function draw() {
    context.clearRect(0, 0, width, height);
    context.font = `${width < 600 ? 11 : 12}px Consolas, monospace`;
    context.textAlign = "center";
    for (const stream of streams) {
      for (let index = 0; index < stream.bits.length; index++) {
        const y = stream.y - index * 20 * stream.direction;
        if (y < -20 || y > height + 20) continue;
        const alpha = (1 - index / stream.bits.length) * stream.opacity;
        context.fillStyle =
          index === 0
            ? `rgba(165,255,116,${alpha})`
            : `rgba(117,251,55,${alpha})`;
        context.fillText(stream.bits[index], stream.x, y);
      }
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.max(8, Math.min(64, Math.floor(width / 30)));
    const gap = width / columns;
    streams = Array.from({ length: columns }, (_, index) => ({
      x: (index + 0.5) * gap,
      y: Math.random() * height,
      direction: index % 3 === 0 ? -1 : 1,
      speed: 18 + Math.random() * 20,
      opacity: 0.22 + Math.random() * 0.24,
      bits: Array.from({ length: 9 + Math.floor(Math.random() * 10) }, () =>
        Math.random() < 0.5 ? "0" : "1",
      ),
    }));
    draw();
  }

  function stop() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    previousFrame = null;
  }

  function frame(time) {
    animationFrame = null;
    if (!enabled || document.hidden) return;
    if (previousFrame === null) previousFrame = time;
    const elapsed = time - previousFrame;
    // Limit redraws to 30 fps and avoid jumps after a suspended tab.
    if (elapsed >= 1000 / 30) {
      const delta = Math.min(elapsed, 100) / 1000;
      previousFrame = time;
      for (const stream of streams) {
        stream.y += stream.speed * delta * stream.direction;
        const trail = stream.bits.length * 20;
        if (stream.direction === 1 && stream.y > height + trail) stream.y = -20;
        if (stream.direction === -1 && stream.y < -trail)
          stream.y = height + 20;
      }
      draw();
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function start() {
    if (enabled && !document.hidden && animationFrame === null) {
      animationFrame = requestAnimationFrame(frame);
    }
  }

  function updateControl() {
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.querySelector(".motion-label").textContent = enabled
      ? "Pausar efeito"
      : "Ativar efeito";
    toggle
      .querySelector("path")
      .setAttribute("d", enabled ? "M8 5v14M16 5v14" : "m8 5 11 7-11 7V5Z");
    canvas.dataset.animation = enabled ? "running" : "paused";
  }

  toggle.hidden = false;
  resize();
  updateControl();
  start();
  toggle.addEventListener("click", () => {
    enabled = !enabled;
    stop();
    updateControl();
    start();
  });
  motionPreference.addEventListener("change", () => {
    enabled = !motionPreference.matches;
    stop();
    updateControl();
    start();
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", start);
})();
