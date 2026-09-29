(() => {
  "use strict";

  const $ = id =>
    document.getElementById(id);

  const $$ = selector =>
    [...document.querySelectorAll(selector)];

  const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, value));

  const fmt = (value, digits = 2) =>
    Number.isFinite(value)
      ? Number(value).toFixed(digits)
      : "—";

  const css = (name, fallback) =>
    getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(name)
      .trim() || fallback;

  /* ========================================================
     CANVAS HELPERS
  ======================================================== */

  function prepCanvas(canvas) {
    if (!canvas) return null;

    const dpr =
      Math.max(
        1,
        window.devicePixelRatio || 1
      );

    const logicalWidth =
      Number(
        canvas.getAttribute("width")
      ) || 800;

    const logicalHeight =
      Number(
        canvas.getAttribute("height")
      ) || 400;

    const width =
      Math.max(
        280,
        canvas.clientWidth ||
          logicalWidth
      );

    const height =
      width *
      logicalHeight /
      logicalWidth;

    if (
      canvas.width !==
        Math.round(width * dpr) ||
      canvas.height !==
        Math.round(height * dpr)
    ) {
      canvas.width =
        Math.round(width * dpr);

      canvas.height =
        Math.round(height * dpr);

      canvas.style.height =
        `${height}px`;
    }

    const ctx =
      canvas.getContext("2d");

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
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
      "rgba(148,163,184,.10)";

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i <= nx;
      i++
    ) {
      const x =
        pad +
        (w - 2 * pad) *
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
        (h - 2 * pad) *
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

  function label(
    ctx,
    text,
    x,
    y,
    align = "left"
  ) {
    ctx.save();

    ctx.fillStyle =
      "rgba(203,213,225,.74)";

    ctx.font =
      "11px ui-sans-serif, system-ui";

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
        Math.cos(angle - 0.5),

      y2 -
        10 *
        Math.sin(angle - 0.5)
    );

    ctx.lineTo(
      x2 -
        10 *
        Math.cos(angle + 0.5),

      y2 -
        10 *
        Math.sin(angle + 0.5)
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }

  /* ========================================================
     SCROLL PROGRESS
  ======================================================== */

  function updateScrollProgress() {
    const doc =
      document.documentElement;

    const max =
      doc.scrollHeight -
      innerHeight;

    const progress =
      max > 0
        ? scrollY / max
        : 0;

    if ($("scrollProgress")) {
      $("scrollProgress")
        .style.width =
        `${clamp(
          progress,
          0,
          1
        ) * 100}%`;
    }
  }

  addEventListener(
    "scroll",
    updateScrollProgress,
    {
      passive: true
    }
  );

  updateScrollProgress();

  /* ========================================================
     ACTIVE NAVIGATION
  ======================================================== */

  const sections =
    $$("main section[id]");

  const navLinks =
    $$(".nav a");

  if (
    "IntersectionObserver"
    in window
  ) {
    const observer =
      new IntersectionObserver(
        entries => {
          const visible =
            entries
              .filter(
                entry =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          if (!visible) return;

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
              0.25,
              0.6
            ]
        }
      );

    sections.forEach(
      section =>
        observer.observe(
          section
        )
    );
  }

  /* ========================================================
     SECTION COMPLETION
  ======================================================== */

  const completionButtons =
    $$("[data-complete]");

  let completed =
    new Set(
      JSON.parse(
        localStorage.getItem(
          "shm-completed"
        ) || "[]"
      )
    );

  function renderCompletion() {
    completionButtons.forEach(
      button => {
        const done =
          completed.has(
            button.dataset.complete
          );

        button.classList.toggle(
          "done",
          done
        );

        button.textContent =
          done
            ? "✓ Completed"
            : "Mark section complete";
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
            "shm-completed",
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
          "shm-completed"
        );

        renderCompletion();
      }
    );

  renderCompletion();

  /* ========================================================
     EQUATION CHOOSER
  ======================================================== */

  const chooserText = {
    mk: `
      <b>Shortest route:</b>
      use
      <span class="inline-formula">
        ω = √(k/m)
      </span>,
      then
      <span class="inline-formula">
        T = 2π/ω
      </span>
      and
      <span class="inline-formula">
        f = 1/T
      </span>.
    `,

    tf: `
      <b>Convert first:</b>
      <span class="inline-formula">
        f = 1/T
      </span>
      and
      <span class="inline-formula">
        ω = 2πf = 2π/T
      </span>.
    `,

    xt: `
      <b>
        Compare with the
        standard form:
      </b>

      <span class="inline-formula">
        x = A cos(ωt + φ)
      </span>.

      The outside coefficient
      is A; the coefficient of
      t is ω.

      Differentiate for v and a.
    `,

    xv: `
      <b>
        Use the no-time relation:
      </b>

      <span class="inline-formula">
        v² = ω²(A² − x²)
      </span>.

      If x and v are initial
      conditions,

      <span class="inline-formula">
        A = √[x² + (v/ω)²]
      </span>.
    `,

    energy: `
      <b>Use conservation:</b>

      <span class="inline-formula">
        E = ½kA²
      </span>,

      <span class="inline-formula">
        U = ½kx²
      </span>,

      then

      <span class="inline-formula">
        K = E − U
      </span>.
    `,

    pendulum: `
      <b>
        Small-angle pendulum:
      </b>

      <span class="inline-formula">
        ω = √(g/L)
      </span>

      and

      <span class="inline-formula">
        T = 2π√(L/g)
      </span>.
    `,

    damping: `
      <b>
        For an underdamped
        spring:
      </b>

      <span class="inline-formula">
        ωd =
        √(k/m − b²/4m²)
      </span>

      and the amplitude
      envelope is

      <span class="inline-formula">
        A₀e<sup>−bt/2m</sup>
      </span>.
    `
  };

  function updateChooser() {
    const select =
      $("givenSelect");

    const answer =
      $("chooserAnswer");

    if (
      select &&
      answer
    ) {
      answer.innerHTML =
        chooserText[
          select.value
        ];
    }
  }

  $("givenSelect")
    ?.addEventListener(
      "change",
      updateChooser
    );

  updateChooser();

  /* ========================================================
     HERO GRAPH
  ======================================================== */

  function drawHero(now) {
    const canvas =
      prepCanvas(
        $("heroCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const pad = 30;

    const middle =
      h * 0.53;

    const amplitude =
      h * 0.25;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      4
    );

    ctx.strokeStyle =
      "rgba(203,213,225,.25)";

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

    ctx.strokeStyle =
      css(
        "--cyan",
        "#67e8f9"
      );

    ctx.lineWidth = 3;

    ctx.beginPath();

    for (
      let i = 0;
      i <= 320;
      i++
    ) {
      const phase =
        i /
        320 *
        Math.PI *
        4;

      const x =
        pad +
        (w - 2 * pad) *
        i /
        320;

      const y =
        middle -
        amplitude *
        Math.cos(phase);

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

    const phase =
      (
        now *
        0.0012
      ) %
      (
        Math.PI *
        4
      );

    const x =
      pad +
      (w - 2 * pad) *
      phase /
      (
        Math.PI *
        4
      );

    const y =
      middle -
      amplitude *
      Math.cos(phase);

    ctx.fillStyle =
      css(
        "--violet",
        "#a78bfa"
      );

    ctx.shadowColor =
      "rgba(167,139,250,.6)";

    ctx.shadowBlur = 20;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      8,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    label(
      ctx,
      "displacement",
      pad,
      18
    );

    label(
      ctx,
      "time →",
      w - pad,
      h - 10,
      "right"
    );
  }

  /* ========================================================
     SPRING MASS MOTION LAB
  ======================================================== */

  const motion = {
    time: 0,
    playing: false,
    last:
      performance.now()
  };

  function motionParams() {
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

    return {
      A,
      m,
      k,
      phi,
      t,
      omega,

      T:
        2 *
        Math.PI /
        omega,

      f:
        omega /
        (
          2 *
          Math.PI
        )
    };
  }

  function updateMotion() {
    const p =
      motionParams();

    motion.time =
      p.t;

    const phase =
      p.omega *
      p.t +
      p.phi;

    const x =
      p.A *
      Math.cos(
        phase
      );

    const v =
      -p.omega *
      p.A *
      Math.sin(
        phase
      );

    const a =
      -(
        p.omega **
        2
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
          p.T,
          2
        )} s`;
    }

    if ($("freqMetric")) {
      $("freqMetric")
        .textContent =
        `${fmt(
          p.f,
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

    drawSpring(
      p,
      x,
      v
    );

    drawMotionPlot(p);

    drawCircleProjection(p);
  }

  function drawSpring(
    p,
    x,
    v
  ) {
    const canvas =
      prepCanvas(
        $("springCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const cyan =
      css(
        "--cyan",
        "#67e8f9"
      );

    const violet =
      css(
        "--violet",
        "#a78bfa"
      );

    const wallX =
      w * 0.08;

    const equilibrium =
      w * 0.58;

    const travel =
      w * 0.25;

    const massX =
      equilibrium +
      travel *
      x /
      p.A;

    const y =
      h * 0.56;

    ctx.fillStyle =
      "rgba(148,163,184,.16)";

    ctx.fillRect(
      wallX - 12,
      h * 0.22,
      12,
      h * 0.62
    );

    ctx.strokeStyle =
      "rgba(148,163,184,.35)";

    for (
      let sy =
        h * 0.24;

      sy <
        h * 0.84;

      sy += 12
    ) {
      ctx.beginPath();

      ctx.moveTo(
        wallX - 12,
        sy
      );

      ctx.lineTo(
        wallX,
        sy - 8
      );

      ctx.stroke();
    }

    const endX =
      massX - 34;

    const coils = 13;

    const coilAmplitude =
      10;

    ctx.strokeStyle =
      cyan;

    ctx.lineWidth =
      2.2;

    ctx.beginPath();

    ctx.moveTo(
      wallX,
      y
    );

    for (
      let i = 1;
      i < coils * 2;
      i++
    ) {
      const springX =
        wallX +
        (
          endX -
          wallX
        ) *
        i /
        (
          coils *
          2
        );

      const springY =
        y +
        (
          i % 2
            ? -coilAmplitude
            : coilAmplitude
        );

      ctx.lineTo(
        springX,
        springY
      );
    }

    ctx.lineTo(
      endX,
      y
    );

    ctx.stroke();

    ctx.strokeStyle =
      "rgba(148,163,184,.28)";

    ctx.setLineDash(
      [5, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      equilibrium,
      h * 0.17
    );

    ctx.lineTo(
      equilibrium,
      h * 0.88
    );

    ctx.stroke();

    ctx.setLineDash([]);

    label(
      ctx,
      "equilibrium",
      equilibrium,
      h * 0.14,
      "center"
    );

    ctx.fillStyle =
      violet;

    ctx.shadowColor =
      "rgba(167,139,250,.38)";

    ctx.shadowBlur = 20;

    ctx.fillRect(
      massX - 32,
      y - 32,
      64,
      64
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle =
      "#08111f";

    ctx.font =
      "800 13px system-ui";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "m",
      massX,
      y + 4
    );

    const maxVelocity =
      p.omega *
      p.A;

    const velocityLength =
      55 *
      Math.abs(v) /
      Math.max(
        maxVelocity,
        1e-9
      );

    if (
      Math.abs(v) >
      0.001
    ) {
      drawArrow(
        ctx,

        massX,
        h * 0.30,

        massX +
          Math.sign(v) *
          velocityLength,

        h * 0.30,

        css(
          "--green",
          "#34d399"
        )
      );

      label(
        ctx,
        "velocity",
        massX,
        h * 0.30 - 12,
        "center"
      );
    }

    if (
      Math.abs(x) >
      0.00001
    ) {
      const forceLength =
        60 *
        Math.abs(
          x / p.A
        );

      drawArrow(
        ctx,

        massX,
        h * 0.80,

        massX -
          Math.sign(x) *
          forceLength,

        h * 0.80,

        css(
          "--amber",
          "#fbbf24"
        )
      );

      label(
        ctx,
        "restoring force / acceleration",
        massX,
        h * 0.80 + 20,
        "center"
      );
    }

    ctx.fillStyle =
      "rgba(203,213,225,.72)";

    ctx.font =
      "12px ui-monospace, monospace";

    ctx.textAlign =
      "left";

    ctx.fillText(
      `x = ${fmt(
        x,
        2
      )} m`,
      16,
      22
    );

    ctx.fillText(
      `v = ${fmt(
        v,
        2
      )} m/s`,
      16,
      40
    );
  }

  function drawMotionPlot(p) {
    const canvas =
      prepCanvas(
        $("motionPlot")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const pad = 44;

    const span =
      2 * p.T;

    const middle =
      h / 2;

    const amplitude =
      (
        h -
        2 * pad
      ) *
      0.38;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      6
    );

    ctx.strokeStyle =
      "rgba(203,213,225,.35)";

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
            "--cyan",
            "#67e8f9"
          ),

        fn:
          t =>
            Math.cos(
              p.omega *
              t +
              p.phi
            )
      },

      {
        name:
          "v/vmax",

        colour:
          css(
            "--green",
            "#34d399"
          ),

        fn:
          t =>
            -Math.sin(
              p.omega *
              t +
              p.phi
            )
      },

      {
        name:
          "a/amax",

        colour:
          css(
            "--violet",
            "#a78bfa"
          ),

        fn:
          t =>
            -Math.cos(
              p.omega *
              t +
              p.phi
            )
      }
    ];

    curves.forEach(
      curve => {
        ctx.strokeStyle =
          curve.colour;

        ctx.lineWidth = 2;

        ctx.beginPath();

        for (
          let i = 0;
          i <= 420;
          i++
        ) {
          const t =
            span *
            i /
            420;

          const x =
            pad +
            (
              w -
              2 * pad
            ) *
            i /
            420;

          const y =
            middle -
            amplitude *
            curve.fn(t);

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
      }
    );

    const time =
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
      time /
      span;

    ctx.strokeStyle =
      "rgba(255,255,255,.55)";

    ctx.setLineDash(
      [4, 4]
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

    label(
      ctx,
      "0",
      pad,
      h - 12,
      "center"
    );

    label(
      ctx,
      "T",
      pad +
        (
          w -
          2 * pad
        ) /
        2,

      h - 12,
      "center"
    );

    label(
      ctx,
      "2T",
      w - pad,
      h - 12,
      "center"
    );

    let legendX =
      pad;

    curves.forEach(
      curve => {
        ctx.fillStyle =
          curve.colour;

        ctx.fillRect(
          legendX,
          pad - 22,
          12,
          3
        );

        label(
          ctx,
          curve.name,
          legendX + 18,
          pad - 16
        );

        legendX += 92;
      }
    );
  }

  function drawCircleProjection(p) {
    const canvas =
      prepCanvas(
        $("circleCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const cx =
      w * 0.38;

    const cy =
      h * 0.5;

    const radius =
      Math.min(
        w,
        h
      ) *
      0.29;

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
      "rgba(203,213,225,.22)";

    ctx.lineWidth =
      1.5;

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
        "--violet",
        "#a78bfa"
      );

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
      "rgba(103,232,249,.55)";

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
        "--violet",
        "#a78bfa"
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
        "--cyan",
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

    label(
      ctx,
      "uniform circular motion",
      cx,
      25,
      "center"
    );

    label(
      ctx,
      "projection = x(t)",
      pointX,
      h * 0.92,
      "center"
    );

    label(
      ctx,
      "+A",
      cx + radius,
      cy + 22,
      "center"
    );

    label(
      ctx,
      "−A",
      cx - radius,
      cy + 22,
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
          () => {
            if (
              id ===
              "tInput"
            ) {
              motion.time =
                Number(
                  $(id)
                    .value
                );
            }

            updateMotion();
          }
        );
    }
  );

  $("playMotion")
    ?.addEventListener(
      "click",
      () => {
        motion.playing =
          !motion.playing;

        $("playMotion")
          .textContent =
          motion.playing
            ? "Pause"
            : "Play";

        motion.last =
          performance.now();
      }
    );

  $("resetMotion")
    ?.addEventListener(
      "click",
      () => {
        motion.time = 0;

        if ($("tInput")) {
          $("tInput")
            .value = "0";
        }

        updateMotion();
      }
    );

  /* ========================================================
     ENERGY LAB
  ======================================================== */

  function updateEnergy() {
    const ratio =
      Number(
        $("energyXInput")
          ?.value || 0
      );

    const potential =
      ratio ** 2;

    const kinetic =
      1 -
      potential;

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
        `${100 *
          potential}%`;
    }

    if ($("kBar")) {
      $("kBar")
        .style.width =
        `${100 *
          kinetic}%`;
    }

    if ($("uPct")) {
      $("uPct")
        .textContent =
        `${Math.round(
          100 *
          potential
        )}%`;
    }

    if ($("kPct")) {
      $("kPct")
        .textContent =
        `${Math.round(
          100 *
          kinetic
        )}%`;
    }

    drawEnergy(ratio);
  }

  function drawEnergy(ratio) {
    const canvas =
      prepCanvas(
        $("energyCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const pad = 48;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      5
    );

    const xPixel =
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

    const yPixel =
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
        colour:
          css(
            "--violet",
            "#a78bfa"
          ),

        fn:
          x =>
            x * x,

        name:
          "U/E = (x/A)²"
      },

      {
        colour:
          css(
            "--green",
            "#34d399"
          ),

        fn:
          x =>
            1 -
            x * x,

        name:
          "K/E = 1 − (x/A)²"
      }
    ];

    curves.forEach(
      curve => {
        ctx.strokeStyle =
          curve.colour;

        ctx.lineWidth =
          2.4;

        ctx.beginPath();

        for (
          let i = 0;
          i <= 300;
          i++
        ) {
          const x =
            -1 +
            2 *
            i /
            300;

          const px =
            xPixel(x);

          const py =
            yPixel(
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
        "--cyan",
        "#67e8f9"
      );

    ctx.setLineDash(
      [5, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      pad,
      yPixel(1)
    );

    ctx.lineTo(
      w - pad,
      yPixel(1)
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
        energy:
          potential,

        colour:
          css(
            "--violet",
            "#a78bfa"
          )
      },

      {
        energy:
          kinetic,

        colour:
          css(
            "--green",
            "#34d399"
          )
      }
    ].forEach(
      point => {
        ctx.fillStyle =
          point.colour;

        ctx.beginPath();

        ctx.arc(
          xPixel(
            ratio
          ),
          yPixel(
            point.energy
          ),
          7,
          0,
          Math.PI *
            2
        );

        ctx.fill();
      }
    );

    ctx.strokeStyle =
      "rgba(255,255,255,.35)";

    ctx.beginPath();

    ctx.moveTo(
      xPixel(
        ratio
      ),
      pad
    );

    ctx.lineTo(
      xPixel(
        ratio
      ),
      h - pad
    );

    ctx.stroke();

    label(
      ctx,
      "−A",
      xPixel(-1),
      h - 16,
      "center"
    );

    label(
      ctx,
      "0",
      xPixel(0),
      h - 16,
      "center"
    );

    label(
      ctx,
      "+A",
      xPixel(1),
      h - 16,
      "center"
    );

    label(
      ctx,
      "E",
      pad - 10,
      yPixel(1) + 4,
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
          20,
          12,
          3
        );

        label(
          ctx,
          curve.name,
          legendX + 18,
          25
        );

        legendX += 170;
      }
    );
  }

  $("energyXInput")
    ?.addEventListener(
      "input",
      updateEnergy
    );

  /* ========================================================
     INITIAL CONDITIONS + PHASE
  ======================================================== */

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

    const box =
      $("phaseResult");

    if (!box) return;

    if (
      !(
        m > 0 &&
        k > 0 &&
        Number.isFinite(
          x0
        ) &&
        Number.isFinite(
          v0
        )
      )
    ) {
      box.textContent =
        "Enter finite x₀ and v₀, with positive m and k.";

      return;
    }

    const omega =
      Math.sqrt(
        k / m
      );

    const A =
      Math.sqrt(
        x0 ** 2 +
        (
          v0 /
          omega
        ) ** 2
      );

    const phi =
      Math.atan2(
        -v0 /
          omega,

        x0
      );

    const T =
      2 *
      Math.PI /
      omega;

    box.innerHTML = `
      <b>
        ω =
        ${fmt(
          omega,
          3
        )}
        rad/s
      </b>

      <br>

      T =
      ${fmt(
        T,
        3
      )}
      s

      <br>

      A =
      √[x₀² + (v₀/ω)²]
      =
      <b>
        ${fmt(
          A,
          4
        )}
        m
      </b>

      <br>

      φ =
      atan2(−v₀/ω, x₀)
      =
      <b>
        ${fmt(
          phi,
          3
        )}
        rad
      </b>

      <br><br>

      <span class="subtle">

        Check:

        x(0) =
        ${fmt(
          A *
          Math.cos(phi),
          4
        )}
        m

        and

        v(0) =
        ${fmt(
          -omega *
          A *
          Math.sin(phi),
          4
        )}
        m/s.

      </span>
    `;
  }

  $("solvePhase")
    ?.addEventListener(
      "click",
      solvePhase
    );

  solvePhase();

  /* ========================================================
     PENDULUM
  ======================================================== */

  const pendulum = {
    time: 0
  };

  function pendulumParams() {
    const L =
      Number(
        $("pendLength")
          ?.value || 1
      );

    const angleDeg =
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

    return {
      L,

      angleDeg,

      theta0:
        angleDeg *
        Math.PI /
        180,

      g,

      omega,

      T:
        2 *
        Math.PI /
        omega
    };
  }

  function updatePendulum() {
    const p =
      pendulumParams();

    if ($("pendLengthOut")) {
      $("pendLengthOut")
        .textContent =
        `${fmt(
          p.L,
          2
        )} m`;
    }

    if ($("pendAngleOut")) {
      $("pendAngleOut")
        .textContent =
        `${fmt(
          p.angleDeg,
          0
        )}°`;
    }

    if ($("pendPeriod")) {
      $("pendPeriod")
        .textContent =
        `${fmt(
          p.T,
          2
        )} s`;
    }

    if ($("pendOmega")) {
      $("pendOmega")
        .textContent =
        `${fmt(
          p.omega,
          2
        )} rad/s`;
    }

    drawPendulum(p);
  }

  function drawPendulum(p) {
    const canvas =
      prepCanvas(
        $("pendulumCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const theta =
      p.theta0 *
      Math.cos(
        p.omega *
        pendulum.time
      );

    const pivotX =
      w / 2;

    const pivotY =
      h * 0.14;

    const length =
      Math.min(
        h * 0.62,
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

    ctx.strokeStyle =
      "rgba(203,213,225,.25)";

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
        25
    );

    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle =
      "rgba(203,213,225,.60)";

    ctx.fillRect(
      pivotX - 60,
      pivotY - 9,
      120,
      9
    );

    ctx.strokeStyle =
      css(
        "--cyan",
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
        "--violet",
        "#a78bfa"
      );

    ctx.shadowColor =
      "rgba(167,139,250,.45)";

    ctx.shadowBlur = 20;

    ctx.beginPath();

    ctx.arc(
      bobX,
      bobY,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    label(
      ctx,
      `θ(t) ≈ ${fmt(
        theta *
        180 /
        Math.PI,
        1
      )}°`,
      16,
      24
    );

    label(
      ctx,
      `T ≈ ${fmt(
        p.T,
        2
      )} s`,
      16,
      42
    );

    if (
      p.angleDeg >
      10
    ) {
      ctx.fillStyle =
        css(
          "--amber",
          "#fbbf24"
        );

      ctx.font =
        "11px system-ui";

      ctx.textAlign =
        "center";

      ctx.fillText(
        "Large-angle warning: SHM approximation becomes less accurate",
        w / 2,
        h - 18
      );
    }
  }

  $("pendLength")
    ?.addEventListener(
      "input",
      updatePendulum
    );

  $("pendAngle")
    ?.addEventListener(
      "input",
      updatePendulum
    );

  /* ========================================================
     DAMPING
  ======================================================== */

  function dampingParams() {
    /*
      The HTML exposes only b,
      so the simulator uses

      m = 1 kg
      k = 16 N/m

      This gives natural
      angular frequency 4 rad/s.
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

    const inside =
      k / m -
      b ** 2 /
      (
        4 *
        m ** 2
      );

    return {
      m,
      k,
      b,
      omega0,

      underdamped:
        inside > 0,

      omegaD:
        inside > 0
          ? Math.sqrt(
              inside
            )
          : 0,

      ampHalfLife:
        b > 0
          ?
          2 *
          m *
          Math.log(2) /
          b
          :
          Infinity
    };
  }

  function updateDamping() {
    const p =
      dampingParams();

    if ($("dampingOut")) {
      $("dampingOut")
        .textContent =
        `${fmt(
          p.b,
          2
        )} kg/s`;
    }

    if ($("dampedOmega")) {
      $("dampedOmega")
        .textContent =
        p.underdamped
          ?
          `${fmt(
            p.omegaD,
            2
          )} rad/s`
          :
          "not oscillatory";
    }

    if ($("ampHalfLife")) {
      $("ampHalfLife")
        .textContent =
        Number.isFinite(
          p.ampHalfLife
        )
          ?
          `${fmt(
            p.ampHalfLife,
            2
          )} s`
          :
          "∞";
    }

    drawDamping(p);
  }

  function drawDamping(p) {
    const canvas =
      prepCanvas(
        $("dampingCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const pad = 46;

    drawGrid(
      ctx,
      w,
      h,
      pad,
      10,
      6
    );

    const T0 =
      2 *
      Math.PI /
      p.omega0;

    const timeMax =
      6 *
      T0;

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
      displacement =>
        h / 2 -
        (
          h -
          2 * pad
        ) *
        0.39 *
        displacement;

    if (
      p.underdamped
    ) {
      ctx.strokeStyle =
        css(
          "--cyan",
          "#67e8f9"
        );

      ctx.lineWidth =
        2.2;

      ctx.beginPath();

      for (
        let i = 0;
        i <= 600;
        i++
      ) {
        const time =
          timeMax *
          i /
          600;

        const x =
          Math.exp(
            -p.b *
            time /
            (
              2 *
              p.m
            )
          ) *
          Math.cos(
            p.omegaD *
            time
          );

        if (i) {
          ctx.lineTo(
            xPixel(time),
            yPixel(x)
          );
        } else {
          ctx.moveTo(
            xPixel(time),
            yPixel(x)
          );
        }
      }

      ctx.stroke();

      [
        1,
        -1
      ].forEach(
        sign => {
          ctx.strokeStyle =
            "rgba(167,139,250,.58)";

          ctx.setLineDash(
            [5, 5]
          );

          ctx.beginPath();

          for (
            let i = 0;
            i <= 300;
            i++
          ) {
            const time =
              timeMax *
              i /
              300;

            const envelope =
              sign *
              Math.exp(
                -p.b *
                time /
                (
                  2 *
                  p.m
                )
              );

            if (i) {
              ctx.lineTo(
                xPixel(time),
                yPixel(
                  envelope
                )
              );
            } else {
              ctx.moveTo(
                xPixel(time),
                yPixel(
                  envelope
                )
              );
            }
          }

          ctx.stroke();

          ctx.setLineDash([]);
        }
      );
    }

    ctx.strokeStyle =
      "rgba(203,213,225,.32)";

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

    label(
      ctx,
      "time →",
      w - pad,
      h - 14,
      "right"
    );

    label(
      ctx,
      "damped displacement with ± exponential envelope",
      pad,
      20
    );
  }

  $("dampingInput")
    ?.addEventListener(
      "input",
      updateDamping
    );

  /* ========================================================
     RESONANCE
  ======================================================== */

  function responseMagnification(
    ratio,
    zeta
  ) {
    return (
      1 /
      Math.sqrt(
        (
          1 -
          ratio ** 2
        ) ** 2 +
        (
          2 *
          zeta *
          ratio
        ) ** 2
      )
    );
  }

  function resonanceParams() {
    /*
      Fixed natural angular
      frequency for the graph.
    */

    const omega0 = 4;

    const dampingControl =
      Number(
        $("resDamping")
          ?.value || 0.3
      );

    /*
      Convert the simple slider
      into a damping-ratio-style
      quantity.
    */

    const zeta =
      dampingControl /
      5;

    const omegaDrive =
      Number(
        $("driveFreq")
          ?.value || 4
      );

    const ratio =
      omegaDrive /
      omega0;

    return {
      omega0,
      dampingControl,
      zeta,
      omegaDrive,
      ratio
    };
  }

  function updateResonance() {
    const p =
      resonanceParams();

    const magnification =
      responseMagnification(
        p.ratio,
        p.zeta
      );

    if (
      $("resDampingOut")
    ) {
      $("resDampingOut")
        .textContent =
        fmt(
          p.dampingControl,
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
      $("resonanceReadout")
        .innerHTML = `
        Natural angular frequency:
        <b>
          ω₀ = 4.00 rad/s
        </b>

        <br>

        Drive ratio:

        <b>
          ωdrive/ω₀ =
          ${fmt(
            p.ratio,
            2
          )}
        </b>

        <br>

        Relative steady-state
        response:

        <b>
          ${fmt(
            magnification,
            2
          )}
        </b>

        <br>

        <span class="subtle">

          Move the driving
          frequency through
          4 rad/s.

          Then increase damping
          and notice that the
          resonance peak becomes
          lower and broader.

        </span>
      `;
    }

    drawResonance(p);
  }

  function drawResonance(p) {
    const canvas =
      prepCanvas(
        $("resonanceCanvas")
      );

    if (!canvas) return;

    const {
      ctx,
      w,
      h
    } = canvas;

    const pad = 44;

    const maxOmega = 8;

    let peak = 0;

    for (
      let i = 0;
      i <= 500;
      i++
    ) {
      const omega =
        maxOmega *
        i /
        500;

      peak =
        Math.max(
          peak,

          responseMagnification(
            omega /
            p.omega0,

            p.zeta
          )
        );
    }

    const yMax =
      Math.max(
        2,
        peak *
        1.12
      );

    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
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
        maxOmega;

    const yPixel =
      amplitude =>
        h -
        pad -
        (
          h -
          2 * pad
        ) *
        amplitude /
        yMax;

    ctx.strokeStyle =
      css(
        "--cyan",
        "#67e8f9"
      );

    ctx.lineWidth =
      2.4;

    ctx.beginPath();

    for (
      let i = 0;
      i <= 600;
      i++
    ) {
      const omega =
        maxOmega *
        i /
        600;

      const amplitude =
        responseMagnification(
          omega /
          p.omega0,

          p.zeta
        );

      if (i) {
        ctx.lineTo(
          xPixel(
            omega
          ),

          yPixel(
            amplitude
          )
        );
      } else {
        ctx.moveTo(
          xPixel(
            omega
          ),

          yPixel(
            amplitude
          )
        );
      }
    }

    ctx.stroke();

    ctx.strokeStyle =
      "rgba(251,191,36,.62)";

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

    const chosenAmplitude =
      responseMagnification(
        p.ratio,
        p.zeta
      );

    ctx.fillStyle =
      css(
        "--violet",
        "#a78bfa"
      );

    ctx.beginPath();

    ctx.arc(
      xPixel(
        p.omegaDrive
      ),

      yPixel(
        chosenAmplitude
      ),

      7,
      0,
      Math.PI * 2
    );

    ctx.fill();

    label(
      ctx,
      "0",
      xPixel(0),
      h - 14,
      "center"
    );

    label(
      ctx,
      "ω₀ = 4",
      xPixel(4),
      h - 14,
      "center"
    );

    label(
      ctx,
      "8 rad/s",
      xPixel(8),
      h - 14,
      "center"
    );

    label(
      ctx,
      "relative amplitude",
      pad,
      20
    );
  }

  $("resDamping")
    ?.addEventListener(
      "input",
      updateResonance
    );

  $("driveFreq")
    ?.addEventListener(
      "input",
      updateResonance
    );

  /* ========================================================
     PRACTICE QUESTION GENERATOR
  ======================================================== */

  const random =
    (
      min,
      max,
      step = 1
    ) =>
      Math.round(
        (
          min +
          Math.random() *
          (
            max -
            min
          )
        ) /
        step
      ) *
      step;

  const pick =
    array =>
      array[
        Math.floor(
          Math.random() *
          array.length
        )
      ];

  function numeric(
    topic,
    difficulty,
    text,
    answer,
    tolerance,
    unit,
    hint,
    solution
  ) {
    return {
      type:
        "numeric",

      topic,
      difficulty,
      text,
      answer,
      tolerance,
      unit,
      hint,
      solution
    };
  }

  function mcq(
    topic,
    difficulty,
    text,
    options,
    answer,
    hint,
    solution
  ) {
    return {
      type:
        "mcq",

      topic,
      difficulty,
      text,
      options,
      answer,
      hint,
      solution
    };
  }

  const generators = {

    basics: [

      () => {
        const c =
          pick(
            [
              4,
              9,
              16,
              25,
              36
            ]
          );

        return mcq(
          "Foundations",
          "Core",

          `Which acceleration law describes SHM with ω² = ${c} s⁻²?`,

          [
            `a = +${c}x`,
            `a = −${c}x`,
            `a = −${c}x²`,
            `a = ${c}/x`
          ],

          1,

          "For SHM, acceleration must point toward equilibrium and be proportional to x.",

          `The defining relation is a = −ω²x, so a = −${c}x.`
        );
      },

      () => {
        const T =
          random(
            0.5,
            4,
            0.25
          );

        return numeric(
          "Foundations",
          "Core",

          `An oscillator has period T = ${fmt(T, 2)} s. Find f.`,

          1 / T,

          0.01,

          "Hz",

          "Use f = 1/T.",

          `f = 1/${fmt(T, 2)} = ${fmt(1/T, 3)} Hz.`
        );
      },

      () => {
        const f =
          random(
            0.5,
            5,
            0.5
          );

        return numeric(
          "Foundations",
          "Core",

          `An oscillator has frequency f = ${fmt(f,1)} Hz. Find ω.`,

          2 *
          Math.PI *
          f,

          0.03,

          "rad/s",

          "Use ω = 2πf.",

          `ω = 2π(${fmt(f,1)}) = ${fmt(2*Math.PI*f,3)} rad/s.`
        );
      }

    ],

    kinematics: [

      () => {
        const A =
          random(
            0.04,
            0.20,
            0.01
          );

        const omega =
          random(
            2,
            10,
            1
          );

        return numeric(
          "Kinematics",
          "Core",

          `For x(t) = ${fmt(A,2)} cos(${omega}t + 0.40) m, find the maximum speed.`,

          omega * A,

          0.015,

          "m/s",

          "The sine factor in v can reach magnitude 1.",

          `vmax = ωA = ${omega} × ${fmt(A,2)} = ${fmt(omega*A,3)} m/s.`
        );
      },

      () => {
        const omega =
          random(
            2,
            8,
            1
          );

        const x =
          random(
            -0.18,
            0.18,
            0.03
          );

        const a =
          -(
            omega ** 2
          ) *
          x;

        return numeric(
          "Kinematics",
          "Core",

          `At an instant, x = ${fmt(x,2)} m and ω = ${omega} rad/s. Find a.`,

          a,

          0.03,

          "m/s²",

          "Use a = −ω²x.",

          `a = −(${omega})²(${fmt(x,2)}) = ${fmt(a,3)} m/s².`
        );
      },

      () =>
        mcq(
          "Kinematics",
          "Core",

          "A mass is at x = +A. Which statement is correct?",

          [
            "v is maximum and a = 0",

            "v = 0 and acceleration points toward −x",

            "v = 0 and acceleration points toward +x",

            "v = 0 and a = 0"
          ],

          1,

          "A turning point has zero speed but maximum restoring acceleration.",

          "At x = +A, v = 0 and a = −ω²A, so acceleration points back toward equilibrium."
        )

    ],

    springs: [

      () => {
        const m =
          random(
            0.2,
            2,
            0.1
          );

        const k =
          random(
            10,
            100,
            5
          );

        const omega =
          Math.sqrt(
            k / m
          );

        return numeric(
          "Springs",
          "Core",

          `A ${fmt(m,1)} kg mass is attached to a ${k} N/m spring. Find ω.`,

          omega,

          0.02,

          "rad/s",

          "Use ω = √(k/m).",

          `ω = √(${k}/${fmt(m,1)}) = ${fmt(omega,3)} rad/s.`
        );
      },

      () => {
        const m =
          random(
            0.3,
            2,
            0.1
          );

        const k =
          random(
            15,
            90,
            5
          );

        const T =
          2 *
          Math.PI *
          Math.sqrt(
            m / k
          );

        return numeric(
          "Springs",
          "Core",

          `A spring oscillator has m = ${fmt(m,1)} kg and k = ${k} N/m. Find T.`,

          T,

          0.015,

          "s",

          "Use T = 2π√(m/k).",

          `T = 2π√(${fmt(m,1)}/${k}) = ${fmt(T,3)} s.`
        );
      }

    ],

    energy: [

      () => {
        const A =
          pick(
            [
              0.08,
              0.10,
              0.12,
              0.15
            ]
          );

        const fraction =
          pick(
            [
              0,
              0.5,
              0.6,
              0.8,
              1
            ]
          );

        const ratio =
          1 -
          fraction ** 2;

        return numeric(
          "Energy",
          "Core",

          `At x = ${fmt(fraction*A,3)} m, the amplitude is A = ${fmt(A,2)} m. What fraction K/E is kinetic?`,

          ratio,

          0.01,

          "",

          "Use U/E = x²/A², then K/E = 1 − U/E.",

          `K/E = 1 − (${fmt(fraction*A,3)}/${fmt(A,2)})² = ${fmt(ratio,3)}.`
        );
      },

      () => {
        const k =
          random(
            20,
            80,
            5
          );

        const A =
          random(
            0.05,
            0.18,
            0.01
          );

        const E =
          0.5 *
          k *
          A *
          A;

        return numeric(
          "Energy",
          "Core",

          `A spring has k = ${k} N/m and amplitude A = ${fmt(A,2)} m. Find total mechanical energy.`,

          E,

          0.005,

          "J",

          "At a turning point all energy is elastic potential energy.",

          `E = ½kA² = ½(${k})(${fmt(A,2)})² = ${fmt(E,4)} J.`
        );
      }

    ],

    pendulum: [

      () => {
        const L =
          random(
            0.25,
            2,
            0.05
          );

        const T =
          2 *
          Math.PI *
          Math.sqrt(
            L /
            9.81
          );

        return numeric(
          "Pendulums",
          "Core",

          `A small-angle pendulum has L = ${fmt(L,2)} m. Find its period on Earth.`,

          T,

          0.02,

          "s",

          "Use T = 2π√(L/g).",

          `T = 2π√(${fmt(L,2)}/9.81) = ${fmt(T,3)} s.`
        );
      },

      () =>
        mcq(
          "Pendulums",
          "Core",

          "Two ideal small-angle pendulums have the same length but different bob masses. How do their periods compare?",

          [
            "Heavier is slower",

            "Lighter is slower",

            "Their periods are equal",

            "Impossible to tell"
          ],

          2,

          "Look at the variables in T = 2π√(L/g).",

          "Mass does not appear in the ideal small-angle period formula, so the periods are equal."
        )

    ],

    damping: [

      () => {
        const m =
          random(
            0.2,
            1.2,
            0.1
          );

        const b =
          random(
            0.05,
            0.4,
            0.05
          );

        const time =
          2 *
          m *
          Math.log(2) /
          b;

        return numeric(
          "Damping",
          "Core",

          `For m = ${fmt(m,1)} kg and b = ${fmt(b,2)} kg/s, find the amplitude half-life.`,

          time,

          0.04,

          "s",

          "Set e^(−bt/2m) = 1/2.",

          `t½ = 2m ln2 / b = ${fmt(time,3)} s.`
        );
      },

      () =>
        mcq(
          "Resonance",
          "Core",

          "What happens to a resonance curve when damping increases?",

          [
            "It becomes taller and narrower",

            "It becomes lower and broader",

            "It moves to infinite frequency",

            "Nothing changes"
          ],

          1,

          "Damping removes mechanical energy.",

          "More damping suppresses the peak response and broadens the resonance curve."
        ),

      () => {
        const natural =
          random(
            2,
            7,
            0.5
          );

        const options =
          [
            natural *
            0.45,

            natural *
            0.82,

            natural *
            1.02,

            natural *
            1.75
          ].map(
            value =>
              Number(
                value.toFixed(2)
              )
          );

        return mcq(
          "Resonance",
          "Core",

          `The natural frequency is ${fmt(natural,1)} Hz. Which drive frequency is closest to resonance?`,

          options.map(
            value =>
              `${value} Hz`
          ),

          2,

          "Resonance occurs when the driving frequency is near the natural frequency.",

          `The closest option is ${options[2]} Hz.`
        );
      }

    ]

  };

  let currentQuestion =
    null;

  let answered =
    false;

  let hintVisible =
    false;

  let score =
    JSON.parse(
      localStorage.getItem(
        "shm-practice-score"
      ) ||
      '{"correct":0,"total":0}'
    );

  function selectedQuestionPool() {
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
          generators
        )
        .flat();
    }

    return (
      generators[
        topic
      ] ||
      Object
        .values(
          generators
        )
        .flat()
    );
  }

  function updateScore() {
    if ($("scoreCorrect")) {
      $("scoreCorrect")
        .textContent =
        score.correct;
    }

    if ($("scoreTotal")) {
      $("scoreTotal")
        .textContent =
        score.total;
    }

    localStorage.setItem(
      "shm-practice-score",
      JSON.stringify(
        score
      )
    );
  }

  function renderQuestion() {
    const pool =
      selectedQuestionPool();

    currentQuestion =
      pick(pool)();

    answered = false;

    hintVisible = false;

    const card =
      $("questionCard");

    if (!card) return;

    let answerHTML = "";

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
              id="practiceNumericAnswer"
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

      <div class="question-meta">

        <span>
          ${currentQuestion.topic}
        </span>

        <span>
          ${currentQuestion.difficulty}
        </span>

      </div>

      <h3>
        ${currentQuestion.text}
      </h3>

      ${answerHTML}
    `;

    if (
      $("practiceFeedback")
    ) {
      $("practiceFeedback")
        .textContent = "";

      $("practiceFeedback")
        .className =
        "feedback";
    }
  }

  function showHint() {
    if (!currentQuestion) {
      return;
    }

    hintVisible =
      !hintVisible;

    const box =
      $("practiceFeedback");

    if (!box) return;

    if (
      hintVisible
    ) {
      box.className =
        "feedback hint";

      box.innerHTML =
        `<b>Hint:</b> ${currentQuestion.hint}`;
    } else {
      box.className =
        "feedback";

      box.textContent =
        "";
    }
  }

  function checkPracticeAnswer() {
    if (!currentQuestion) {
      return;
    }

    let correct = false;

    let provided = false;

    if (
      currentQuestion.type ===
      "numeric"
    ) {
      const input =
        $("practiceNumericAnswer");

      const value =
        Number(
          input?.value
        );

      provided =
        !!input &&
        input.value !== "" &&
        Number.isFinite(
          value
        );

      if (
        provided
      ) {
        correct =
          Math.abs(
            value -
            currentQuestion.answer
          ) <=
          Math.max(
            currentQuestion.tolerance,

            Math.abs(
              currentQuestion.answer
            ) *
            0.005
          );
      }
    } else {
      const selected =
        document.querySelector(
          'input[name="practiceChoice"]:checked'
        );

      provided =
        !!selected;

      if (
        selected
      ) {
        correct =
          Number(
            selected.value
          ) ===
          currentQuestion.answer;
      }
    }

    const box =
      $("practiceFeedback");

    if (!box) return;

    if (
      !provided
    ) {
      box.className =
        "feedback incorrect";

      box.textContent =
        "Enter or select an answer first.";

      return;
    }

    if (
      !answered
    ) {
      score.total++;

      if (
        correct
      ) {
        score.correct++;
      }

      answered = true;

      updateScore();
    }

    box.className =
      `feedback ${
        correct
          ?
          "correct"
          :
          "incorrect"
      }`;

    box.innerHTML = `

      <b>
        ${
          correct
            ?
            "Correct."
            :
            "Not quite."
        }
      </b>

      <div class="solution">

        ${currentQuestion.solution}

      </div>
    `;
  }

  $("practiceTopic")
    ?.addEventListener(
      "change",
      renderQuestion
    );

  $("nextQuestion")
    ?.addEventListener(
      "click",
      renderQuestion
    );

  $("showHint")
    ?.addEventListener(
      "click",
      showHint
    );

  $("checkAnswer")
    ?.addEventListener(
      "click",
      checkPracticeAnswer
    );

  updateScore();

  renderQuestion();

  /* ========================================================
     FORMULA SEARCH
  ======================================================== */

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
              const searchable =
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
                !searchable.includes(
                  query
                )
              );
            }
          );
      }
    );

  /* ========================================================
     CHECKLIST STORAGE
  ======================================================== */

  const checklist =
    $$(".check-grid input[type='checkbox']");

  const savedChecks =
    JSON.parse(
      localStorage.getItem(
        "shm-checklist"
      ) ||
      "[]"
    );

  checklist.forEach(
    (
      checkbox,
      index
    ) => {
      checkbox.checked =
        !!savedChecks[index];

      checkbox.addEventListener(
        "change",
        () => {
          localStorage.setItem(
            "shm-checklist",

            JSON.stringify(
              checklist.map(
                item =>
                  item.checked
              )
            )
          );
        }
      );
    }
  );

  /* ========================================================
     ANIMATION LOOP
  ======================================================== */

  function animate(now) {
    const dt =
      Math.min(
        0.05,

        (
          now -
          motion.last
        ) /
        1000
      );

    motion.last =
      now;

    if (
      motion.playing &&
      $("tInput")
    ) {
      motion.time += dt;

      const max =
        Number(
          $("tInput")
            .max || 12
        );

      if (
        motion.time >
        max
      ) {
        motion.time = 0;
      }

      $("tInput")
        .value =
        String(
          motion.time
        );

      updateMotion();
    }

    pendulum.time =
      now / 1000;

    drawHero(now);

    drawPendulum(
      pendulumParams()
    );

    requestAnimationFrame(
      animate
    );
  }

  /* ========================================================
     INITIAL RENDER
  ======================================================== */

  updateMotion();

  updateEnergy();

  updatePendulum();

  updateDamping();

  updateResonance();

  addEventListener(
    "resize",
    () => {
      updateMotion();

      updateEnergy();

      updatePendulum();

      updateDamping();

      updateResonance();
    }
  );

  requestAnimationFrame(
    now => {
      motion.last =
        now;

      requestAnimationFrame(
        animate
      );
    }
  );

})();
