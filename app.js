(() => {
  "use strict";

  /* =========================================================
     SHORT HELPERS
  ========================================================= */

  const $ = id =>
    document.getElementById(id);

  const $$ = selector =>
    [...document.querySelectorAll(selector)];

  const clamp = (x, min, max) =>
    Math.min(max, Math.max(min, x));

  const fmt = (x, digits = 2) =>
    Number.isFinite(x)
      ? Number(x).toFixed(digits)
      : "—";

  const rand = (min, max) =>
    min + Math.random() * (max - min);

  const randInt = (min, max) =>
    Math.floor(
      rand(min, max + 1)
    );

  const choose = arr =>
    arr[
      Math.floor(
        Math.random() *
        arr.length
      )
    ];

  const css = (
    variable,
    fallback
  ) =>
    getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(variable)
      .trim() || fallback;


  /* =========================================================
     CANVAS PREPARATION
  ========================================================= */

  function prepareCanvas(canvas) {
    if (!canvas) {
      return null;
    }

    const ratio =
      Math.max(
        1,
        window.devicePixelRatio || 1
      );

    const attrWidth =
      Number(
        canvas.getAttribute("width")
      ) || 800;

    const attrHeight =
      Number(
        canvas.getAttribute("height")
      ) || 400;

    const width =
      Math.max(
        280,
        canvas.clientWidth ||
          attrWidth
      );

    const height =
      width *
      attrHeight /
      attrWidth;

    const pixelWidth =
      Math.round(
        width * ratio
      );

    const pixelHeight =
      Math.round(
        height * ratio
      );

    if (
      canvas.width !== pixelWidth ||
      canvas.height !== pixelHeight
    ) {
      canvas.width =
        pixelWidth;

      canvas.height =
        pixelHeight;

      canvas.style.height =
        `${height}px`;
    }

    const ctx =
      canvas.getContext("2d");

    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    return {
      ctx,
      w: width,
      h: height
    };
  }


  function drawGrid(
    ctx,
    w,
    h,
    pad = 40,
    nx = 8,
    ny = 6
  ) {
    ctx.save();

    ctx.strokeStyle =
      "rgba(255,255,255,.075)";

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i <= nx;
      i++
    ) {
      const x =
        pad +
        (
          w -
          2 * pad
        ) *
        i /
        nx;

      ctx.beginPath();

      ctx.moveTo(
        x,
        pad
      );

      ctx.lineTo(
        x,
        h - pad
      );

      ctx.stroke();
    }

    for (
      let j = 0;
      j <= ny;
      j++
    ) {
      const y =
        pad +
        (
          h -
          2 * pad
        ) *
        j /
        ny;

      ctx.beginPath();

      ctx.moveTo(
        pad,
        y
      );

      ctx.lineTo(
        w - pad,
        y
      );

      ctx.stroke();
    }

    ctx.restore();
  }


  function canvasLabel(
    ctx,
    text,
    x,
    y,
    align = "left",
    colour =
      "rgba(247,241,220,.74)"
  ) {
    ctx.save();

    ctx.fillStyle =
      colour;

    ctx.font =
      "11px ui-monospace, monospace";

    ctx.textAlign =
      align;

    ctx.fillText(
      text,
      x,
      y
    );

    ctx.restore();
  }


  function drawArrow(
    ctx,
    x1,
    y1,
    x2,
    y2,
    colour
  ) {
    const angle =
      Math.atan2(
        y2 - y1,
        x2 - x1
      );

    ctx.save();

    ctx.strokeStyle =
      colour;

    ctx.fillStyle =
      colour;

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
      x1,
      y1
    );

    ctx.lineTo(
      x2,
      y2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      x2,
      y2
    );

    ctx.lineTo(
      x2 -
        10 *
        Math.cos(
          angle - 0.5
        ),
      y2 -
        10 *
        Math.sin(
          angle - 0.5
        )
    );

    ctx.lineTo(
      x2 -
        10 *
        Math.cos(
          angle + 0.5
        ),
      y2 -
        10 *
        Math.sin(
          angle + 0.5
        )
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }


  /* =========================================================
     SCROLL PROGRESS
  ========================================================= */

  function updateScrollProgress() {
    const root =
      document.documentElement;

    const maximum =
      root.scrollHeight -
      window.innerHeight;

    const fraction =
      maximum > 0
        ? window.scrollY /
          maximum
        : 0;

    const bar =
      $("scrollProgress");

    if (bar) {
      bar.style.width =
        `${clamp(
          fraction,
          0,
          1
        ) * 100}%`;
    }
  }


  window.addEventListener(
    "scroll",
    updateScrollProgress,
    {
      passive: true
    }
  );

  updateScrollProgress();


  /* =========================================================
     ACTIVE NAVIGATION
  ========================================================= */

  const sections =
    $$(
      "main section[id]"
    );

  const navLinks =
    $$(".nav a");


  if (
    "IntersectionObserver"
    in window
  ) {
    const navObserver =
      new IntersectionObserver(
        entries => {
          const visible =
            entries
              .filter(
                entry =>
                  entry.isIntersecting
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          if (!visible) {
            return;
          }

          navLinks.forEach(
            link => {
              link.classList.toggle(
                "active",
                link.getAttribute(
                  "href"
                ) ===
                  `#${visible.target.id}`
              );
            }
          );
        },
        {
          rootMargin:
            "-20% 0px -65% 0px",

          threshold:
            [
              0.05,
              0.2,
              0.5
            ]
        }
      );

    sections.forEach(
      section =>
        navObserver.observe(
          section
        )
    );
  }


  /* =========================================================
     COURSE COMPLETION
  ========================================================= */

  const completionButtons =
    $$(
      "[data-complete]"
    );

  let completed =
    new Set(
      JSON.parse(
        localStorage.getItem(
          "oscillation-grove-completed"
        ) || "[]"
      )
    );


  function renderCompletion() {
    completionButtons.forEach(
      button => {
        const key =
          button.dataset.complete;

        const done =
          completed.has(key);

        button.classList.toggle(
          "done",
          done
        );

        button.textContent =
          done
            ? "✓ Module complete"
            : "Mark complete";
      }
    );

    const percentage =
      completionButtons.length
        ? Math.round(
            100 *
              completed.size /
              completionButtons.length
          )
        : 0;

    if ($("completionPct")) {
      $("completionPct")
        .textContent =
        `${percentage}%`;
    }

    if ($("completionBar")) {
      $("completionBar")
        .style.width =
        `${percentage}%`;
    }
  }


  completionButtons.forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          const key =
            button.dataset.complete;

          if (
            completed.has(key)
          ) {
            completed.delete(key);
          } else {
            completed.add(key);
          }

          localStorage.setItem(
            "oscillation-grove-completed",
            JSON.stringify(
              [...completed]
            )
          );

          renderCompletion();
        }
      );
    }
  );


  $("resetProgress")
    ?.addEventListener(
      "click",
      () => {
        completed.clear();

        localStorage.removeItem(
          "oscillation-grove-completed"
        );

        renderCompletion();
      }
    );


  renderCompletion();


  /* =========================================================
     ACTIVE RECALL REVEALS
  ========================================================= */

  $$(".recall-toggle")
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const card =
              button.closest(
                ".recall-card"
              );

            const answer =
              card?.querySelector(
                ".recall-answer"
              );

            if (!answer) {
              return;
            }

            answer.classList.toggle(
              "show"
            );

            button.textContent =
              answer.classList.contains(
                "show"
              )
                ? "Hide answer"
                : "Reveal answer";
          }
        );
      }
    );


  /* =========================================================
     INTERACTIVE MINDMAPS
  ========================================================= */

  const mindmaps = {

    module1: {
      nodes: [
        {
          id: "centre",
          label:
            "Linear restoring force",
          sub:
            "F = −kx",
          x: 50,
          y: 47,
          core: true
        },

        {
          id: "newton",
          label:
            "Newton II",
          sub:
            "F = ma",
          x: 19,
          y: 22
        },

        {
          id: "ode",
          label:
            "Equation of motion",
          sub:
            "x¨ + (k/m)x = 0",
          x: 50,
          y: 15
        },

        {
          id: "omega",
          label:
            "Natural frequency",
          sub:
            "ω = √(k/m)",
          x: 81,
          y: 23
        },

        {
          id: "accel",
          label:
            "Acceleration",
          sub:
            "a = −ω²x",
          x: 80,
          y: 70
        },

        {
          id: "equilibrium",
          label:
            "Equilibrium",
          sub:
            "x = 0",
          x: 20,
          y: 72
        },

        {
          id: "period",
          label:
            "Period",
          sub:
            "T = 2π√(m/k)",
          x: 50,
          y: 84
        }
      ],

      links: [
        ["newton", "centre"],
        ["centre", "ode"],
        ["ode", "omega"],
        ["omega", "accel"],
        ["centre", "equilibrium"],
        ["omega", "period"],
        ["centre", "accel"]
      ]
    },


    module2: {
      nodes: [
        {
          id: "ode",
          label:
            "SHM ODE",
          sub:
            "x¨ + ω²x = 0",
          x: 50,
          y: 48,
          core: true
        },

        {
          id: "trial",
          label:
            "Trial solution",
          sub:
            "e^{rt}",
          x: 18,
          y: 22
        },

        {
          id: "roots",
          label:
            "Complex roots",
          sub:
            "r = ±iω",
          x: 50,
          y: 16
        },

        {
          id: "euler",
          label:
            "Euler identity",
          sub:
            "e^{iθ}=cosθ+i sinθ",
          x: 82,
          y: 22
        },

        {
          id: "trig",
          label:
            "Real solution",
          sub:
            "C cosωt + D sinωt",
          x: 80,
          y: 69
        },

        {
          id: "phase",
          label:
            "Amplitude–phase form",
          sub:
            "A cos(ωt+φ)",
          x: 50,
          y: 84
        },

        {
          id: "initial",
          label:
            "Initial conditions",
          sub:
            "x₀, v₀ determine A,φ",
          x: 19,
          y: 70
        }
      ],

      links: [
        ["ode", "trial"],
        ["trial", "roots"],
        ["roots", "euler"],
        ["euler", "trig"],
        ["trig", "phase"],
        ["initial", "phase"],
        ["phase", "ode"]
      ]
    },


    module3: {
      nodes: [
        {
          id: "x",
          label:
            "Position",
          sub:
            "A cosθ",
          x: 50,
          y: 48,
          core: true
        },

        {
          id: "v",
          label:
            "Velocity",
          sub:
            "−ωA sinθ",
          x: 20,
          y: 20
        },

        {
          id: "a",
          label:
            "Acceleration",
          sub:
            "−ω²A cosθ",
          x: 80,
          y: 20
        },

        {
          id: "phase",
          label:
            "Phase",
          sub:
            "θ = ωt+φ",
          x: 50,
          y: 15
        },

        {
          id: "vmax",
          label:
            "Max speed",
          sub:
            "ωA at x=0",
          x: 18,
          y: 76
        },

        {
          id: "amax",
          label:
            "Max acceleration",
          sub:
            "ω²A at |x|=A",
          x: 82,
          y: 76
        },

        {
          id: "eliminate",
          label:
            "No-time relation",
          sub:
            "v²=ω²(A²−x²)",
          x: 50,
          y: 87
        }
      ],

      links: [
        ["phase", "x"],
        ["x", "v"],
        ["x", "a"],
        ["v", "vmax"],
        ["a", "amax"],
        ["vmax", "eliminate"],
        ["amax", "eliminate"],
        ["x", "eliminate"]
      ]
    },


    module4: {
      nodes: [
        {
          id: "total",
          label:
            "Total energy",
          sub:
            "E = ½kA²",
          x: 50,
          y: 48,
          core: true
        },

        {
          id: "u",
          label:
            "Potential",
          sub:
            "U = ½kx²",
          x: 20,
          y: 24
        },

        {
          id: "k",
          label:
            "Kinetic",
          sub:
            "K = ½mv²",
          x: 80,
          y: 24
        },

        {
          id: "turn",
          label:
            "Turning points",
          sub:
            "K=0, U=E",
          x: 18,
          y: 73
        },

        {
          id: "eq",
          label:
            "Equilibrium",
          sub:
            "U=0, K=E",
          x: 82,
          y: 73
        },

        {
          id: "vx",
          label:
            "Velocity-position",
          sub:
            "v²=ω²(A²−x²)",
          x: 50,
          y: 86
        }
      ],

      links: [
        ["total", "u"],
        ["total", "k"],
        ["u", "turn"],
        ["k", "eq"],
        ["total", "vx"],
        ["u", "vx"],
        ["k", "vx"]
      ]
    },


    module5: {
      nodes: [
        {
          id: "angular",
          label:
            "Angular SHM",
          sub:
            "θ¨ + ω²θ = 0",
          x: 50,
          y: 46,
          core: true
        },

        {
          id: "torsion",
          label:
            "Torsion",
          sub:
            "τ = −κθ",
          x: 18,
          y: 22
        },

        {
          id: "simple",
          label:
            "Simple pendulum",
          sub:
            "sinθ ≈ θ",
          x: 82,
          y: 22
        },

        {
          id: "rot",
          label:
            "Rotation law",
          sub:
            "τ = Iθ¨",
          x: 18,
          y: 74
        },

        {
          id: "torsomega",
          label:
            "Torsion frequency",
          sub:
            "ω = √(κ/I)",
          x: 50,
          y: 84
        },

        {
          id: "pendomega",
          label:
            "Pendulum frequency",
          sub:
            "ω = √(g/L)",
          x: 82,
          y: 74
        },

        {
          id: "physical",
          label:
            "Physical pendulum",
          sub:
            "T=2π√(I/mgh)",
          x: 50,
          y: 14
        }
      ],

      links: [
        ["torsion", "angular"],
        ["simple", "angular"],
        ["rot", "angular"],
        ["angular", "torsomega"],
        ["angular", "pendomega"],
        ["physical", "angular"]
      ]
    },


    module6: {
      nodes: [
        {
          id: "eq",
          label:
            "Damped equation",
          sub:
            "mx¨+bx˙+kx=0",
          x: 50,
          y: 47,
          core: true
        },

        {
          id: "force",
          label:
            "Drag force",
          sub:
            "Fd = −bv",
          x: 18,
          y: 22
        },

        {
          id: "under",
          label:
            "Underdamped",
          sub:
            "b < 2√mk",
          x: 82,
          y: 20
        },

        {
          id: "critical",
          label:
            "Critical",
          sub:
            "b = 2√mk",
          x: 82,
          y: 49
        },

        {
          id: "over",
          label:
            "Overdamped",
          sub:
            "b > 2√mk",
          x: 82,
          y: 78
        },

        {
          id: "amp",
          label:
            "Amplitude envelope",
          sub:
            "A₀e^{-bt/2m}",
          x: 18,
          y: 73
        },

        {
          id: "energy",
          label:
            "Energy decay",
          sub:
            "E₀e^{-bt/m}",
          x: 50,
          y: 85
        }
      ],

      links: [
        ["force", "eq"],
        ["eq", "under"],
        ["eq", "critical"],
        ["eq", "over"],
        ["eq", "amp"],
        ["amp", "energy"]
      ]
    },


    module7: {
      nodes: [
        {
          id: "drive",
          label:
            "Driven oscillator",
          sub:
            "mx¨+bx˙+kx=F₀cosωt",
          x: 50,
          y: 47,
          core: true
        },

        {
          id: "natural",
          label:
            "Natural frequency",
          sub:
            "ω₀≈√(k/m)",
          x: 18,
          y: 20
        },

        {
          id: "forcing",
          label:
            "Driving frequency",
          sub:
            "ω",
          x: 82,
          y: 20
        },

        {
          id: "phase",
          label:
            "Relative phase",
          sub:
            "controls work transfer",
          x: 20,
          y: 74
        },

        {
          id: "resonance",
          label:
            "Resonance",
          sub:
            "large response near ω₀",
          x: 50,
          y: 85
        },

        {
          id: "damping",
          label:
            "Damping",
          sub:
            "lowers + broadens peak",
          x: 82,
          y: 74
        },

        {
          id: "amp",
          label:
            "Response amplitude",
          sub:
            "X(ω)",
          x: 50,
          y: 14
        }
      ],

      links: [
        ["natural", "drive"],
        ["forcing", "drive"],
        ["drive", "phase"],
        ["drive", "damping"],
        ["phase", "resonance"],
        ["damping", "resonance"],
        ["amp", "drive"]
      ]
    }
  };


  function renderMindmap(
    element
  ) {
    const key =
      element.dataset.map;

    const map =
      mindmaps[key];

    if (!map) {
      return;
    }

    element.innerHTML = "";

    const svg =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

    svg.setAttribute(
      "viewBox",
      "0 0 1000 400"
    );

    svg.setAttribute(
      "preserveAspectRatio",
      "none"
    );

    const nodeLookup =
      Object.fromEntries(
        map.nodes.map(
          node => [
            node.id,
            node
          ]
        )
      );


    map.links.forEach(
      ([from, to]) => {
        const a =
          nodeLookup[from];

        const b =
          nodeLookup[to];

        if (!a || !b) {
          return;
        }

        const line =
          document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );

        line.setAttribute(
          "x1",
          String(
            a.x * 10
          )
        );

        line.setAttribute(
          "y1",
          String(
            a.y * 4
          )
        );

        line.setAttribute(
          "x2",
          String(
            b.x * 10
          )
        );

        line.setAttribute(
          "y2",
          String(
            b.y * 4
          )
        );

        line.setAttribute(
          "stroke",
          "rgba(241,199,91,.45)"
        );

        line.setAttribute(
          "stroke-width",
          "3"
        );

        line.setAttribute(
          "stroke-dasharray",
          "7 6"
        );

        svg.appendChild(line);
      }
    );

    element.appendChild(svg);


    map.nodes.forEach(
      node => {
        const div =
          document.createElement(
            "div"
          );

        div.className =
          `map-node ${
            node.core
              ? "core"
              : ""
          }`;

        div.style.left =
          `${node.x}%`;

        div.style.top =
          `${node.y}%`;

        div.innerHTML = `
          <span>
            ${node.label}
          </span>

          ${
            node.sub
              ? `<small>${node.sub}</small>`
              : ""
          }
        `;

        element.appendChild(
          div
        );
      }
    );
  }


  $$(".mindmap")
    .forEach(
      renderMindmap
    );


  /* =========================================================
     DIGITAL PEN NOTEBOOKS
  ========================================================= */

  const noteCanvases =
    new Map();


  function noteTemplate(key) {
    return `
      <div class="note-station mc-panel">

        <div class="note-head">

          <div>

            <p class="pixel-kicker">
              FIELD NOTEBOOK
            </p>

            <h3>
              Draw, derive, annotate and retrieve
            </h3>

          </div>

          <span
            class="note-save-state"
            data-note-status="${key}"
          >
            ready
          </span>

        </div>


        <div class="note-grid">

          <div class="note-canvas-wrap">

            <canvas
              class="note-canvas"
              data-note-canvas="${key}"
              width="1000"
              height="600"
            ></canvas>

          </div>


          <div class="note-side">

            <div class="note-toolbar">

              <button
                class="mc-button"
                data-note-pen="${key}"
              >
                Pen
              </button>

              <button
                class="mc-button"
                data-note-eraser="${key}"
              >
                Eraser
              </button>

              <button
                class="mc-button"
                data-note-undo="${key}"
              >
                Undo
              </button>

              <button
                class="mc-button"
                data-note-clear="${key}"
              >
                Clear
              </button>

              <button
                class="mc-button"
                data-note-save="${key}"
              >
                Save PNG
              </button>

              <input
                class="note-colour"
                data-note-colour="${key}"
                type="color"
                value="#1b3024"
                title="Pen colour"
              >

            </div>


            <textarea
              data-note-text="${key}"
              placeholder="Typed notes, mistakes to revisit, questions for office hours, derivation steps, memory cues..."
            ></textarea>


            <div class="tip-box">

              <strong>
                Retrieval trick:
              </strong>

              close the explanation above and reconstruct
              the derivation here from memory before checking it.

            </div>

          </div>

        </div>

      </div>
    `;
  }


  $$(".notepad-slot")
    .forEach(
      slot => {
        const key =
          slot.dataset.note;

        slot.innerHTML =
          noteTemplate(key);
      }
    );


  function initialiseNoteCanvas(
    canvas
  ) {
    const key =
      canvas.dataset.noteCanvas;

    const ctx =
      canvas.getContext("2d");

    const state = {
      canvas,
      ctx,
      key,
      drawing: false,
      erasing: false,
      colour: "#1b3024",
      width: 3,
      history: []
    };

    noteCanvases.set(
      key,
      state
    );


    function canvasPoint(
      event
    ) {
      const rect =
        canvas.getBoundingClientRect();

      return {
        x:
          (
            event.clientX -
            rect.left
          ) *
          canvas.width /
          rect.width,

        y:
          (
            event.clientY -
            rect.top
          ) *
          canvas.height /
          rect.height
      };
    }


    function saveHistory() {
      try {
        state.history.push(
          canvas.toDataURL(
            "image/png"
          )
        );

        if (
          state.history.length >
          15
        ) {
          state.history.shift();
        }
      } catch {
        /* ignored */
      }
    }


    function persist() {
      try {
        localStorage.setItem(
          `shm-note-drawing-${key}`,
          canvas.toDataURL(
            "image/png"
          )
        );

        setNoteStatus(
          key,
          "saved"
        );
      } catch {
        setNoteStatus(
          key,
          "storage full"
        );
      }
    }


    function startDrawing(
      event
    ) {
      event.preventDefault();

      canvas.setPointerCapture?.(
        event.pointerId
      );

      saveHistory();

      const p =
        canvasPoint(event);

      state.drawing = true;

      ctx.beginPath();

      ctx.moveTo(
        p.x,
        p.y
      );

      setNoteStatus(
        key,
        "writing…"
      );
    }


    function draw(
      event
    ) {
      if (
        !state.drawing
      ) {
        return;
      }

      event.preventDefault();

      const p =
        canvasPoint(event);

      const pressure =
        event.pressure > 0
          ? event.pressure
          : 0.55;

      ctx.lineCap =
        "round";

      ctx.lineJoin =
        "round";

      if (
        state.erasing
      ) {
        ctx.globalCompositeOperation =
          "destination-out";

        ctx.lineWidth =
          18 +
          pressure * 18;
      } else {
        ctx.globalCompositeOperation =
          "source-over";

        ctx.strokeStyle =
          state.colour;

        ctx.lineWidth =
          state.width *
          (
            0.7 +
            pressure *
            0.9
          );
      }

      ctx.lineTo(
        p.x,
        p.y
      );

      ctx.stroke();
    }


    function stopDrawing(
      event
    ) {
      if (
        !state.drawing
      ) {
        return;
      }

      state.drawing = false;

      ctx.closePath();

      canvas.releasePointerCapture?.(
        event.pointerId
      );

      persist();
    }


    canvas.addEventListener(
      "pointerdown",
      startDrawing
    );

    canvas.addEventListener(
      "pointermove",
      draw
    );

    canvas.addEventListener(
      "pointerup",
      stopDrawing
    );

    canvas.addEventListener(
      "pointercancel",
      stopDrawing
    );


    const stored =
      localStorage.getItem(
        `shm-note-drawing-${key}`
      );

    if (stored) {
      const image =
        new Image();

      image.onload =
        () => {
          ctx.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );
        };

      image.src =
        stored;
    }


    const textArea =
      document.querySelector(
        `[data-note-text="${key}"]`
      );

    const savedText =
      localStorage.getItem(
        `shm-note-text-${key}`
      );

    if (
      textArea &&
      savedText !== null
    ) {
      textArea.value =
        savedText;
    }


    let textTimer =
      null;

    textArea?.addEventListener(
      "input",
      () => {
        setNoteStatus(
          key,
          "typing…"
        );

        clearTimeout(
          textTimer
        );

        textTimer =
          setTimeout(
            () => {
              localStorage.setItem(
                `shm-note-text-${key}`,
                textArea.value
              );

              setNoteStatus(
                key,
                "saved"
              );
            },
            350
          );
      }
    );


    document
      .querySelector(
        `[data-note-pen="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          state.erasing =
            false;

          setNoteStatus(
            key,
            "pen"
          );
        }
      );


    document
      .querySelector(
        `[data-note-eraser="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          state.erasing =
            true;

          setNoteStatus(
            key,
            "eraser"
          );
        }
      );


    document
      .querySelector(
        `[data-note-colour="${key}"]`
      )
      ?.addEventListener(
        "input",
        event => {
          state.colour =
            event.target.value;

          state.erasing =
            false;
        }
      );


    document
      .querySelector(
        `[data-note-clear="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          saveHistory();

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          persist();
        }
      );


    document
      .querySelector(
        `[data-note-undo="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          const previous =
            state.history.pop();

          if (!previous) {
            return;
          }

          const image =
            new Image();

          image.onload =
            () => {
              ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
              );

              ctx.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
              );

              persist();
            };

          image.src =
            previous;
        }
      );


    document
      .querySelector(
        `[data-note-save="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          const link =
            document.createElement(
              "a"
            );

          link.download =
            `${key}-physics-notes.png`;

          link.href =
            canvas.toDataURL(
              "image/png"
            );

          link.click();
        }
      );
  }


  function setNoteStatus(
    key,
    text
  ) {
    const target =
      document.querySelector(
        `[data-note-status="${key}"]`
      );

    if (target) {
      target.textContent =
        text;
    }
  }


  $$(
    ".note-canvas"
  ).forEach(
    initialiseNoteCanvas
  );


  /* =========================================================
     HERO OSCILLATOR
  ========================================================= */

  function drawHero(
    time
  ) {
    const prepared =
      prepareCanvas(
        $("heroCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    drawGrid(
      ctx,
      w,
      h,
      30,
      9,
      5
    );

    const midY =
      h * 0.52;

    const amplitude =
      h * 0.27;

    const phase =
      time *
      0.0014;

    ctx.strokeStyle =
      "rgba(255,255,255,.20)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      28,
      midY
    );

    ctx.lineTo(
      w - 28,
      midY
    );

    ctx.stroke();


    ctx.strokeStyle =
      css(
        "--diamond",
        "#67e8f9"
      );

    ctx.lineWidth = 3;

    ctx.beginPath();

    for (
      let i = 0;
      i <= 400;
      i++
    ) {
      const theta =
        i /
        400 *
        Math.PI *
        4;

      const x =
        30 +
        (
          w - 60
        ) *
        i /
        400;

      const y =
        midY -
        amplitude *
        Math.cos(theta);

      if (i) {
        ctx.lineTo(
          x,
          y
        );
      } else {
        ctx.moveTo(
          x,
          y
        );
      }
    }

    ctx.stroke();


    const wrapped =
      (
        phase %
        (
          Math.PI *
          4
        )
      );

    const ballX =
      30 +
      (
        w - 60
      ) *
      wrapped /
      (
        Math.PI *
        4
      );

    const ballY =
      midY -
      amplitude *
      Math.cos(
        wrapped
      );

    ctx.fillStyle =
      css(
        "--cherry",
        "#e79ab4"
      );

    ctx.shadowColor =
      "rgba(231,154,180,.60)";

    ctx.shadowBlur = 18;

    ctx.beginPath();

    ctx.arc(
      ballX,
      ballY,
      8,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    canvasLabel(
      ctx,
      "x(t) = A cos(ωt + φ)",
      20,
      22
    );

    canvasLabel(
      ctx,
      "time →",
      w - 20,
      h - 12,
      "right"
    );
  }


  /* =========================================================
     MASS-SPRING MOTION LAB
  ========================================================= */

  const motionState = {
    playing: false,
    time: 0,
    lastTime:
      performance.now()
  };


  function motionParameters() {
    const A =
      Number(
        $("AInput")
          ?.value || 0.8
      );

    const m =
      Number(
        $("mInput")
          ?.value || 1
      );

    const k =
      Number(
        $("kInput")
          ?.value || 16
      );

    const phi =
      Number(
        $("phiInput")
          ?.value || 0
      );

    const t =
      Number(
        $("tInput")
          ?.value || 0
      );

    const omega =
      Math.sqrt(
        k / m
      );

    const period =
      2 *
      Math.PI /
      omega;

    const frequency =
      1 /
      period;

    return {
      A,
      m,
      k,
      phi,
      t,
      omega,
      period,
      frequency
    };
  }


  function updateMotionLab() {
    const p =
      motionParameters();

    motionState.time =
      p.t;

    const theta =
      p.omega *
      p.t +
      p.phi;

    const x =
      p.A *
      Math.cos(theta);

    const v =
      -p.omega *
      p.A *
      Math.sin(theta);

    const a =
      -(
        p.omega ** 2
      ) *
      x;


    if ($("AOut")) {
      $("AOut")
        .textContent =
        `${fmt(
          p.A,
          2
        )} m`;
    }

    if ($("mOut")) {
      $("mOut")
        .textContent =
        `${fmt(
          p.m,
          2
        )} kg`;
    }

    if ($("kOut")) {
      $("kOut")
        .textContent =
        `${fmt(
          p.k,
          0
        )} N/m`;
    }

    if ($("phiOut")) {
      $("phiOut")
        .textContent =
        `${fmt(
          p.phi,
          2
        )} rad`;
    }

    if ($("tOut")) {
      $("tOut")
        .textContent =
        `${fmt(
          p.t,
          2
        )} s`;
    }

    if ($("omegaMetric")) {
      $("omegaMetric")
        .textContent =
        `${fmt(
          p.omega,
          2
        )} rad/s`;
    }

    if ($("periodMetric")) {
      $("periodMetric")
        .textContent =
        `${fmt(
          p.period,
          2
        )} s`;
    }

    if ($("freqMetric")) {
      $("freqMetric")
        .textContent =
        `${fmt(
          p.frequency,
          2
        )} Hz`;
    }

    if ($("xMetric")) {
      $("xMetric")
        .textContent =
        `${fmt(
          x,
          2
        )} m`;
    }

    if ($("vMetric")) {
      $("vMetric")
        .textContent =
        `${fmt(
          v,
          2
        )} m/s`;
    }

    if ($("aMetric")) {
      $("aMetric")
        .textContent =
        `${fmt(
          a,
          2
        )} m/s²`;
    }


    drawSpringMass(
      p,
      x,
      v,
      a
    );

    drawMotionCurves(p);

    drawCircleModel(p);
  }


  function drawSpringMass(
    p,
    x,
    v,
    a
  ) {
    const prepared =
      prepareCanvas(
        $("springCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const wallX =
      w * 0.08;

    const equilibriumX =
      w * 0.59;

    const travel =
      w * 0.25;

    const blockX =
      equilibriumX +
      travel *
      x /
      p.A;

    const y =
      h * 0.54;


    ctx.fillStyle =
      "#463526";

    ctx.fillRect(
      wallX - 15,
      h * 0.20,
      15,
      h * 0.64
    );


    ctx.strokeStyle =
      "#8b5a2b";

    ctx.lineWidth = 2;

    for (
      let yy =
        h * 0.21;

      yy <
        h * 0.84;

      yy += 13
    ) {
      ctx.beginPath();

      ctx.moveTo(
        wallX - 15,
        yy
      );

      ctx.lineTo(
        wallX,
        yy - 9
      );

      ctx.stroke();
    }


    const springEnd =
      blockX - 32;

    ctx.strokeStyle =
      css(
        "--diamond",
        "#67e8f9"
      );

    ctx.lineWidth = 2.5;

    ctx.beginPath();

    ctx.moveTo(
      wallX,
      y
    );

    const turns = 14;

    for (
      let i = 1;
      i < turns * 2;
      i++
    ) {
      const sx =
        wallX +
        (
          springEnd -
          wallX
        ) *
        i /
        (
          turns *
          2
        );

      const sy =
        y +
        (
          i % 2
            ? -10
            : 10
        );

      ctx.lineTo(
        sx,
        sy
      );
    }

    ctx.lineTo(
      springEnd,
      y
    );

    ctx.stroke();


    ctx.strokeStyle =
      "rgba(255,255,255,.25)";

    ctx.setLineDash(
      [5, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      equilibriumX,
      h * 0.14
    );

    ctx.lineTo(
      equilibriumX,
      h * 0.88
    );

    ctx.stroke();

    ctx.setLineDash([]);


    ctx.fillStyle =
      css(
        "--cherry",
        "#e79ab4"
      );

    ctx.fillRect(
      blockX - 31,
      y - 31,
      62,
      62
    );

    ctx.strokeStyle =
      "#613747";

    ctx.lineWidth = 4;

    ctx.strokeRect(
      blockX - 31,
      y - 31,
      62,
      62
    );


    ctx.fillStyle =
      "#26131b";

    ctx.font =
      "bold 14px monospace";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "m",
      blockX,
      y + 5
    );


    const velocityScale =
      55 *
      Math.abs(v) /
      Math.max(
        p.omega *
        p.A,
        1e-8
      );

    if (
      Math.abs(v) >
      0.001
    ) {
      drawArrow(
        ctx,
        blockX,
        h * 0.28,
        blockX +
          Math.sign(v) *
          velocityScale,
        h * 0.28,
        css(
          "--emerald",
          "#54d179"
        )
      );
    }


    const accelScale =
      60 *
      Math.abs(a) /
      Math.max(
        p.omega **
          2 *
          p.A,
        1e-8
      );

    if (
      Math.abs(a) >
      0.001
    ) {
      drawArrow(
        ctx,
        blockX,
        h * 0.81,
        blockX +
          Math.sign(a) *
          accelScale,
        h * 0.81,
        css(
          "--gold",
          "#f1c75b"
        )
      );
    }


    canvasLabel(
      ctx,
      "equilibrium",
      equilibriumX,
      h * 0.11,
      "center"
    );

    canvasLabel(
      ctx,
      `x = ${fmt(
        x,
        3
      )} m`,
      16,
      22
    );

    canvasLabel(
      ctx,
      "green = velocity",
      16,
      42,
      "left",
      css(
        "--emerald",
        "#54d179"
      )
    );

    canvasLabel(
      ctx,
      "gold = acceleration",
      16,
      60,
      "left",
      css(
        "--gold",
        "#f1c75b"
      )
    );
  }


  function drawMotionCurves(
    p
  ) {
    const prepared =
      prepareCanvas(
        $("motionPlot")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const pad = 45;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      6
    );

    const middle =
      h / 2;

    const graphAmplitude =
      (
        h -
        2 * pad
      ) *
      0.37;

    const span =
      2 *
      p.period;


    ctx.strokeStyle =
      "rgba(255,255,255,.23)";

    ctx.beginPath();

    ctx.moveTo(
      pad,
      middle
    );

    ctx.lineTo(
      w - pad,
      middle
    );

    ctx.stroke();


    const curves = [
      {
        name: "x/A",
        colour:
          css(
            "--diamond",
            "#67e8f9"
          ),
        fn:
          time =>
            Math.cos(
              p.omega *
              time +
              p.phi
            )
      },

      {
        name: "v/vmax",
        colour:
          css(
            "--emerald",
            "#54d179"
          ),
        fn:
          time =>
            -Math.sin(
              p.omega *
              time +
              p.phi
            )
      },

      {
        name: "a/amax",
        colour:
          css(
            "--cherry",
            "#e79ab4"
          ),
        fn:
          time =>
            -Math.cos(
              p.omega *
              time +
              p.phi
            )
      }
    ];


    curves.forEach(
      curve => {
        ctx.strokeStyle =
          curve.colour;

        ctx.lineWidth = 2.2;

        ctx.beginPath();

        for (
          let i = 0;
          i <= 500;
          i++
        ) {
          const time =
            span *
            i /
            500;

          const px =
            pad +
            (
              w -
              2 * pad
            ) *
            i /
            500;

          const py =
            middle -
            graphAmplitude *
            curve.fn(time);

          if (i) {
            ctx.lineTo(
              px,
              py
            );
          } else {
            ctx.moveTo(
              px,
              py
            );
          }
        }

        ctx.stroke();
      }
    );


    const wrappedTime =
      (
        (
          p.t %
          span
        ) +
        span
      ) %
      span;

    const markerX =
      pad +
      (
        w -
        2 * pad
      ) *
      wrappedTime /
      span;

    ctx.strokeStyle =
      "rgba(255,255,255,.55)";

    ctx.setLineDash(
      [4, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      markerX,
      pad
    );

    ctx.lineTo(
      markerX,
      h - pad
    );

    ctx.stroke();

    ctx.setLineDash([]);


    let legendX =
      pad;

    curves.forEach(
      curve => {
        ctx.fillStyle =
          curve.colour;

        ctx.fillRect(
          legendX,
          18,
          14,
          3
        );

        canvasLabel(
          ctx,
          curve.name,
          legendX + 20,
          23
        );

        legendX += 105;
      }
    );


    canvasLabel(
      ctx,
      "0",
      pad,
      h - 12,
      "center"
    );

    canvasLabel(
      ctx,
      "T",
      (
        pad +
        w - pad
      ) /
      2,
      h - 12,
      "center"
    );

    canvasLabel(
      ctx,
      "2T",
      w - pad,
      h - 12,
      "center"
    );
  }


  function drawCircleModel(
    p
  ) {
    const prepared =
      prepareCanvas(
        $("circleCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const cx =
      w * 0.40;

    const cy =
      h * 0.52;

    const radius =
      Math.min(
        w,
        h
      ) *
      0.28;

    const theta =
      p.omega *
      p.t +
      p.phi;

    const pointX =
      cx +
      radius *
      Math.cos(theta);

    const pointY =
      cy -
      radius *
      Math.sin(theta);


    ctx.strokeStyle =
      "rgba(255,255,255,.22)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      cx -
        radius -
        20,
      cy
    );

    ctx.lineTo(
      cx +
        radius +
        30,
      cy
    );

    ctx.stroke();


    ctx.strokeStyle =
      css(
        "--cherry",
        "#e79ab4"
      );

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
      cx,
      cy
    );

    ctx.lineTo(
      pointX,
      pointY
    );

    ctx.stroke();


    ctx.strokeStyle =
      "rgba(103,232,249,.60)";

    ctx.beginPath();

    ctx.moveTo(
      pointX,
      pointY
    );

    ctx.lineTo(
      pointX,
      cy
    );

    ctx.stroke();


    ctx.fillStyle =
      css(
        "--cherry",
        "#e79ab4"
      );

    ctx.beginPath();

    ctx.arc(
      pointX,
      pointY,
      7,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      css(
        "--diamond",
        "#67e8f9"
      );

    ctx.beginPath();

    ctx.arc(
      pointX,
      cy,
      9,
      0,
      Math.PI * 2
    );

    ctx.fill();


    canvasLabel(
      ctx,
      "uniform circular motion",
      cx,
      23,
      "center"
    );

    canvasLabel(
      ctx,
      "SHM projection",
      pointX,
      h * 0.90,
      "center"
    );

    canvasLabel(
      ctx,
      "−A",
      cx - radius,
      cy + 23,
      "center"
    );

    canvasLabel(
      ctx,
      "+A",
      cx + radius,
      cy + 23,
      "center"
    );
  }


  [
    "AInput",
    "mInput",
    "kInput",
    "phiInput",
    "tInput"
  ].forEach(
    id => {
      $(id)
        ?.addEventListener(
          "input",
          updateMotionLab
        );
    }
  );


  $("playMotion")
    ?.addEventListener(
      "click",
      () => {
        motionState.playing =
          !motionState.playing;

        $("playMotion")
          .textContent =
          motionState.playing
            ? "Pause"
            : "Play";

        motionState.lastTime =
          performance.now();
      }
    );


  $("resetMotion")
    ?.addEventListener(
      "click",
      () => {
        motionState.time = 0;

        if ($("tInput")) {
          $("tInput")
            .value = "0";
        }

        updateMotionLab();
      }
    );


  /* =========================================================
     PHASE / INITIAL CONDITION SOLVER
  ========================================================= */

  function solvePhase() {
    const x0 =
      Number(
        $("x0Input")
          ?.value
      );

    const v0 =
      Number(
        $("v0Input")
          ?.value
      );

    const m =
      Number(
        $("phaseMInput")
          ?.value
      );

    const k =
      Number(
        $("phaseKInput")
          ?.value
      );

    const result =
      $("phaseResult");

    if (!result) {
      return;
    }

    if (
      !Number.isFinite(x0) ||
      !Number.isFinite(v0) ||
      !(m > 0) ||
      !(k > 0)
    ) {
      result.textContent =
        "Enter valid finite values with m > 0 and k > 0.";

      return;
    }

    const omega =
      Math.sqrt(
        k / m
      );

    const amplitude =
      Math.sqrt(
        x0 ** 2 +
        (
          v0 /
          omega
        ) ** 2
      );

    const phase =
      Math.atan2(
        -v0 /
          omega,
        x0
      );

    const period =
      2 *
      Math.PI /
      omega;

    result.innerHTML = `
      <strong>
        Step 1:
      </strong>

      ω = √(k/m)
      = ${fmt(omega, 4)}
      rad s⁻¹

      <br><br>

      <strong>
        Step 2:
      </strong>

      A =
      √[x₀² + (v₀/ω)²]
      =
      ${fmt(amplitude, 5)}
      m

      <br><br>

      <strong>
        Step 3:
      </strong>

      φ =
      atan2(−v₀/ω, x₀)
      =
      ${fmt(phase, 4)}
      rad

      <br><br>

      <strong>
        Final motion:
      </strong>

      x(t) =
      ${fmt(amplitude, 5)}
      cos(
      ${fmt(omega, 4)}t
      ${phase >= 0 ? "+" : "−"}
      ${fmt(Math.abs(phase), 4)}
      )

      <br><br>

      Period:
      ${fmt(period, 4)} s
    `;
  }


  $("solvePhase")
    ?.addEventListener(
      "click",
      solvePhase
    );


  solvePhase();


  /* =========================================================
     ENERGY LAB
  ========================================================= */

  function updateEnergyLab() {
    const ratio =
      Number(
        $("energyXInput")
          ?.value || 0
      );

    const potentialFraction =
      ratio ** 2;

    const kineticFraction =
      1 -
      potentialFraction;


    if ($("energyXOut")) {
      $("energyXOut")
        .textContent =
        fmt(
          ratio,
          2
        );
    }

    if ($("uBar")) {
      $("uBar")
        .style.width =
        `${
          potentialFraction *
          100
        }%`;
    }

    if ($("kBar")) {
      $("kBar")
        .style.width =
        `${
          kineticFraction *
          100
        }%`;
    }

    if ($("uPct")) {
      $("uPct")
        .textContent =
        `${Math.round(
          potentialFraction *
          100
        )}%`;
    }

    if ($("kPct")) {
      $("kPct")
        .textContent =
        `${Math.round(
          kineticFraction *
          100
        )}%`;
    }

    drawEnergyGraph(
      ratio
    );
  }


  function drawEnergyGraph(
    ratio
  ) {
    const prepared =
      prepareCanvas(
        $("energyCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const pad = 48;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      5
    );


    const xToPixel =
      x =>
        pad +
        (
          w -
          2 * pad
        ) *
        (
          x + 1
        ) /
        2;

    const yToPixel =
      energy =>
        h -
        pad -
        (
          h -
          2 * pad
        ) *
        energy;


    const curves = [
      {
        name:
          "U/E = (x/A)²",
        colour:
          css(
            "--cherry",
            "#e79ab4"
          ),
        fn:
          x =>
            x ** 2
      },

      {
        name:
          "K/E = 1−(x/A)²",
        colour:
          css(
            "--emerald",
            "#54d179"
          ),
        fn:
          x =>
            1 -
            x ** 2
      }
    ];


    curves.forEach(
      curve => {
        ctx.strokeStyle =
          curve.colour;

        ctx.lineWidth = 2.5;

        ctx.beginPath();

        for (
          let i = 0;
          i <= 400;
          i++
        ) {
          const x =
            -1 +
            2 *
            i /
            400;

          const px =
            xToPixel(x);

          const py =
            yToPixel(
              curve.fn(x)
            );

          if (i) {
            ctx.lineTo(
              px,
              py
            );
          } else {
            ctx.moveTo(
              px,
              py
            );
          }
        }

        ctx.stroke();
      }
    );


    ctx.strokeStyle =
      css(
        "--gold",
        "#f1c75b"
      );

    ctx.setLineDash(
      [6, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      pad,
      yToPixel(1)
    );

    ctx.lineTo(
      w - pad,
      yToPixel(1)
    );

    ctx.stroke();

    ctx.setLineDash([]);


    const potential =
      ratio ** 2;

    const kinetic =
      1 -
      potential;


    [
      {
        value:
          potential,
        colour:
          css(
            "--cherry",
            "#e79ab4"
          )
      },

      {
        value:
          kinetic,
        colour:
          css(
            "--emerald",
            "#54d179"
          )
      }
    ].forEach(
      point => {
        ctx.fillStyle =
          point.colour;

        ctx.beginPath();

        ctx.arc(
          xToPixel(
            ratio
          ),
          yToPixel(
            point.value
          ),
          7,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    );


    ctx.strokeStyle =
      "rgba(255,255,255,.35)";

    ctx.beginPath();

    ctx.moveTo(
      xToPixel(
        ratio
      ),
      pad
    );

    ctx.lineTo(
      xToPixel(
        ratio
      ),
      h - pad
    );

    ctx.stroke();


    canvasLabel(
      ctx,
      "−A",
      xToPixel(-1),
      h - 14,
      "center"
    );

    canvasLabel(
      ctx,
      "0",
      xToPixel(0),
      h - 14,
      "center"
    );

    canvasLabel(
      ctx,
      "+A",
      xToPixel(1),
      h - 14,
      "center"
    );

    canvasLabel(
      ctx,
      "total E",
      pad - 6,
      yToPixel(1) + 4,
      "right"
    );


    let legendX =
      pad;

    curves.forEach(
      curve => {
        ctx.fillStyle =
          curve.colour;

        ctx.fillRect(
          legendX,
          19,
          13,
          3
        );

        canvasLabel(
          ctx,
          curve.name,
          legendX + 19,
          24
        );

        legendX += 175;
      }
    );
  }


  $("energyXInput")
    ?.addEventListener(
      "input",
      updateEnergyLab
    );


  /* =========================================================
     PENDULUM LAB
  ========================================================= */

  function pendulumParameters() {
    const L =
      Number(
        $("pendLength")
          ?.value || 1
      );

    const angleDegrees =
      Number(
        $("pendAngle")
          ?.value || 10
      );

    const g =
      9.81;

    const omega =
      Math.sqrt(
        g / L
      );

    const period =
      2 *
      Math.PI /
      omega;

    return {
      L,
      angleDegrees,
      angleRadians:
        angleDegrees *
        Math.PI /
        180,
      omega,
      period
    };
  }


  function updatePendulumLab(
    time = 0
  ) {
    const p =
      pendulumParameters();


    if (
      $("pendLengthOut")
    ) {
      $("pendLengthOut")
        .textContent =
        `${fmt(
          p.L,
          2
        )} m`;
    }

    if (
      $("pendAngleOut")
    ) {
      $("pendAngleOut")
        .textContent =
        `${fmt(
          p.angleDegrees,
          0
        )}°`;
    }

    if (
      $("pendPeriod")
    ) {
      $("pendPeriod")
        .textContent =
        `${fmt(
          p.period,
          2
        )} s`;
    }

    if (
      $("pendOmega")
    ) {
      $("pendOmega")
        .textContent =
        `${fmt(
          p.omega,
          2
        )} rad/s`;
    }


    drawPendulum(
      p,
      time
    );
  }


  function drawPendulum(
    p,
    time
  ) {
    const prepared =
      prepareCanvas(
        $("pendulumCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const theta =
      p.angleRadians *
      Math.cos(
        p.omega *
        time
      );

    const pivotX =
      w / 2;

    const pivotY =
      h * 0.13;

    const length =
      Math.min(
        h * 0.63,
        w * 0.34
      );

    const bobX =
      pivotX +
      length *
      Math.sin(theta);

    const bobY =
      pivotY +
      length *
      Math.cos(theta);


    ctx.fillStyle =
      "#4b3926";

    ctx.fillRect(
      pivotX - 85,
      pivotY - 12,
      170,
      12
    );


    ctx.strokeStyle =
      "rgba(255,255,255,.26)";

    ctx.setLineDash(
      [5, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      pivotX,
      pivotY
    );

    ctx.lineTo(
      pivotX,
      pivotY +
        length +
        30
    );

    ctx.stroke();

    ctx.setLineDash([]);


    ctx.strokeStyle =
      css(
        "--diamond",
        "#67e8f9"
      );

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
      pivotX,
      pivotY
    );

    ctx.lineTo(
      bobX,
      bobY
    );

    ctx.stroke();


    ctx.fillStyle =
      css(
        "--cherry",
        "#e79ab4"
      );

    ctx.strokeStyle =
      "#693d50";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(
      bobX,
      bobY,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    canvasLabel(
      ctx,
      `θ ≈ ${fmt(
        theta *
        180 /
        Math.PI,
        1
      )}°`,
      16,
      22
    );

    canvasLabel(
      ctx,
      `T = ${fmt(
        p.period,
        3
      )} s`,
      16,
      42
    );


    if (
      p.angleDegrees >
      10
    ) {
      canvasLabel(
        ctx,
        "large-angle warning: sinθ ≈ θ becomes progressively less accurate",
        w / 2,
        h - 16,
        "center",
        css(
          "--gold",
          "#f1c75b"
        )
      );
    }
  }


  $("pendLength")
    ?.addEventListener(
      "input",
      () =>
        updatePendulumLab(
          performance.now() /
          1000
        )
    );


  $("pendAngle")
    ?.addEventListener(
      "input",
      () =>
        updatePendulumLab(
          performance.now() /
          1000
        )
    );


  /* =========================================================
     DAMPING LAB
  ========================================================= */

  function dampingParameters() {
    /*
      Fixed demonstration values:
      m = 1 kg
      k = 16 N/m

      Thus ω0 = 4 rad/s
      and bcritical = 8 kg/s.
    */

    const m = 1;

    const k = 16;

    const b =
      Number(
        $("dampingInput")
          ?.value || 0.4
      );

    const omega0 =
      Math.sqrt(
        k / m
      );

    const critical =
      2 *
      Math.sqrt(
        m * k
      );

    const discriminant =
      k / m -
      (
        b **
        2
      ) /
      (
        4 *
        m **
        2
      );

    let regime =
      "critical";

    if (
      b <
      critical -
      1e-6
    ) {
      regime =
        "underdamped";
    }

    if (
      b >
      critical +
      1e-6
    ) {
      regime =
        "overdamped";
    }

    const omegaD =
      discriminant > 0
        ? Math.sqrt(
            discriminant
          )
        : 0;

    const ampHalf =
      b > 0
        ?
        2 *
        m *
        Math.log(2) /
        b
        :
        Infinity;

    return {
      m,
      k,
      b,
      omega0,
      critical,
      regime,
      omegaD,
      ampHalf
    };
  }


  function updateDampingLab() {
    const p =
      dampingParameters();


    if ($("dampingOut")) {
      $("dampingOut")
        .textContent =
        `${fmt(
          p.b,
          2
        )} kg/s`;
    }


    if ($("dampedOmega")) {
      if (
        p.regime ===
        "underdamped"
      ) {
        $("dampedOmega")
          .textContent =
          `${fmt(
            p.omegaD,
            2
          )} rad/s`;
      } else {
        $("dampedOmega")
          .textContent =
          p.regime;
      }
    }


    if ($("ampHalfLife")) {
      $("ampHalfLife")
        .textContent =
        Number.isFinite(
          p.ampHalf
        )
          ?
          `${fmt(
            p.ampHalf,
            2
          )} s`
          :
          "∞";
    }


    drawDampingGraph(p);
  }


  function dampedDisplacement(
    p,
    t
  ) {
    const {
      m,
      k,
      b,
      critical,
      regime
    } = p;


    if (
      regime ===
      "underdamped"
    ) {
      return (
        Math.exp(
          -b *
          t /
          (
            2 *
            m
          )
        ) *
        Math.cos(
          p.omegaD *
          t
        )
      );
    }


    if (
      Math.abs(
        b -
        critical
      ) < 1e-6
    ) {
      const gamma =
        b /
        (
          2 *
          m
        );

      return (
        1 +
        gamma *
        t
      ) *
      Math.exp(
        -gamma *
        t
      );
    }


    const discriminant =
      Math.sqrt(
        b ** 2 -
        4 *
        m *
        k
      );

    const r1 =
      (
        -b +
        discriminant
      ) /
      (
        2 *
        m
      );

    const r2 =
      (
        -b -
        discriminant
      ) /
      (
        2 *
        m
      );


    /*
      Choose constants so that
      x(0)=1 and v(0)=0.
    */

    const c1 =
      -r2 /
      (
        r1 -
        r2
      );

    const c2 =
      r1 /
      (
        r1 -
        r2
      );

    return (
      c1 *
      Math.exp(
        r1 *
        t
      ) +
      c2 *
      Math.exp(
        r2 *
        t
      )
    );
  }


  function drawDampingGraph(
    p
  ) {
    const prepared =
      prepareCanvas(
        $("dampingCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const pad = 45;

    const timeMax =
      8;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      6
    );

    const xPixel =
      time =>
        pad +
        (
          w -
          2 * pad
        ) *
        time /
        timeMax;

    const yPixel =
      value =>
        h / 2 -
        (
          h -
          2 * pad
        ) *
        0.38 *
        value;


    ctx.strokeStyle =
      "rgba(255,255,255,.24)";

    ctx.beginPath();

    ctx.moveTo(
      pad,
      h / 2
    );

    ctx.lineTo(
      w - pad,
      h / 2
    );

    ctx.stroke();


    ctx.strokeStyle =
      css(
        "--diamond",
        "#67e8f9"
      );

    ctx.lineWidth = 2.5;

    ctx.beginPath();

    for (
      let i = 0;
      i <= 600;
      i++
    ) {
      const t =
        timeMax *
        i /
        600;

      const x =
        dampedDisplacement(
          p,
          t
        );

      const px =
        xPixel(t);

      const py =
        yPixel(x);

      if (i) {
        ctx.lineTo(
          px,
          py
        );
      } else {
        ctx.moveTo(
          px,
          py
        );
      }
    }

    ctx.stroke();


    if (
      p.regime ===
      "underdamped"
    ) {
      [
        1,
        -1
      ].forEach(
        sign => {
          ctx.strokeStyle =
            "rgba(231,154,180,.55)";

          ctx.setLineDash(
            [6, 5]
          );

          ctx.beginPath();

          for (
            let i = 0;
            i <= 300;
            i++
          ) {
            const t =
              timeMax *
              i /
              300;

            const envelope =
              sign *
              Math.exp(
                -p.b *
                t /
                (
                  2 *
                  p.m
                )
              );

            const px =
              xPixel(t);

            const py =
              yPixel(
                envelope
              );

            if (i) {
              ctx.lineTo(
                px,
                py
              );
            } else {
              ctx.moveTo(
                px,
                py
              );
            }
          }

          ctx.stroke();

          ctx.setLineDash([]);
        }
      );
    }


    canvasLabel(
      ctx,
      `regime: ${p.regime}`,
      pad,
      20
    );

    canvasLabel(
      ctx,
      `bcritical = ${fmt(
        p.critical,
        2
      )} kg/s`,
      pad + 170,
      20
    );

    canvasLabel(
      ctx,
      "time →",
      w - pad,
      h - 13,
      "right"
    );
  }


  $("dampingInput")
    ?.addEventListener(
      "input",
      updateDampingLab
    );


  /* =========================================================
     RESONANCE LAB
  ========================================================= */

  function responseMagnitude(
    omega,
    m,
    k,
    b,
    force = 1
  ) {
    return (
      force /
      Math.sqrt(
        (
          k -
          m *
          omega **
          2
        ) **
          2 +
        (
          b *
          omega
        ) **
          2
      )
    );
  }


  function resonanceParameters() {
    const m = 1;

    const k = 16;

    const dampingControl =
      Number(
        $("resDamping")
          ?.value || 0.3
      );

    const b =
      dampingControl;

    const omegaDrive =
      Number(
        $("driveFreq")
          ?.value || 4
      );

    const omega0 =
      Math.sqrt(
        k / m
      );

    return {
      m,
      k,
      b,
      omegaDrive,
      omega0
    };
  }


  function updateResonanceLab() {
    const p =
      resonanceParameters();

    const amplitude =
      responseMagnitude(
        p.omegaDrive,
        p.m,
        p.k,
        p.b
      );

    if (
      $("resDampingOut")
    ) {
      $("resDampingOut")
        .textContent =
        fmt(
          p.b,
          2
        );
    }

    if (
      $("driveFreqOut")
    ) {
      $("driveFreqOut")
        .textContent =
        `${fmt(
          p.omegaDrive,
          2
        )} rad/s`;
    }

    if (
      $("resonanceReadout")
    ) {
      const ratio =
        p.omegaDrive /
        p.omega0;

      $("resonanceReadout")
        .innerHTML = `
          Natural frequency:
          <strong>
            ω₀ =
            ${fmt(
              p.omega0,
              2
            )}
            rad/s
          </strong>

          <br>

          Driving ratio:
          <strong>
            ω/ω₀ =
            ${fmt(
              ratio,
              2
            )}
          </strong>

          <br>

          Response amplitude
          for F₀=1 N:
          <strong>
            X =
            ${fmt(
              amplitude,
              4
            )}
            m
          </strong>
        `;
    }

    drawResonanceGraph(p);
  }


  function drawResonanceGraph(
    p
  ) {
    const prepared =
      prepareCanvas(
        $("resonanceCanvas")
      );

    if (!prepared) {
      return;
    }

    const {
      ctx,
      w,
      h
    } = prepared;

    const pad = 46;

    const omegaMax =
      8;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      5
    );


    let maximum =
      0;

    for (
      let i = 0;
      i <= 600;
      i++
    ) {
      const omega =
        omegaMax *
        i /
        600;

      maximum =
        Math.max(
          maximum,
          responseMagnitude(
            omega,
            p.m,
            p.k,
            p.b
          )
        );
    }


    maximum =
      Math.min(
        Math.max(
          maximum,
          0.1
        ),
        5
      );


    const xPixel =
      omega =>
        pad +
        (
          w -
          2 * pad
        ) *
        omega /
        omegaMax;

    const yPixel =
      amplitude =>
        h -
        pad -
        (
          h -
          2 * pad
        ) *
        amplitude /
        maximum;


    ctx.strokeStyle =
      css(
        "--diamond",
        "#67e8f9"
      );

    ctx.lineWidth = 2.5;

    ctx.beginPath();

    for (
      let i = 0;
      i <= 600;
      i++
    ) {
      const omega =
        omegaMax *
        i /
        600;

      const amplitude =
        Math.min(
          responseMagnitude(
            omega,
            p.m,
            p.k,
            p.b
          ),
          maximum
        );

      const px =
        xPixel(
          omega
        );

      const py =
        yPixel(
          amplitude
        );

      if (i) {
        ctx.lineTo(
          px,
          py
        );
      } else {
        ctx.moveTo(
          px,
          py
        );
      }
    }

    ctx.stroke();


    ctx.strokeStyle =
      css(
        "--gold",
        "#f1c75b"
      );

    ctx.setLineDash(
      [5, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      xPixel(
        p.omega0
      ),
      pad
    );

    ctx.lineTo(
      xPixel(
        p.omega0
      ),
      h - pad
    );

    ctx.stroke();

    ctx.setLineDash([]);


    const selectedAmplitude =
      Math.min(
        responseMagnitude(
          p.omegaDrive,
          p.m,
          p.k,
          p.b
        ),
        maximum
      );

    ctx.fillStyle =
      css(
        "--cherry",
        "#e79ab4"
      );

    ctx.beginPath();

    ctx.arc(
      xPixel(
        p.omegaDrive
      ),
      yPixel(
        selectedAmplitude
      ),
      7,
      0,
      Math.PI *
        2
    );

    ctx.fill();


    canvasLabel(
      ctx,
      "response amplitude X",
      pad,
      20
    );

    canvasLabel(
      ctx,
      "ω₀",
      xPixel(
        p.omega0
      ),
      h - 13,
      "center"
    );

    canvasLabel(
      ctx,
      "driving angular frequency →",
      w - pad,
      h - 13,
      "right"
    );
  }


  $("resDamping")
    ?.addEventListener(
      "input",
      updateResonanceLab
    );


  $("driveFreq")
    ?.addEventListener(
      "input",
      updateResonanceLab
    );


  /* =========================================================
     PRACTICE PAPERS
  ========================================================= */

  let currentPaper =
    "physics";

  let paperTimerSeconds =
    60 * 60;

  let paperTimerRunning =
    false;

  let paperTimerInterval =
    null;


  function physicsPaper() {
    const m1 =
      choose(
        [
          0.4,
          0.5,
          0.8,
          1.2
        ]
      );

    const k1 =
      choose(
        [
          32,
          50,
          72,
          98
        ]
      );

    const A1 =
      choose(
        [
          0.08,
          0.10,
          0.12,
          0.15
        ]
      );

    const omega1 =
      Math.sqrt(
        k1 / m1
      );

    const T1 =
      2 *
      Math.PI /
      omega1;

    const vmax =
      omega1 *
      A1;


    const L =
      choose(
        [
          0.6,
          0.8,
          1.0,
          1.2
        ]
      );

    const pendT =
      2 *
      Math.PI *
      Math.sqrt(
        L /
        9.81
      );


    return [
      {
        marks: 6,
        question:
          `A block of mass ${m1} kg is attached to an ideal horizontal spring of spring constant ${k1} N m⁻¹. Derive the equation of motion and determine its angular frequency and period.`,

        scheme: `
          <strong>Method:</strong>
          use F = −kx and F = mx¨.

          <br><br>

          mx¨ = −kx

          <br>

          x¨ + (k/m)x = 0.

          <br><br>

          Compare with x¨ + ω²x = 0:

          <br>

          ω = √(k/m)
          = ${fmt(omega1, 3)} rad s⁻¹.

          <br>

          T = 2π/ω
          = ${fmt(T1, 3)} s.

          <br><br>

          <strong>Physics:</strong>
          the minus sign represents the restoring direction.
        `
      },


      {
        marks: 5,
        question:
          `The oscillator above has amplitude ${A1} m. Find its maximum speed and state where in the motion that speed occurs.`,

        scheme: `
          v = −ωA sin(ωt+φ).

          Therefore the largest possible magnitude is

          <br><br>

          vmax = ωA
          = ${fmt(vmax, 3)} m s⁻¹.

          <br><br>

          This occurs at equilibrium, x = 0.
        `
      },


      {
        marks: 6,
        question:
          `Show, without using time explicitly, that the speed of an SHM oscillator satisfies v² = ω²(A²−x²). Explain what the equation predicts at x = 0 and x = ±A.`,

        scheme: `
          Start from

          x/A = cosθ

          and

          v/(ωA) = −sinθ.

          <br><br>

          Square and add:

          x²/A² +
          v²/(ω²A²)
          = 1.

          <br><br>

          Therefore

          v² = ω²(A²−x²).

          <br><br>

          At x = 0:
          |v| = ωA, maximum.

          <br>

          At x = ±A:
          v = 0.
        `
      },


      {
        marks: 7,
        question:
          `For a spring oscillator, derive K = ½k(A²−x²) from conservation of energy. Use the result to explain why the acceleration can be maximum while the speed is zero.`,

        scheme: `
          Total energy:

          E = ½kA².

          <br>

          Potential energy:

          U = ½kx².

          <br>

          K = E − U

          <br>

          = ½k(A²−x²).

          <br><br>

          At x = ±A,
          K = 0 and therefore v = 0.

          But |a| = ω²|x| is then maximum.

          <br><br>

          Zero speed does not mean zero acceleration.
        `
      },


      {
        marks: 6,
        question:
          `A simple pendulum has length ${L} m. Derive the small-angle SHM equation and calculate its approximate period near Earth's surface.`,

        scheme: `
          Tangential equation:

          mLθ¨ = −mg sinθ.

          <br><br>

          For small θ in radians:

          sinθ ≈ θ.

          <br><br>

          Therefore

          θ¨ + (g/L)θ = 0.

          <br><br>

          ω = √(g/L),

          T = 2π√(L/g)

          = ${fmt(pendT, 3)} s.
        `
      },


      {
        marks: 6,
        question:
          `Explain why a pendulum with a large angular amplitude is not an exact simple harmonic oscillator. Your answer should refer to the form of the restoring term.`,

        scheme: `
          Exact pendulum motion obeys a restoring term proportional to sinθ, not θ.

          <br><br>

          SHM requires restoring acceleration proportional directly to displacement.

          <br><br>

          Only when |θ| is sufficiently small can sinθ ≈ θ be used, converting the nonlinear equation into a linear SHM equation.
        `
      },


      {
        marks: 7,
        question:
          `For the damped oscillator mx¨ + bx˙ + kx = 0, explain physically the meaning of each term and distinguish underdamped, critically damped and overdamped motion.`,

        scheme: `
          mx¨:
          inertial response.

          <br>

          bx˙:
          dissipative drag proportional to velocity.

          <br>

          kx:
          restoring force.

          <br><br>

          Underdamped:
          b < 2√mk;
          oscillatory decay.

          <br>

          Critical:
          b = 2√mk;
          fastest non-oscillatory return.

          <br>

          Overdamped:
          b > 2√mk;
          slower non-oscillatory return.
        `
      },


      {
        marks: 7,
        question:
          `A periodically driven oscillator exhibits resonance. Explain resonance in terms of energy transfer and describe qualitatively how increased damping changes the response curve.`,

        scheme: `
          A periodic driver performs work on the oscillator.

          <br><br>

          Near the natural frequency the force remains favourably phased with the motion, so energy added over successive cycles can accumulate efficiently.

          <br><br>

          Increased damping removes more energy per cycle.

          Therefore the resonance peak becomes lower and broader.

          <br><br>

          The steady-state motion occurs at the driving frequency.
        `
      }
    ];
  }


  function mathsPaper() {
    const omega =
      choose(
        [
          2,
          3,
          4,
          5
        ]
      );

    const A =
      choose(
        [
          2,
          3,
          4
        ]
      );

    const m =
      choose(
        [
          1,
          2,
          3
        ]
      );

    const k =
      m *
      omega **
      2;


    return [
      {
        marks: 6,
        question:
          `Verify directly that x(t) = ${A} cos(${omega}t) satisfies x¨ + ${omega ** 2}x = 0.`,

        scheme: `
          Differentiate:

          <br>

          x˙ =
          −${A * omega}
          sin(${omega}t).

          <br><br>

          Differentiate again:

          <br>

          x¨ =
          −${A * omega ** 2}
          cos(${omega}t).

          <br><br>

          Since

          ${omega ** 2}x =
          ${A * omega ** 2}
          cos(${omega}t),

          <br><br>

          x¨ + ${omega ** 2}x = 0.
        `
      },


      {
        marks: 7,
        question:
          `Solve x¨ + ${omega ** 2}x = 0 using a trial solution x = e^{rt}.`,

        scheme: `
          Assume x=e^{rt}.

          <br>

          Then x¨=r²e^{rt}.

          <br><br>

          r²e^{rt}
          + ${omega ** 2}e^{rt}
          = 0.

          <br><br>

          Since e^{rt} ≠ 0:

          <br>

          r² + ${omega ** 2} = 0.

          <br>

          r = ±${omega}i.

          <br><br>

          Hence the real general solution is

          <br>

          x = C cos(${omega}t)
          + D sin(${omega}t).
        `
      },


      {
        marks: 7,
        question:
          `Show how x = C cos(ωt) + D sin(ωt) can be rewritten as x = A cos(ωt + φ). Give A in terms of C and D.`,

        scheme: `
          Expand:

          <br><br>

          A cos(ωt+φ)
          =
          A cosφ cosωt
          −
          A sinφ sinωt.

          <br><br>

          Compare coefficients:

          <br>

          C = A cosφ,

          D = −A sinφ.

          <br><br>

          Therefore

          A² = C² + D²,

          so

          <br>

          A = √(C²+D²).

          <br><br>

          A consistent phase is

          φ = atan2(−D,C).
        `
      },


      {
        marks: 6,
        question:
          `Starting from sin²θ + cos²θ = 1, derive v² = ω²(A²−x²) for x=A cosθ and v=−ωA sinθ.`,

        scheme: `
          cosθ = x/A.

          <br>

          sinθ = −v/(ωA).

          <br><br>

          Square and substitute:

          <br>

          x²/A² +
          v²/(ω²A²)
          = 1.

          <br><br>

          Multiply by ω²A²:

          <br>

          ω²x² + v²
          = ω²A².

          <br><br>

          Therefore

          v² = ω²(A²−x²).
        `
      },


      {
        marks: 7,
        question:
          `For a spring with mass m=${m} kg and k=${k} N m⁻¹, find the natural angular frequency. Then use dimensional analysis to verify that √(k/m) has dimensions of inverse time.`,

        scheme: `
          ω = √(k/m)

          = √(${k}/${m})

          = ${omega} rad s⁻¹.

          <br><br>

          Dimensions:

          <br>

          [k]
          =
          force / length

          =
          (M L T⁻²)/L

          =
          M T⁻².

          <br><br>

          [k/m]
          =
          T⁻².

          <br><br>

          Therefore

          [√(k/m)]
          =
          T⁻¹,

          as required for angular frequency.
        `
      },


      {
        marks: 7,
        question:
          `Use the Taylor expansion of sinθ to explain mathematically why the small-angle approximation becomes less accurate as |θ| increases.`,

        scheme: `
          Taylor expansion in radians:

          <br>

          sinθ
          =
          θ
          − θ³/6
          + θ⁵/120
          − ...

          <br><br>

          The approximation sinθ≈θ discards terms beginning with −θ³/6.

          <br><br>

          For very small |θ|,
          θ³ is much smaller than θ.

          <br><br>

          As |θ| grows,
          the cubic and higher-order terms become significant, so the restoring force is no longer proportional to θ.
        `
      },


      {
        marks: 7,
        question:
          `Starting from E = ½mv² + ½kx², differentiate E with respect to time and prove that dE/dt = 0 for ideal SHM.`,

        scheme: `
          Differentiate:

          <br>

          dE/dt
          =
          mv(dv/dt)
          +
          kx(dx/dt).

          <br><br>

          Since dv/dt=a and dx/dt=v:

          <br>

          dE/dt
          =
          mav + kxv

          =
          v(ma+kx).

          <br><br>

          SHM obeys ma=−kx.

          <br><br>

          Therefore

          dE/dt=0.
        `
      },


      {
        marks: 8,
        question:
          `For mx¨+bx˙+kx=0, substitute x=e^{rt} and obtain the characteristic equation. Explain how its discriminant separates the three damping regimes.`,

        scheme: `
          Substitute x=e^{rt}:

          <br>

          mr²e^{rt}
          +
          bre^{rt}
          +
          ke^{rt}
          =0.

          <br><br>

          Therefore

          mr² + br + k = 0.

          <br><br>

          Roots:

          r =
          [−b ± √(b²−4mk)]/(2m).

          <br><br>

          If b²−4mk < 0:
          complex roots,
          underdamped oscillation.

          <br><br>

          If b²−4mk = 0:
          repeated real root,
          critical damping.

          <br><br>

          If b²−4mk > 0:
          two real negative roots,
          overdamped decay.
        `
      }
    ];
  }


  function renderPaper() {
    const container =
      $("paperContainer");

    if (!container) {
      return;
    }

    const questions =
      currentPaper ===
      "physics"
        ? physicsPaper()
        : mathsPaper();


    const totalMarks =
      questions.reduce(
        (
          total,
          q
        ) =>
          total +
          q.marks,
        0
      );


    if ($("paperTitle")) {
      $("paperTitle")
        .textContent =
        currentPaper ===
        "physics"
          ?
          "Physics Paper — Oscillations"
          :
          "Mathematical Methods Paper — Oscillations";
    }


    if ($("paperInfo")) {
      $("paperInfo")
        .textContent =
        `60 min · ${totalMarks} marks · original generated questions`;
    }


    container.innerHTML =
      questions
        .map(
          (
            item,
            index
          ) => `
          <article class="paper-question mc-panel">

            <div class="paper-qhead">

              <strong>
                Question ${index + 1}
              </strong>

              <span>
                [${item.marks} marks]
              </span>

            </div>

            <p>
              ${item.question}
            </p>

            <div class="paper-answer-area"></div>

            <button
              class="mc-button mark-toggle"
              data-mark="${index}"
            >
              Reveal mark scheme
            </button>

            <div
              class="mark-scheme"
              data-mark-scheme="${index}"
            >
              ${item.scheme}
            </div>

          </article>
        `
        )
        .join("");


    $$(".mark-toggle")
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const index =
                button.dataset.mark;

              const scheme =
                document.querySelector(
                  `[data-mark-scheme="${index}"]`
                );

              scheme
                ?.classList
                .toggle(
                  "show"
                );

              button.textContent =
                scheme
                  ?.classList
                  .contains(
                    "show"
                  )
                  ?
                  "Hide mark scheme"
                  :
                  "Reveal mark scheme";
            }
          );
        }
      );
  }


  $$(".paper-tab")
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            currentPaper =
              button.dataset.paper;

            $$(".paper-tab")
              .forEach(
                tab =>
                  tab.classList.remove(
                    "active"
                  )
              );

            button.classList.add(
              "active"
            );

            resetPaperTimer();

            renderPaper();
          }
        );
      }
    );


  $("newPaper")
    ?.addEventListener(
      "click",
      renderPaper
    );


  $("printPaper")
    ?.addEventListener(
      "click",
      () =>
        window.print()
    );


  function renderPaperTimer() {
    const minutes =
      Math.floor(
        paperTimerSeconds /
        60
      );

    const seconds =
      paperTimerSeconds %
      60;

    if ($("paperTimer")) {
      $("paperTimer")
        .textContent =
        `${String(minutes)
          .padStart(
            2,
            "0"
          )}:${String(seconds)
          .padStart(
            2,
            "0"
          )}`;
    }
  }


  function resetPaperTimer() {
    paperTimerRunning =
      false;

    clearInterval(
      paperTimerInterval
    );

    paperTimerInterval =
      null;

    paperTimerSeconds =
      60 * 60;

    if ($("startTimer")) {
      $("startTimer")
        .textContent =
        "Start timer";
    }

    renderPaperTimer();
  }


  $("startTimer")
    ?.addEventListener(
      "click",
      () => {
        if (
          paperTimerRunning
        ) {
          paperTimerRunning =
            false;

          clearInterval(
            paperTimerInterval
          );

          paperTimerInterval =
            null;

          $("startTimer")
            .textContent =
            "Resume timer";

          return;
        }


        paperTimerRunning =
          true;

        $("startTimer")
          .textContent =
          "Pause timer";

        paperTimerInterval =
          setInterval(
            () => {
              if (
                !paperTimerRunning
              ) {
                return;
              }

              paperTimerSeconds =
                Math.max(
                  0,
                  paperTimerSeconds -
                  1
                );

              renderPaperTimer();

              if (
                paperTimerSeconds ===
                0
              ) {
                clearInterval(
                  paperTimerInterval
                );

                paperTimerRunning =
                  false;

                $("startTimer")
                  .textContent =
                  "Time finished";
              }
            },
            1000
          );
      }
    );


  resetPaperTimer();

  renderPaper();


  /* =========================================================
     QUICK PRACTICE GENERATOR
  ========================================================= */

  function numericQuestion({
    topic,
    question,
    answer,
    tolerance,
    unit = "",
    hint,
    solution
  }) {
    return {
      type: "numeric",
      topic,
      question,
      answer,
      tolerance,
      unit,
      hint,
      solution
    };
  }


  function multipleChoice({
    topic,
    question,
    options,
    answer,
    hint,
    solution
  }) {
    return {
      type: "mcq",
      topic,
      question,
      options,
      answer,
      hint,
      solution
    };
  }


  const quickGenerators = {

    basics: [

      () => {
        const coefficient =
          choose(
            [
              4,
              9,
              16,
              25,
              36
            ]
          );

        return multipleChoice({
          topic:
            "Foundations",

          question:
            `Which acceleration law represents SHM with ω² = ${coefficient} s⁻²?`,

          options: [
            `a = +${coefficient}x`,
            `a = −${coefficient}x`,
            `a = −${coefficient}x²`,
            `a = ${coefficient}/x`
          ],

          answer: 1,

          hint:
            "SHM requires acceleration proportional to displacement and opposite in direction.",

          solution:
            `The defining relation is a = −ω²x, so a = −${coefficient}x.`
        });
      },


      () => {
        const T =
          choose(
            [
              0.5,
              0.8,
              1.0,
              1.25,
              2.0,
              2.5
            ]
          );

        return numericQuestion({
          topic:
            "Frequency",

          question:
            `An oscillator has period T = ${T} s. Find its frequency.`,

          answer:
            1 / T,

          tolerance:
            0.01,

          unit:
            "Hz",

          hint:
            "Frequency counts cycles per second.",

          solution:
            `f = 1/T = 1/${T} = ${fmt(1/T, 3)} Hz.`
        });
      },


      () => {
        const f =
          choose(
            [
              0.5,
              1,
              1.5,
              2,
              3,
              4
            ]
          );

        const omega =
          2 *
          Math.PI *
          f;

        return numericQuestion({
          topic:
            "Angular frequency",

          question:
            `An oscillator has f = ${f} Hz. Find ω.`,

          answer:
            omega,

          tolerance:
            0.03,

          unit:
            "rad/s",

          hint:
            "One cycle corresponds to 2π radians.",

          solution:
            `ω = 2πf = 2π(${f}) = ${fmt(omega, 3)} rad/s.`
        });
      }

    ],


    kinematics: [

      () => {
        const A =
          choose(
            [
              0.05,
              0.08,
              0.10,
              0.12,
              0.15
            ]
          );

        const omega =
          choose(
            [
              2,
              3,
              4,
              5,
              6
            ]
          );

        return numericQuestion({
          topic:
            "Kinematics",

          question:
            `For x = ${A} cos(${omega}t + 0.30) m, determine the maximum speed.`,

          answer:
            omega *
            A,

          tolerance:
            0.01,

          unit:
            "m/s",

          hint:
            "Differentiate x and use |sin| ≤ 1.",

          solution:
            `v = −ωA sin(...), so vmax = ωA = ${omega}×${A} = ${fmt(omega*A, 3)} m/s.`
        });
      },


      () => {
        const omega =
          choose(
            [
              2,
              3,
              4,
              5
            ]
          );

        const x =
          choose(
            [
              -0.12,
              -0.08,
              0.05,
              0.10,
              0.15
            ]
          );

        const a =
          -(
            omega **
            2
          ) *
          x;

        return numericQuestion({
          topic:
            "Acceleration",

          question:
            `At one instant x = ${x} m and ω = ${omega} rad/s. Find a.`,

          answer:
            a,

          tolerance:
            0.02,

          unit:
            "m/s²",

          hint:
            "Use the defining SHM relation.",

          solution:
            `a = −ω²x = −(${omega})²(${x}) = ${fmt(a, 3)} m/s².`
        });
      },


      () =>
        multipleChoice({
          topic:
            "Phase",

          question:
            "At x = +A, which statement is correct?",

          options: [
            "v is maximum and a = 0",
            "v = 0 and acceleration points toward negative x",
            "v = 0 and acceleration points toward positive x",
            "both v and a are zero"
          ],

          answer: 1,

          hint:
            "A turning point has zero instantaneous speed but the largest restoring force.",

          solution:
            "At x = +A, v = 0 and a = −ω²A, so acceleration points back toward equilibrium."
        })

    ],


    springs: [

      () => {
        const m =
          choose(
            [
              0.25,
              0.4,
              0.5,
              0.8,
              1
            ]
          );

        const k =
          choose(
            [
              20,
              32,
              50,
              72,
              100
            ]
          );

        const omega =
          Math.sqrt(
            k / m
          );

        return numericQuestion({
          topic:
            "Mass–spring",

          question:
            `A ${m} kg mass is attached to a spring with k = ${k} N/m. Find ω.`,

          answer:
            omega,

          tolerance:
            0.02,

          unit:
            "rad/s",

          hint:
            "Compare mx¨ = −kx with x¨ = −ω²x.",

          solution:
            `ω = √(k/m) = √(${k}/${m}) = ${fmt(omega, 3)} rad/s.`
        });
      },


      () => {
        const m =
          choose(
            [
              0.4,
              0.6,
              0.8,
              1,
              1.2
            ]
          );

        const k =
          choose(
            [
              18,
              32,
              50,
              72
            ]
          );

        const T =
          2 *
          Math.PI *
          Math.sqrt(
            m / k
          );

        return numericQuestion({
          topic:
            "Mass–spring",

          question:
            `For m = ${m} kg and k = ${k} N/m, calculate the period.`,

          answer:
            T,

          tolerance:
            0.015,

          unit:
            "s",

          hint:
            "Use T = 2π/ω together with ω = √(k/m).",

          solution:
            `T = 2π√(m/k) = 2π√(${m}/${k}) = ${fmt(T, 3)} s.`
        });
      }

    ],


    energy: [

      () => {
        const k =
          choose(
            [
              20,
              40,
              60,
              80
            ]
          );

        const A =
          choose(
            [
              0.05,
              0.10,
              0.15,
              0.20
            ]
          );

        const E =
          0.5 *
          k *
          A **
          2;

        return numericQuestion({
          topic:
            "Energy",

          question:
            `A spring oscillator has k=${k} N/m and amplitude A=${A} m. Find the total mechanical energy.`,

          answer:
            E,

          tolerance:
            0.005,

          unit:
            "J",

          hint:
            "Evaluate the energy at a turning point.",

          solution:
            `E = ½kA² = ½(${k})(${A})² = ${fmt(E, 4)} J.`
        });
      },


      () => {
        const ratio =
          choose(
            [
              0,
              0.25,
              0.5,
              0.6,
              0.8
            ]
          );

        const kinetic =
          1 -
          ratio **
          2;

        return numericQuestion({
          topic:
            "Energy",

          question:
            `At an instant x/A = ${ratio}. What fraction of the total energy is kinetic?`,

          answer:
            kinetic,

          tolerance:
            0.01,

          unit:
            "",

          hint:
            "U/E = x²/A².",

          solution:
            `K/E = 1 − x²/A² = 1 − (${ratio})² = ${fmt(kinetic, 3)}.`
        });
      }

    ],


    pendulum: [

      () => {
        const L =
          choose(
            [
              0.4,
              0.6,
              0.8,
              1,
              1.2
            ]
          );

        const T =
          2 *
          Math.PI *
          Math.sqrt(
            L /
            9.81
          );

        return numericQuestion({
          topic:
            "Pendulum",

          question:
            `A small-angle pendulum has length ${L} m. Calculate its period near Earth's surface.`,

          answer:
            T,

          tolerance:
            0.02,

          unit:
            "s",

          hint:
            "Use T = 2π√(L/g).",

          solution:
            `T = 2π√(${L}/9.81) = ${fmt(T, 3)} s.`
        });
      },


      () =>
        multipleChoice({
          topic:
            "Pendulum",

          question:
            "Why does the simple-pendulum SHM model fail at sufficiently large amplitude?",

          options: [
            "Gravity stops acting",
            "Mass no longer cancels",
            "sinθ is no longer well approximated by θ",
            "The string becomes massless"
          ],

          answer: 2,

          hint:
            "Look at the exact restoring torque.",

          solution:
            "The exact restoring term is proportional to sinθ. Only for small angles in radians is sinθ ≈ θ."
        })

    ],


    damping: [

      () => {
        const m =
          choose(
            [
              0.5,
              1,
              1.5,
              2
            ]
          );

        const b =
          choose(
            [
              0.2,
              0.4,
              0.8,
              1
            ]
          );

        const half =
          2 *
          m *
          Math.log(2) /
          b;

        return numericQuestion({
          topic:
            "Damping",

          question:
            `For amplitude envelope A=A₀e^(−bt/2m), with m=${m} kg and b=${b} kg/s, calculate the amplitude half-life.`,

          answer:
            half,

          tolerance:
            0.03,

          unit:
            "s",

          hint:
            "Set A/A₀ = 1/2 and take logarithms.",

          solution:
            `t½ = 2m ln2 / b = ${fmt(half, 3)} s.`
        });
      },


      () =>
        multipleChoice({
          topic:
            "Resonance",

          question:
            "Increasing damping usually changes the resonance curve in which way?",

          options: [
            "Taller and narrower",
            "Lower and broader",
            "Same height but translated upward",
            "It eliminates the driving frequency"
          ],

          answer: 1,

          hint:
            "More energy is removed each cycle.",

          solution:
            "Greater damping suppresses the peak response and broadens the range of frequencies over which the response is appreciable."
        }),


      () =>
        multipleChoice({
          topic:
            "Driven motion",

          question:
            "After transients have decayed, at what frequency does a forced oscillator move?",

          options: [
            "Always its natural frequency",
            "Always zero frequency",
            "The driving frequency",
            "Twice the driving frequency"
          ],

          answer: 2,

          hint:
            "Think about the particular solution to the driven equation.",

          solution:
            "The steady-state response occurs at the driving frequency. The natural frequency influences amplitude and phase."
        })

    ]

  };


  let currentQuestion =
    null;

  let questionAnswered =
    false;

  let quickScore =
    JSON.parse(
      localStorage.getItem(
        "oscillation-grove-score"
      ) ||
      '{"correct":0,"total":0}'
    );


  function practicePool() {
    const topic =
      $("practiceTopic")
        ?.value ||
      "mixed";

    if (
      topic ===
      "mixed"
    ) {
      return Object
        .values(
          quickGenerators
        )
        .flat();
    }

    return (
      quickGenerators[
        topic
      ] ||
      Object
        .values(
          quickGenerators
        )
        .flat()
    );
  }


  function saveQuickScore() {
    localStorage.setItem(
      "oscillation-grove-score",
      JSON.stringify(
        quickScore
      )
    );

    if ($("scoreCorrect")) {
      $("scoreCorrect")
        .textContent =
        quickScore.correct;
    }

    if ($("scoreTotal")) {
      $("scoreTotal")
        .textContent =
        quickScore.total;
    }
  }


  function newQuickQuestion() {
    const pool =
      practicePool();

    currentQuestion =
      choose(pool)();

    questionAnswered =
      false;

    const card =
      $("questionCard");

    const feedback =
      $("practiceFeedback");

    if (!card) {
      return;
    }


    let answerHTML =
      "";

    if (
      currentQuestion.type ===
      "numeric"
    ) {
      answerHTML = `
        <div class="numeric-answer">

          <label>

            Your answer
            ${
              currentQuestion.unit
                ?
                `(${currentQuestion.unit})`
                :
                ""
            }

            <input
              id="practiceNumeric"
              type="number"
              step="any"
              inputmode="decimal"
            >

          </label>

        </div>
      `;
    } else {
      answerHTML = `
        <div class="answer-options">

          ${
            currentQuestion
              .options
              .map(
                (
                  option,
                  index
                ) => `
                <label class="answer-option">

                  <input
                    type="radio"
                    name="practiceChoice"
                    value="${index}"
                  >

                  <span>
                    ${option}
                  </span>

                </label>
              `
              )
              .join("")
          }

        </div>
      `;
    }


    card.innerHTML = `
      <p class="pixel-kicker">
        ${currentQuestion.topic}
      </p>

      <h3>
        ${currentQuestion.question}
      </h3>

      ${answerHTML}
    `;


    if (feedback) {
      feedback.className =
        "feedback";

      feedback.innerHTML =
        "";
    }
  }


  function showPracticeHint() {
    if (
      !currentQuestion
    ) {
      return;
    }

    const feedback =
      $("practiceFeedback");

    if (!feedback) {
      return;
    }

    feedback.className =
      "feedback hint";

    feedback.innerHTML = `
      <strong>
        Hint:
      </strong>

      ${currentQuestion.hint}
    `;
  }


  function checkQuickAnswer() {
    if (
      !currentQuestion
    ) {
      return;
    }

    let correct = false;

    let answered =
      false;


    if (
      currentQuestion.type ===
      "numeric"
    ) {
      const input =
        $("practiceNumeric");

      if (
        input &&
        input.value !== ""
      ) {
        const value =
          Number(
            input.value
          );

        answered =
          Number.isFinite(
            value
          );

        const tolerance =
          Math.max(
            currentQuestion.tolerance,

            Math.abs(
              currentQuestion.answer
            ) *
            0.005
          );

        correct =
          answered &&
          Math.abs(
            value -
            currentQuestion.answer
          ) <=
          tolerance;
      }
    } else {
      const selected =
        document.querySelector(
          'input[name="practiceChoice"]:checked'
        );

      if (selected) {
        answered = true;

        correct =
          Number(
            selected.value
          ) ===
          currentQuestion.answer;
      }
    }


    const feedback =
      $("practiceFeedback");

    if (!feedback) {
      return;
    }


    if (
      !answered
    ) {
      feedback.className =
        "feedback incorrect";

      feedback.innerHTML =
        "Enter or select an answer first.";

      return;
    }


    if (
      !questionAnswered
    ) {
      quickScore.total++;

      if (
        correct
      ) {
        quickScore.correct++;
      }

      questionAnswered =
        true;

      saveQuickScore();
    }


    feedback.className =
      `feedback ${
        correct
          ? "correct"
          : "incorrect"
      }`;


    feedback.innerHTML = `
      <strong>
        ${
          correct
            ?
            "Correct."
            :
            "Not quite."
        }
      </strong>

      <br><br>

      ${currentQuestion.solution}

      <br><br>

      <em>
        Retrieval step:
        before moving on,
        explain the method aloud
        without looking at this solution.
      </em>
    `;
  }


  $("practiceTopic")
    ?.addEventListener(
      "change",
      newQuickQuestion
    );


  $("showHint")
    ?.addEventListener(
      "click",
      showPracticeHint
    );


  $("checkAnswer")
    ?.addEventListener(
      "click",
      checkQuickAnswer
    );


  $("nextQuestion")
    ?.addEventListener(
      "click",
      newQuickQuestion
    );


  saveQuickScore();

  newQuickQuestion();


  /* =========================================================
     FORMULA SEARCH
  ========================================================= */

  $("formulaSearch")
    ?.addEventListener(
      "input",
      event => {
        const query =
          event.target
            .value
            .toLowerCase()
            .trim();

        $$(".formula-card")
          .forEach(
            card => {
              const text =
                `${
                  card.dataset
                    .keywords ||
                  ""
                } ${
                  card.textContent
                }`
                  .toLowerCase();

              card.classList.toggle(
                "hidden",
                query &&
                !text.includes(
                  query
                )
              );
            }
          );
      }
    );


  /* =========================================================
     FINAL CHECKLIST STORAGE
  ========================================================= */

  const checkboxes =
    $$(".check-grid input[type='checkbox']");

  const storedChecklist =
    JSON.parse(
      localStorage.getItem(
        "oscillation-grove-checklist"
      ) || "[]"
    );


  checkboxes.forEach(
    (
      checkbox,
      index
    ) => {
      checkbox.checked =
        Boolean(
          storedChecklist[
            index
          ]
        );

      checkbox.addEventListener(
        "change",
        () => {
          localStorage.setItem(
            "oscillation-grove-checklist",

            JSON.stringify(
              checkboxes.map(
                box =>
                  box.checked
              )
            )
          );
        }
      );
    }
  );


  /* =========================================================
     RESIZE REDRAW
  ========================================================= */

  function redrawEverything() {
    updateMotionLab();

    updateEnergyLab();

    updatePendulumLab(
      performance.now() /
      1000
    );

    updateDampingLab();

    updateResonanceLab();

    $$(".mindmap")
      .forEach(
        renderMindmap
      );
  }


  window.addEventListener(
    "resize",
    () => {
      clearTimeout(
        window.__shmResizeTimer
      );

      window.__shmResizeTimer =
        setTimeout(
          redrawEverything,
          120
        );
    }
  );


  /* =========================================================
     MAIN ANIMATION LOOP
  ========================================================= */

  function animate(
    now
  ) {
    const delta =
      Math.min(
        0.05,
        (
          now -
          motionState.lastTime
        ) /
        1000
      );

    motionState.lastTime =
      now;


    if (
      motionState.playing &&
      $("tInput")
    ) {
      motionState.time +=
        delta;

      const maximum =
        Number(
          $("tInput")
            .max || 12
        );

      if (
        motionState.time >
        maximum
      ) {
        motionState.time =
          0;
      }

      $("tInput")
        .value =
        String(
          motionState.time
        );

      updateMotionLab();
    }


    drawHero(now);

    updatePendulumLab(
      now /
      1000
    );


    requestAnimationFrame(
      animate
    );
  }


  /* =========================================================
     INITIAL RENDER
  ========================================================= */

  updateMotionLab();

  updateEnergyLab();

  updatePendulumLab(0);

  updateDampingLab();

  updateResonanceLab();

  requestAnimationFrame(
    now => {
      motionState.lastTime =
        now;

      requestAnimationFrame(
        animate
      );
    }
  );

})();
