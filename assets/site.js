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

  const topics = [...document.querySelectorAll("[data-topic]")];
  const topicCodes = {
    "Gestão contínua": "gestao_continua",
    "Análise de vulnerabilidades": "analise_vulnerabilidades",
    "Soluções e licenciamento Tenable": "solucoes_licenciamento",
    "Gestão de exposição": "gestao_exposicao",
  };
  function selectTopic(topic) {
    topics.forEach((button) => {
      const selected = button.dataset.topic === topic;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const destination = new URL("https://symbioti.com.br/");
    destination.search = new URLSearchParams({
      utm_source: "tenable.com.br",
      utm_medium: "hotsite",
      utm_campaign: "gestao_vulnerabilidades",
      utm_content: topicCodes[topic] || "gestao_continua",
    }).toString();
    document.querySelector("#contact-link").href = destination.href;
  }
  topics.forEach((button) =>
    button.addEventListener("click", () => selectTopic(button.dataset.topic)),
  );
  document
    .querySelectorAll("[data-interest]")
    .forEach((link) =>
      link.addEventListener("click", () => selectTopic(link.dataset.interest)),
    );

  const priorityButtons = [
    ...document.querySelectorAll("[data-priority-view]"),
  ];
  const priorityRows = [...document.querySelectorAll("#priority-rows tr")];
  const priorityExplanation = document.querySelector("#priority-explanation");
  priorityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const contextView = button.dataset.priorityView === "context";
      const orderKey = contextView ? "contextOrder" : "severityOrder";
      priorityButtons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      const orderedRows = [...priorityRows].sort(
        (a, b) => Number(a.dataset[orderKey]) - Number(b.dataset[orderKey]),
      );
      orderedRows.forEach((row, index) => {
        row.querySelector(".priority-rank").textContent = `${index + 1}º`;
        row.classList.toggle("top-ranked", index === 0);
        document.querySelector("#priority-rows").appendChild(row);
      });
      const label = document.createElement("strong");
      label.textContent = contextView ? "Com contexto: " : "Pela nota CVSS: ";
      priorityExplanation.replaceChildren(
        label,
        document.createTextNode(
          contextView
            ? "o portal aparece primeiro porque combina acesso pela internet, exploração conhecida e impacto na operação, mesmo com nota menor."
            : "o servidor de testes aparece primeiro porque tem a maior severidade técnica. Essa ordenação não considera exposição, isolamento ou importância para a operação.",
        ),
      );
    });
  });

  const dialog = document.querySelector("#assessment-dialog");
  const form = document.querySelector("#assessment-form");
  const result = document.querySelector("#assessment-result");
  let dialogExitTarget = null;
  document
    .querySelector("#open-assessment")
    .addEventListener("click", () => dialog.showModal());
  document
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    const target =
      dialogExitTarget || document.querySelector("#open-assessment");
    dialogExitTarget = null;
    target.focus({ preventScroll: true });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answers = new FormData(form);
    const visibility = Number(answers.get("visibility"));
    const analysis = Number(answers.get("analysis"));
    const priority = Number(answers.get("priority"));
    let guidance;
    if (visibility < 2) {
      guidance = {
        title: "Defina quais ativos precisam ser avaliados.",
        description:
          "Relacione servidores, computadores, dispositivos de rede e serviços relevantes. Esse inventário ajuda a combinar escopo, conectividade e acessos autorizados antes das verificações.",
        topic: "Gestão contínua",
      };
    } else if (analysis < 2) {
      guidance = {
        title: "Combine uma rotina de avaliações técnicas.",
        description:
          "Com os ativos definidos, discuta frequência, uso de varreduras autenticadas quando suportadas e revisão das evidências. O objetivo é identificar falhas e orientar o tratamento.",
        topic: "Análise de vulnerabilidades",
      };
    } else if (priority < 2) {
      guidance = {
        title: "Priorize e verifique as correções.",
        description:
          "Além da nota CVSS, considere exposição, exploração conhecida e importância do sistema. Combine responsáveis, prazos de tratamento e uma nova verificação após as mudanças.",
        topic: "Gestão contínua",
      };
    } else {
      guidance = {
        title: "Avalie como conectar diferentes exposições.",
        description:
          "Suas respostas descrevem um processo estruturado. Uma avaliação técnica pode revisar a cobertura e discutir relações entre infraestrutura, nuvem e identidades, conforme as soluções e módulos necessários.",
        topic: "Gestão de exposição",
      };
    }
    document.querySelector("#result-title").textContent = guidance.title;
    document.querySelector("#result-description").textContent =
      guidance.description;
    document.querySelector("#result-contact").dataset.topic = guidance.topic;
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });
  document
    .querySelector("#result-contact")
    .addEventListener("click", (event) => {
      selectTopic(event.currentTarget.dataset.topic);
      dialogExitTarget = document.querySelector("#contact-link");
      dialog.close();
    });
  document
    .querySelector("#restart-assessment")
    .addEventListener("click", () => {
      form.reset();
      result.hidden = true;
      form.hidden = false;
      form.querySelector("input").focus();
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
