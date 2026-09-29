(() => {
  "use strict";


  /* =========================================================
     BASIC HELPERS
  ========================================================= */

  const $ = id =>
    document.getElementById(id);


  const $$ = selector =>
    [...document.querySelectorAll(selector)];


  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      max,
      Math.max(
        min,
        value
      )
    );


  const fmt = (
    value,
    digits = 2
  ) =>
    Number.isFinite(value)
      ? Number(value)
          .toFixed(digits)
      : "—";


  const choose = array =>
    array[
      Math.floor(
        Math.random() *
        array.length
      )
    ];


  const randomBetween = (
    min,
    max
  ) =>
    min +
    Math.random() *
    (
      max -
      min
    );


  const css = (
    variable,
    fallback
  ) =>
    getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(
        variable
      )
      .trim() ||
    fallback;



  /* =========================================================
     LOCAL STORAGE HELPERS
  ========================================================= */

  function loadJSON(
    key,
    fallback
  ) {
    try {
      const value =
        localStorage.getItem(
          key
        );

      if (
        value === null
      ) {
        return fallback;
      }

      return JSON.parse(
        value
      );
    } catch {
      return fallback;
    }
  }


  function saveJSON(
    key,
    value
  ) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(
          value
        )
      );
    } catch {
      /* Ignore storage errors */
    }
  }



  /* =========================================================
     CANVAS PREPARATION
  ========================================================= */

  function prepareCanvas(
    canvas
  ) {
    if (!canvas) {
      return null;
    }

    const dpr =
      Math.max(
        1,
        window.devicePixelRatio ||
        1
      );

    const originalWidth =
      Number(
        canvas.getAttribute(
          "width"
        )
      ) || 800;

    const originalHeight =
      Number(
        canvas.getAttribute(
          "height"
        )
      ) || 400;

    const width =
      Math.max(
        280,
        canvas.clientWidth ||
        originalWidth
      );

    const height =
      width *
      originalHeight /
      originalWidth;

    const pixelWidth =
      Math.round(
        width *
        dpr
      );

    const pixelHeight =
      Math.round(
        height *
        dpr
      );

    if (
      canvas.width !==
        pixelWidth ||
      canvas.height !==
        pixelHeight
    ) {
      canvas.width =
        pixelWidth;

      canvas.height =
        pixelHeight;

      canvas.style.height =
        `${height}px`;
    }

    const ctx =
      canvas.getContext(
        "2d"
      );

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
      h: height,
      dpr
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
      "rgba(255,230,210,.07)";

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
      "rgba(245,234,223,.75)"
  ) {
    ctx.save();

    ctx.fillStyle =
      colour;

    ctx.font =
      "11px Nunito, system-ui, sans-serif";

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
        9 *
        Math.cos(
          angle - 0.48
        ),

      y2 -
        9 *
        Math.sin(
          angle - 0.48
        )
    );

    ctx.lineTo(
      x2 -
        9 *
        Math.cos(
          angle + 0.48
        ),

      y2 -
        9 *
        Math.sin(
          angle + 0.48
        )
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }



  /* =========================================================
     CHERRY PETALS
  ========================================================= */

  function createCherryPetals() {
    const layer =
      $("petalLayer");

    if (!layer) {
      return;
    }

    layer.innerHTML = "";

    const amount =
      window.innerWidth < 600
        ? 16
        : 28;

    for (
      let i = 0;
      i < amount;
      i++
    ) {
      const petal =
        document.createElement(
          "span"
        );

      petal.className =
        "cherry-petal";

      petal.style.left =
        `${randomBetween(
          -5,
          102
        )}%`;

      petal.style.setProperty(
        "--petal-size",
        `${randomBetween(
          5,
          11
        ).toFixed(1)}px`
      );

      petal.style.setProperty(
        "--petal-opacity",
        randomBetween(
          0.3,
          0.82
        ).toFixed(2)
      );

      petal.style.setProperty(
        "--petal-duration",
        `${randomBetween(
          10,
          24
        ).toFixed(1)}s`
      );

      petal.style.setProperty(
        "--petal-delay",
        `${randomBetween(
          -22,
          0
        ).toFixed(1)}s`
      );

      petal.style.setProperty(
        "--drift-a",
        `${randomBetween(
          -80,
          85
        ).toFixed(0)}px`
      );

      petal.style.setProperty(
        "--drift-b",
        `${randomBetween(
          -100,
          100
        ).toFixed(0)}px`
      );

      petal.style.setProperty(
        "--drift-c",
        `${randomBetween(
          -120,
          120
        ).toFixed(0)}px`
      );

      petal.style.setProperty(
        "--petal-rotation",
        `${randomBetween(
          0,
          360
        ).toFixed(0)}deg`
      );

      layer.appendChild(
        petal
      );
    }
  }


  createCherryPetals();



  /* =========================================================
     AMBIENT AUDIO SYSTEM
  ========================================================= */

  const ambience = {
    context: null,

    master: null,

    rainGain: null,

    fireGain: null,

    rainSource: null,

    fireSource: null,

    fireCrackleTimer:
      null,

    rainOn: false,

    fireOn: false,

    volume:
      Number(
        localStorage.getItem(
          "shm-ambient-volume"
        ) || 0.32
      )
  };



  function ensureAudioContext() {
    if (
      ambience.context
    ) {
      if (
        ambience.context
          .state ===
        "suspended"
      ) {
        ambience.context
          .resume();
      }

      return;
    }

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const context =
      new AudioContext();

    ambience.context =
      context;

    ambience.master =
      context.createGain();

    ambience.master.gain.value =
      ambience.volume;

    ambience.master.connect(
      context.destination
    );


    ambience.rainGain =
      context.createGain();

    ambience.rainGain.gain.value =
      0;

    ambience.rainGain.connect(
      ambience.master
    );


    ambience.fireGain =
      context.createGain();

    ambience.fireGain.gain.value =
      0;

    ambience.fireGain.connect(
      ambience.master
    );
  }



  function makeNoiseBuffer(
    seconds = 4
  ) {
    const context =
      ambience.context;

    const length =
      Math.floor(
        context.sampleRate *
        seconds
      );

    const buffer =
      context.createBuffer(
        1,
        length,
        context.sampleRate
      );

    const data =
      buffer.getChannelData(
        0
      );

    for (
      let i = 0;
      i < length;
      i++
    ) {
      data[i] =
        Math.random() *
        2 -
        1;
    }

    return buffer;
  }



  function startRainAudio() {
    ensureAudioContext();

    const context =
      ambience.context;

    if (
      !context ||
      ambience.rainSource
    ) {
      return;
    }


    const source =
      context.createBufferSource();

    source.buffer =
      makeNoiseBuffer(5);

    source.loop = true;


    const highPass =
      context.createBiquadFilter();

    highPass.type =
      "highpass";

    highPass.frequency.value =
      700;


    const lowPass =
      context.createBiquadFilter();

    lowPass.type =
      "lowpass";

    lowPass.frequency.value =
      6200;


    const rainBody =
      context.createGain();

    rainBody.gain.value =
      0.36;


    source.connect(
      highPass
    );

    highPass.connect(
      lowPass
    );

    lowPass.connect(
      rainBody
    );

    rainBody.connect(
      ambience.rainGain
    );


    /*
      A second softer low-frequency
      noise layer makes the rain
      sound less like static.
    */

    const bodySource =
      context.createBufferSource();

    bodySource.buffer =
      makeNoiseBuffer(5);

    bodySource.loop = true;


    const bodyFilter =
      context.createBiquadFilter();

    bodyFilter.type =
      "bandpass";

    bodyFilter.frequency.value =
      430;

    bodyFilter.Q.value =
      0.45;


    const bodyGain =
      context.createGain();

    bodyGain.gain.value =
      0.12;


    bodySource.connect(
      bodyFilter
    );

    bodyFilter.connect(
      bodyGain
    );

    bodyGain.connect(
      ambience.rainGain
    );


    source.start();

    bodySource.start();


    ambience.rainSource = {
      source,
      bodySource
    };
  }



  function startFireAudio() {
    ensureAudioContext();

    const context =
      ambience.context;

    if (
      !context ||
      ambience.fireSource
    ) {
      return;
    }


    /*
      Low warm fire-bed noise.
    */

    const source =
      context.createBufferSource();

    source.buffer =
      makeNoiseBuffer(4);

    source.loop = true;


    const lowPass =
      context.createBiquadFilter();

    lowPass.type =
      "lowpass";

    lowPass.frequency.value =
      850;


    const highPass =
      context.createBiquadFilter();

    highPass.type =
      "highpass";

    highPass.frequency.value =
      75;


    const bedGain =
      context.createGain();

    bedGain.gain.value =
      0.23;


    source.connect(
      highPass
    );

    highPass.connect(
      lowPass
    );

    lowPass.connect(
      bedGain
    );

    bedGain.connect(
      ambience.fireGain
    );

    source.start();

    ambience.fireSource =
      source;


    scheduleCrackle();
  }



  function createCrackle() {
    if (
      !ambience.fireOn ||
      !ambience.context
    ) {
      return;
    }

    const context =
      ambience.context;

    const now =
      context.currentTime;


    const duration =
      randomBetween(
        0.025,
        0.11
      );

    const length =
      Math.max(
        1,
        Math.floor(
          context.sampleRate *
          duration
        )
      );


    const buffer =
      context.createBuffer(
        1,
        length,
        context.sampleRate
      );

    const data =
      buffer.getChannelData(
        0
      );


    for (
      let i = 0;
      i < length;
      i++
    ) {
      const envelope =
        Math.pow(
          1 -
          i /
          length,
          3.5
        );

      data[i] =
        (
          Math.random() *
          2 -
          1
        ) *
        envelope;
    }


    const source =
      context.createBufferSource();

    source.buffer =
      buffer;


    const filter =
      context.createBiquadFilter();

    filter.type =
      "bandpass";

    filter.frequency.value =
      randomBetween(
        850,
        2800
      );

    filter.Q.value =
      randomBetween(
        0.5,
        2
      );


    const gain =
      context.createGain();

    gain.gain.setValueAtTime(
      randomBetween(
        0.035,
        0.12
      ),
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now +
      duration
    );


    source.connect(
      filter
    );

    filter.connect(
      gain
    );

    gain.connect(
      ambience.fireGain
    );

    source.start(now);

    source.stop(
      now +
      duration +
      0.02
    );
  }



  function scheduleCrackle() {
    clearTimeout(
      ambience.fireCrackleTimer
    );

    if (
      !ambience.fireOn
    ) {
      return;
    }

    ambience.fireCrackleTimer =
      setTimeout(
        () => {
          const count =
            Math.random() <
            0.28
              ? 2
              : 1;

          for (
            let i = 0;
            i < count;
            i++
          ) {
            setTimeout(
              createCrackle,
              i *
              randomBetween(
                25,
                90
              )
            );
          }

          scheduleCrackle();
        },

        randomBetween(
          180,
          1100
        )
      );
  }



  function fadeGain(
    gainNode,
    target,
    seconds = 0.5
  ) {
    if (
      !gainNode ||
      !ambience.context
    ) {
      return;
    }

    const now =
      ambience.context
        .currentTime;

    gainNode.gain
      .cancelScheduledValues(
        now
      );

    gainNode.gain
      .setValueAtTime(
        Math.max(
          gainNode.gain.value,
          0.0001
        ),
        now
      );

    gainNode.gain
      .linearRampToValueAtTime(
        target,
        now +
        seconds
      );
  }



  function setRain(
    enabled
  ) {
    ensureAudioContext();

    ambience.rainOn =
      enabled;

    if (
      enabled
    ) {
      startRainAudio();

      fadeGain(
        ambience.rainGain,
        0.75
      );
    } else {
      fadeGain(
        ambience.rainGain,
        0
      );
    }


    const button =
      $("rainToggle");

    if (button) {
      button.setAttribute(
        "aria-pressed",
        String(enabled)
      );

      const small =
        button.querySelector(
          "small"
        );

      if (small) {
        small.textContent =
          enabled
            ? "on"
            : "off";
      }
    }


    $("rainVisual")
      ?.classList
      .toggle(
        "active",
        enabled
      );
  }



  function setFire(
    enabled
  ) {
    ensureAudioContext();

    ambience.fireOn =
      enabled;

    if (
      enabled
    ) {
      startFireAudio();

      fadeGain(
        ambience.fireGain,
        0.8
      );

      scheduleCrackle();
    } else {
      fadeGain(
        ambience.fireGain,
        0
      );

      clearTimeout(
        ambience.fireCrackleTimer
      );
    }


    const button =
      $("fireToggle");

    if (button) {
      button.setAttribute(
        "aria-pressed",
        String(enabled)
      );

      const small =
        button.querySelector(
          "small"
        );

      if (small) {
        small.textContent =
          enabled
            ? "on"
            : "off";
      }
    }


    $("fireGlow")
      ?.classList
      .toggle(
        "active",
        enabled
      );
  }



  $("rainToggle")
    ?.addEventListener(
      "click",
      () => {
        setRain(
          !ambience.rainOn
        );
      }
    );


  $("fireToggle")
    ?.addEventListener(
      "click",
      () => {
        setFire(
          !ambience.fireOn
        );
      }
    );


  const volumeControl =
    $("ambientVolume");


  if (volumeControl) {
    volumeControl.value =
      String(
        ambience.volume
      );

    volumeControl.addEventListener(
      "input",
      event => {
        ambience.volume =
          clamp(
            Number(
              event.target.value
            ),
            0,
            1
          );

        localStorage.setItem(
          "shm-ambient-volume",
          String(
            ambience.volume
          )
        );

        if (
          ambience.master
        ) {
          ambience.master.gain
            .setTargetAtTime(
              ambience.volume,
              ambience.context
                .currentTime,
              0.04
            );
        }
      }
    );
  }



  /* =========================================================
     ZEN MODE
  ========================================================= */

  const storedZenMode =
    localStorage.getItem(
      "shm-zen-mode"
    ) === "true";


  function setZenMode(
    enabled
  ) {
    document.body
      .classList
      .toggle(
        "zen-focus",
        enabled
      );

    const button =
      $("zenModeToggle");

    button?.setAttribute(
      "aria-pressed",
      String(enabled)
    );

    localStorage.setItem(
      "shm-zen-mode",
      String(enabled)
    );
  }


  setZenMode(
    storedZenMode
  );


  $("zenModeToggle")
    ?.addEventListener(
      "click",
      () => {
        setZenMode(
          !document.body
            .classList
            .contains(
              "zen-focus"
            )
        );
      }
    );



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
        ?
        window.scrollY /
        maximum
        :
        0;

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
     ACTIVE SIDEBAR NAVIGATION
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
            "-18% 0px -65% 0px",

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
        observer.observe(
          section
        )
    );
  }



  /* =========================================================
     COMPLETION / COURSE XP
  ========================================================= */

  const completionButtons =
    $$(
      "[data-complete]"
    );


  let completed =
    new Set(
      loadJSON(
        "oscillation-grove-completed",
        []
      )
    );


  function renderCompletion() {
    completionButtons.forEach(
      button => {
        const key =
          button.dataset.complete;

        const done =
          completed.has(
            key
          );

        button.classList.toggle(
          "done",
          done
        );

        button.textContent =
          done
            ?
            "✓ Complete"
            :
            "Mark complete";
      }
    );


    const percentage =
      completionButtons.length
        ?
        Math.round(
          100 *
          completed.size /
          completionButtons.length
        )
        :
        0;


    if (
      $("completionPct")
    ) {
      $("completionPct")
        .textContent =
        `${percentage}%`;
    }


    if (
      $("completionBar")
    ) {
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
            completed.has(
              key
            )
          ) {
            completed.delete(
              key
            );
          } else {
            completed.add(
              key
            );
          }

          saveJSON(
            "oscillation-grove-completed",
            [...completed]
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
     ACTIVE RECALL
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
              answer.classList
                .contains(
                  "show"
                )
                ?
                "Hide answer"
                :
                "Reveal answer";
          }
        );
      }
    );



  /* =========================================================
     MINDMAP DATA
  ========================================================= */

  const mindmaps = {

    module1: {

      nodes: [

        {
          id: "centre",
          label:
            "Restoring force",
          sub:
            "F = −kx",
          x: 50,
          y: 48,
          core: true
        },

        {
          id: "newton",
          label:
            "Newton II",
          sub:
            "F = ma",
          x: 18,
          y: 23
        },

        {
          id: "ode",
          label:
            "Equation of motion",
          sub:
            "x¨+(k/m)x=0",
          x: 50,
          y: 15
        },

        {
          id: "omega",
          label:
            "Natural frequency",
          sub:
            "ω=√(k/m)",
          x: 82,
          y: 23
        },

        {
          id: "accel",
          label:
            "Acceleration",
          sub:
            "a=−ω²x",
          x: 82,
          y: 72
        },

        {
          id: "equilibrium",
          label:
            "Equilibrium",
          sub:
            "x=0",
          x: 18,
          y: 72
        },

        {
          id: "period",
          label:
            "Period",
          sub:
            "T=2π√(m/k)",
          x: 50,
          y: 85
        }

      ],

      links: [
        [
          "newton",
          "centre"
        ],

        [
          "centre",
          "ode"
        ],

        [
          "ode",
          "omega"
        ],

        [
          "omega",
          "accel"
        ],

        [
          "centre",
          "equilibrium"
        ],

        [
          "omega",
          "period"
        ],

        [
          "centre",
          "accel"
        ]
      ]
    },


    module2: {

      nodes: [

        {
          id: "ode",
          label:
            "SHM ODE",
          sub:
            "x¨+ω²x=0",
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
            "r=±iω",
          x: 50,
          y: 15
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
            "Ccosωt+Dsinωt",
          x: 82,
          y: 70
        },

        {
          id: "phase",
          label:
            "Amplitude + phase",
          sub:
            "Acos(ωt+φ)",
          x: 50,
          y: 85
        },

        {
          id: "initial",
          label:
            "Initial conditions",
          sub:
            "x₀,v₀ → A,φ",
          x: 18,
          y: 70
        }

      ],

      links: [
        [
          "ode",
          "trial"
        ],

        [
          "trial",
          "roots"
        ],

        [
          "roots",
          "euler"
        ],

        [
          "euler",
          "trig"
        ],

        [
          "trig",
          "phase"
        ],

        [
          "initial",
          "phase"
        ],

        [
          "phase",
          "ode"
        ]
      ]
    },


    module3: {

      nodes: [

        {
          id: "x",
          label:
            "Position",
          sub:
            "Acosθ",
          x: 50,
          y: 48,
          core: true
        },

        {
          id: "v",
          label:
            "Velocity",
          sub:
            "−ωAsinθ",
          x: 18,
          y: 20
        },

        {
          id: "a",
          label:
            "Acceleration",
          sub:
            "−ω²Acosθ",
          x: 82,
          y: 20
        },

        {
          id: "phase",
          label:
            "Phase",
          sub:
            "θ=ωt+φ",
          x: 50,
          y: 14
        },

        {
          id: "vmax",
          label:
            "Maximum speed",
          sub:
            "ωA at x=0",
          x: 18,
          y: 76
        },

        {
          id: "amax",
          label:
            "Maximum acceleration",
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
        [
          "phase",
          "x"
        ],

        [
          "x",
          "v"
        ],

        [
          "x",
          "a"
        ],

        [
          "v",
          "vmax"
        ],

        [
          "a",
          "amax"
        ],

        [
          "vmax",
          "eliminate"
        ],

        [
          "amax",
          "eliminate"
        ],

        [
          "x",
          "eliminate"
        ]
      ]
    },


    module4: {

      nodes: [

        {
          id: "total",
          label:
            "Total energy",
          sub:
            "E=½kA²",
          x: 50,
          y: 48,
          core: true
        },

        {
          id: "u",
          label:
            "Potential",
          sub:
            "U=½kx²",
          x: 19,
          y: 24
        },

        {
          id: "k",
          label:
            "Kinetic",
          sub:
            "K=½mv²",
          x: 81,
          y: 24
        },

        {
          id: "turn",
          label:
            "Turning points",
          sub:
            "K=0,U=E",
          x: 18,
          y: 74
        },

        {
          id: "eq",
          label:
            "Equilibrium",
          sub:
            "U=0,K=E",
          x: 82,
          y: 74
        },

        {
          id: "vx",
          label:
            "Speed-position",
          sub:
            "v²=ω²(A²−x²)",
          x: 50,
          y: 86
        }

      ],

      links: [
        [
          "total",
          "u"
        ],

        [
          "total",
          "k"
        ],

        [
          "u",
          "turn"
        ],

        [
          "k",
          "eq"
        ],

        [
          "total",
          "vx"
        ],

        [
          "u",
          "vx"
        ],

        [
          "k",
          "vx"
        ]
      ]
    },


    module5: {

      nodes: [

        {
          id: "angular",
          label:
            "Angular SHM",
          sub:
            "θ¨+ω²θ=0",
          x: 50,
          y: 47,
          core: true
        },

        {
          id: "torsion",
          label:
            "Torsion",
          sub:
            "τ=−κθ",
          x: 18,
          y: 22
        },

        {
          id: "simple",
          label:
            "Simple pendulum",
          sub:
            "sinθ≈θ",
          x: 82,
          y: 22
        },

        {
          id: "rotation",
          label:
            "Rotation law",
          sub:
            "τ=Iθ¨",
          x: 18,
          y: 74
        },

        {
          id: "torsomega",
          label:
            "Torsion frequency",
          sub:
            "ω=√(κ/I)",
          x: 50,
          y: 85
        },

        {
          id: "pendomega",
          label:
            "Pendulum",
          sub:
            "ω=√(g/L)",
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
        [
          "torsion",
          "angular"
        ],

        [
          "simple",
          "angular"
        ],

        [
          "rotation",
          "angular"
        ],

        [
          "angular",
          "torsomega"
        ],

        [
          "angular",
          "pendomega"
        ],

        [
          "physical",
          "angular"
        ]
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
            "Fd=−bv",
          x: 18,
          y: 22
        },

        {
          id: "under",
          label:
            "Underdamped",
          sub:
            "b<2√mk",
          x: 82,
          y: 20
        },

        {
          id: "critical",
          label:
            "Critical",
          sub:
            "b=2√mk",
          x: 82,
          y: 49
        },

        {
          id: "over",
          label:
            "Overdamped",
          sub:
            "b>2√mk",
          x: 82,
          y: 78
        },

        {
          id: "amp",
          label:
            "Amplitude",
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
        [
          "force",
          "eq"
        ],

        [
          "eq",
          "under"
        ],

        [
          "eq",
          "critical"
        ],

        [
          "eq",
          "over"
        ],

        [
          "eq",
          "amp"
        ],

        [
          "amp",
          "energy"
        ]
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
            "Drive frequency",
          sub:
            "ω",
          x: 82,
          y: 20
        },

        {
          id: "phase",
          label:
            "Phase relation",
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
            "strong response",
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
        [
          "natural",
          "drive"
        ],

        [
          "forcing",
          "drive"
        ],

        [
          "drive",
          "phase"
        ],

        [
          "drive",
          "damping"
        ],

        [
          "phase",
          "resonance"
        ],

        [
          "damping",
          "resonance"
        ],

        [
          "amp",
          "drive"
        ]
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

    element.innerHTML =
      "";

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


    const lookup =
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
          lookup[from];

        const b =
          lookup[to];

        if (
          !a ||
          !b
        ) {
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
          "rgba(224,164,111,.38)"
        );

        line.setAttribute(
          "stroke-width",
          "3"
        );

        line.setAttribute(
          "stroke-dasharray",
          "7 7"
        );

        svg.appendChild(
          line
        );
      }
    );


    element.appendChild(
      svg
    );


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
              ?
              `<small>${node.sub}</small>`
              :
              ""
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

  const noteStates =
    new Map();



  function notebookHTML(
    key
  ) {
    return `
      <div class="note-station mc-panel">

        <div class="note-head">

          <div>

            <p class="pixel-kicker">
              FIELD NOTEBOOK
            </p>

            <h3>
              Sketch it. Derive it. Retrieve it.
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
                type="button"
              >
                Pen
              </button>


              <button
                class="mc-button"
                data-note-eraser="${key}"
                type="button"
              >
                Eraser
              </button>


              <button
                class="mc-button"
                data-note-undo="${key}"
                type="button"
              >
                Undo
              </button>


              <button
                class="mc-button"
                data-note-clear="${key}"
                type="button"
              >
                Clear
              </button>


              <button
                class="mc-button"
                data-note-save="${key}"
                type="button"
              >
                PNG
              </button>


              <input
                class="note-colour"
                data-note-colour="${key}"
                type="color"
                value="#34251f"
                title="Pen colour"
              />

            </div>


            <textarea
              data-note-text="${key}"
              placeholder="Write compact notes, derivations, mistakes, memory cues or questions here..."
            ></textarea>


            <div class="tip-box">

              <strong>
                Active recall:
              </strong>

              try reconstructing the equation chain
              from memory before scrolling back up.

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
          notebookHTML(
            key
          );
      }
    );



  function setNoteStatus(
    key,
    text
  ) {
    const status =
      document.querySelector(
        `[data-note-status="${key}"]`
      );

    if (status) {
      status.textContent =
        text;
    }
  }



  function initialiseNotebook(
    canvas
  ) {
    const key =
      canvas.dataset
        .noteCanvas;

    const ctx =
      canvas.getContext(
        "2d"
      );

    const state = {
      key,
      canvas,
      ctx,

      drawing: false,

      erasing: false,

      colour:
        "#34251f",

      width: 3,

      history: []
    };


    noteStates.set(
      key,
      state
    );


    function positionFromEvent(
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



    function snapshot() {
      try {
        state.history.push(
          canvas.toDataURL(
            "image/png"
          )
        );

        if (
          state.history.length >
          12
        ) {
          state.history.shift();
        }
      } catch {
        /* ignore */
      }
    }



    function persistDrawing() {
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
          "drawing too large to save"
        );
      }
    }



    function start(
      event
    ) {
      event.preventDefault();

      snapshot();

      canvas.setPointerCapture?.(
        event.pointerId
      );

      const point =
        positionFromEvent(
          event
        );

      state.drawing =
        true;

      ctx.beginPath();

      ctx.moveTo(
        point.x,
        point.y
      );

      setNoteStatus(
        key,
        state.erasing
          ?
          "erasing…"
          :
          "writing…"
      );
    }



    function move(
      event
    ) {
      if (
        !state.drawing
      ) {
        return;
      }

      event.preventDefault();

      const point =
        positionFromEvent(
          event
        );

      const pressure =
        event.pressure > 0
          ?
          event.pressure
          :
          0.55;

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
          22 +
          18 *
          pressure;
      } else {
        ctx.globalCompositeOperation =
          "source-over";

        ctx.strokeStyle =
          state.colour;

        ctx.lineWidth =
          state.width *
          (
            0.72 +
            pressure *
            0.9
          );
      }

      ctx.lineTo(
        point.x,
        point.y
      );

      ctx.stroke();
    }



    function stop(
      event
    ) {
      if (
        !state.drawing
      ) {
        return;
      }

      state.drawing =
        false;

      ctx.closePath();

      canvas.releasePointerCapture?.(
        event.pointerId
      );

      persistDrawing();
    }


    canvas.addEventListener(
      "pointerdown",
      start
    );

    canvas.addEventListener(
      "pointermove",
      move
    );

    canvas.addEventListener(
      "pointerup",
      stop
    );

    canvas.addEventListener(
      "pointercancel",
      stop
    );

    canvas.addEventListener(
      "pointerleave",
      event => {
        if (
          event.buttons === 0
        ) {
          stop(event);
        }
      }
    );



    /* Load saved handwriting */

    const savedDrawing =
      localStorage.getItem(
        `shm-note-drawing-${key}`
      );

    if (
      savedDrawing
    ) {
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
        savedDrawing;
    }



    /* Typed notes */

    const textarea =
      document.querySelector(
        `[data-note-text="${key}"]`
      );

    const savedText =
      localStorage.getItem(
        `shm-note-text-${key}`
      );

    if (
      textarea &&
      savedText !== null
    ) {
      textarea.value =
        savedText;
    }


    let typingTimer =
      null;


    textarea?.addEventListener(
      "input",
      () => {
        setNoteStatus(
          key,
          "typing…"
        );

        clearTimeout(
          typingTimer
        );

        typingTimer =
          setTimeout(
            () => {
              try {
                localStorage.setItem(
                  `shm-note-text-${key}`,
                  textarea.value
                );

                setNoteStatus(
                  key,
                  "saved"
                );
              } catch {
                setNoteStatus(
                  key,
                  "could not save"
                );
              }
            },
            300
          );
      }
    );



    /* Pen */

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



    /* Eraser */

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



    /* Colour */

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

          setNoteStatus(
            key,
            "pen"
          );
        }
      );



    /* Undo */

    document
      .querySelector(
        `[data-note-undo="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          const previous =
            state.history.pop();

          if (
            !previous
          ) {
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

              persistDrawing();
            };

          image.src =
            previous;
        }
      );



    /* Clear */

    document
      .querySelector(
        `[data-note-clear="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          snapshot();

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          persistDrawing();
        }
      );



    /* Save PNG */

    document
      .querySelector(
        `[data-note-save="${key}"]`
      )
      ?.addEventListener(
        "click",
        () => {
          const exportCanvas =
            document.createElement(
              "canvas"
            );

          exportCanvas.width =
            canvas.width;

          exportCanvas.height =
            canvas.height;

          const exportContext =
            exportCanvas
              .getContext(
                "2d"
              );

          exportContext.fillStyle =
            "#f3e8c3";

          exportContext.fillRect(
            0,
            0,
            exportCanvas.width,
            exportCanvas.height
          );

          exportContext.drawImage(
            canvas,
            0,
            0
          );


          const link =
            document.createElement(
              "a"
            );

          link.download =
            `${key}-shm-notes.png`;

          link.href =
            exportCanvas.toDataURL(
              "image/png"
            );

          link.click();
        }
      );
  }



  $$(".note-canvas")
    .forEach(
      initialiseNotebook
    );



  /* =========================================================
     HERO GRAPH
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


    const pad = 30;

    const middle =
      h * 0.54;

    const amplitude =
      h * 0.25;


    drawGrid(
      ctx,
      w,
      h,
      pad,
      9,
      5
    );


    ctx.strokeStyle =
      "rgba(255,235,220,.18)";

    ctx.lineWidth = 1;

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
        "--diamond",
        "#8acbd0"
      );

    ctx.lineWidth = 2.4;

    ctx.beginPath();


    for (
      let i = 0;
      i <= 420;
      i++
    ) {
      const theta =
        i /
        420 *
        Math.PI *
        4;

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
        Math.cos(
          theta
        );

      if (
        i === 0
      ) {
        ctx.moveTo(
          x,
          y
        );
      } else {
        ctx.lineTo(
          x,
          y
        );
      }
    }

    ctx.stroke();


    const phase =
      (
        time *
        0.0012
      ) %
      (
        Math.PI *
        4
      );


    const ballX =
      pad +
      (
        w -
        2 * pad
      ) *
      phase /
      (
        Math.PI *
        4
      );

    const ballY =
      middle -
      amplitude *
      Math.cos(
        phase
      );


    ctx.fillStyle =
      css(
        "--cherry",
        "#d48295"
      );

    ctx.shadowColor =
      "rgba(212,130,149,.60)";

    ctx.shadowBlur =
      18;

    ctx.beginPath();

    ctx.arc(
      ballX,
      ballY,
      7,
      0,
      Math.PI *
        2
    );

    ctx.fill();

    ctx.shadowBlur =
      0;


    canvasLabel(
      ctx,
      "x(t) = A cos(ωt + φ)",
      18,
      22
    );

    canvasLabel(
      ctx,
      "time →",
      w - 18,
      h - 12,
      "right"
    );
  }



  /* =========================================================
     SPRING LAB
  ========================================================= */

  const motionState = {
    playing: false,

    time: 0,

    last:
      performance.now()
  };


  function motionParameters() {
    const A =
      Number(
        $("AInput")
          ?.value ||
        0.8
      );

    const m =
      Number(
        $("mInput")
          ?.value ||
        1
      );

    const k =
      Number(
        $("kInput")
          ?.value ||
        16
      );

    const phi =
      Number(
        $("phiInput")
          ?.value ||
        0
      );

    const t =
      Number(
        $("tInput")
          ?.value ||
        0
      );


    const omega =
      Math.sqrt(
        k /
        m
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
      Math.cos(
        theta
      );

    const v =
      -p.omega *
      p.A *
      Math.sin(
        theta
      );

    const a =
      -(
        p.omega **
        2
      ) *
      x;


    if (
      $("AOut")
    ) {
      $("AOut")
        .textContent =
        `${fmt(
          p.A,
          2
        )} m`;
    }


    if (
      $("mOut")
    ) {
      $("mOut")
        .textContent =
        `${fmt(
          p.m,
          2
        )} kg`;
    }


    if (
      $("kOut")
    ) {
      $("kOut")
        .textContent =
        `${fmt(
          p.k,
          0
        )} N/m`;
    }


    if (
      $("phiOut")
    ) {
      $("phiOut")
        .textContent =
        `${fmt(
          p.phi,
          2
        )} rad`;
    }


    if (
      $("tOut")
    ) {
      $("tOut")
        .textContent =
        `${fmt(
          p.t,
          2
        )} s`;
    }


    if (
      $("omegaMetric")
    ) {
      $("omegaMetric")
        .textContent =
        `${fmt(
          p.omega,
          2
        )} rad/s`;
    }


    if (
      $("periodMetric")
    ) {
      $("periodMetric")
        .textContent =
        `${fmt(
          p.period,
          2
        )} s`;
    }


    if (
      $("freqMetric")
    ) {
      $("freqMetric")
        .textContent =
        `${fmt(
          p.frequency,
          2
        )} Hz`;
    }


    if (
      $("xMetric")
    ) {
      $("xMetric")
        .textContent =
        `${fmt(
          x,
          2
        )} m`;
    }


    if (
      $("vMetric")
    ) {
      $("vMetric")
        .textContent =
        `${fmt(
          v,
          2
        )} m/s`;
    }


    if (
      $("aMetric")
    ) {
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
      v,
      a
    );

    drawMotionGraph(
      p
    );

    drawCircularProjection(
      p
    );
  }



  function drawSpring(
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
      w *
      0.08;

    const equilibrium =
      w *
      0.59;

    const travel =
      w *
      0.25;

    const blockX =
      equilibrium +
      travel *
      x /
      p.A;

    const y =
      h *
      0.55;


    /*
      Wall
    */

    ctx.fillStyle =
      "#4c3025";

    ctx.fillRect(
      wallX - 14,
      h * 0.20,
      14,
      h * 0.65
    );


    ctx.strokeStyle =
      "rgba(229,172,117,.55)";

    for (
      let yy =
        h *
        0.22;

      yy <
        h *
        0.84;

      yy +=
        13
    ) {
      ctx.beginPath();

      ctx.moveTo(
        wallX - 14,
        yy
      );

      ctx.lineTo(
        wallX,
        yy - 8
      );

      ctx.stroke();
    }


    /*
      Spring
    */

    const endX =
      blockX -
      31;

    const coils =
      14;

    const coilHeight =
      9;


    ctx.strokeStyle =
      css(
        "--diamond",
        "#8acbd0"
      );

    ctx.lineWidth =
      2.2;

    ctx.beginPath();

    ctx.moveTo(
      wallX,
      y
    );


    for (
      let i = 1;
      i <
      coils *
      2;
      i++
    ) {
      const sx =
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

      const sy =
        y +
        (
          i %
          2
            ?
            -coilHeight
            :
            coilHeight
        );

      ctx.lineTo(
        sx,
        sy
      );
    }


    ctx.lineTo(
      endX,
      y
    );

    ctx.stroke();



    /*
      Equilibrium
    */

    ctx.strokeStyle =
      "rgba(245,234,223,.22)";

    ctx.setLineDash(
      [5, 5]
    );

    ctx.beginPath();

    ctx.moveTo(
      equilibrium,
      h *
      0.15
    );

    ctx.lineTo(
      equilibrium,
      h *
      0.88
    );

    ctx.stroke();

    ctx.setLineDash([]);



    /*
      Mass
    */

    ctx.fillStyle =
      css(
        "--cherry",
        "#d48295"
      );

    ctx.fillRect(
      blockX - 30,
      y - 30,
      60,
      60
    );

    ctx.strokeStyle =
      "#714151";

    ctx.lineWidth =
      3;

    ctx.strokeRect(
      blockX - 30,
      y - 30,
      60,
      60
    );


    ctx.fillStyle =
      "#25181c";

    ctx.font =
      "700 14px Nunito, sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "m",
      blockX,
      y + 5
    );


    /*
      Velocity arrow
    */

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
        h *
        0.28,

        blockX +
        Math.sign(v) *
        velocityScale,

        h *
        0.28,

        css(
          "--emerald",
          "#74a36c"
        )
      );
    }



    /*
      Acceleration arrow
    */

    const accelerationScale =
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
        h *
        0.81,

        blockX +
        Math.sign(a) *
        accelerationScale,

        h *
        0.81,

        css(
          "--gold",
          "#e9ad56"
        )
      );
    }


    canvasLabel(
      ctx,
      "equilibrium",
      equilibrium,
      h *
      0.11,
      "center"
    );


    canvasLabel(
      ctx,
      `x = ${fmt(
        x,
        3
      )} m`,
      15,
      22
    );


    canvasLabel(
      ctx,
      "green: velocity",
      15,
      41,
      "left",
      css(
        "--emerald",
        "#74a36c"
      )
    );


    canvasLabel(
      ctx,
      "gold: acceleration",
      15,
      59,
      "left",
      css(
        "--gold",
        "#e9ad56"
      )
    );
  }



  function drawMotionGraph(
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


    const pad =
      44;

    const span =
      2 *
      p.period;

    const middle =
      h /
      2;

    const graphAmplitude =
      (
        h -
        2 *
        pad
      ) *
      0.37;


    drawGrid(
      ctx,
      w,
      h,
      pad,
      8,
      6
    );


    ctx.strokeStyle =
      "rgba(245,234,223,.20)";

    ctx.beginPath();

    ctx.moveTo(
      pad,
      middle
    );

    ctx.lineTo(
      w -
      pad,
      middle
    );

    ctx.stroke();


    const curves = [

      {
        name:
          "x/A",

        colour:
          css(
            "--diamond",
            "#8acbd0"
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
        name:
          "v/vmax",

        colour:
          css(
            "--emerald",
            "#74a36c"
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
        name:
          "a/amax",

        colour:
          css(
            "--cherry",
            "#d48295"
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

        ctx.lineWidth =
          2.1;

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
              2 *
              pad
            ) *
            i /
            500;

          const py =
            middle -
            graphAmplitude *
            curve.fn(
              time
            );


          if (
            i === 0
          ) {
            ctx.moveTo(
              px,
              py
            );
          } else {
            ctx.lineTo(
              px,
              py
            );
          }
        }

        ctx.stroke();
      }
    );


    const wrapped =
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
        2 *
        pad
      ) *
      wrapped /
      span;


    ctx.strokeStyle =
      "rgba(255,245,235,.48)";

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
      h -
      pad
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
          13,
          3
        );

        canvasLabel(
          ctx,
          curve.name,
          legendX + 18,
          23
        );

        legendX +=
          105;
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
      w /
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



  function drawCircularProjection(
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
      w *
      0.40;

    const cy =
      h *
      0.52;

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
      Math.cos(
        theta
      );

    const pointY =
      cy -
      radius *
      Math.sin(
        theta
      );


    ctx.strokeStyle =
      "rgba(245,234,223,.20)";

    ctx.lineWidth =
      1.5;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI *
      2
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
        "#d48295"
      );

    ctx.lineWidth =
      2.5;

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
      "rgba(138,203,208,.55)";

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
        "#d48295"
      );

    ctx.beginPath();

    ctx.arc(
      pointX,
      pointY,
      7,
      0,
      Math.PI *
      2
    );

    ctx.fill();


    ctx.fillStyle =
      css(
        "--diamond",
        "#8acbd0"
      );

    ctx.beginPath();

    ctx.arc(
      pointX,
      cy,
      8,
      0,
      Math.PI *
      2
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
      "projected SHM",
      pointX,
      h *
      0.91,
      "center"
    );


    canvasLabel(
      ctx,
      "−A",
      cx -
      radius,
      cy + 23,
      "center"
    );


    canvasLabel(
      ctx,
      "+A",
      cx +
      radius,
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
          () => {
            if (
              id ===
              "tInput"
            ) {
              motionState.time =
                Number(
                  $(id)
                    .value
                );
            }

            updateMotionLab();
          }
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
            ?
            "Pause"
            :
            "Play";

        motionState.last =
          performance.now();
      }
    );


  $("resetMotion")
    ?.addEventListener(
      "click",
      () => {
        motionState.time =
          0;

        if (
          $("tInput")
        ) {
          $("tInput")
            .value =
            "0";
        }

        updateMotionLab();
      }
    );



  /* =========================================================
     INITIAL CONDITION / PHASE SOLVER
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
      !Number.isFinite(
        x0
      ) ||
      !Number.isFinite(
        v0
      ) ||
      !(m > 0) ||
      !(k > 0)
    ) {
      result.textContent =
        "Enter finite x₀ and v₀ values with positive m and k.";

      return;
    }


    const omega =
      Math.sqrt(
        k /
        m
      );


    /*
      x(0) = A cosφ

      v(0) = −ωA sinφ

      therefore

      A² =
      x₀² +
      (v₀/ω)²
    */

    const amplitude =
      Math.sqrt(
        x0 **
        2 +
        (
          v0 /
          omega
        ) **
        2
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
        1 · Find the natural frequency
      </strong>

      <br>

      ω = √(k/m)
      = √(${fmt(k, 3)}/${fmt(m, 3)})
      =

      <strong>
        ${fmt(omega, 4)}
        rad s⁻¹
      </strong>


      <br><br>


      <strong>
        2 · Find the amplitude
      </strong>

      <br>

      A =
      √[x₀²+(v₀/ω)²]

      <br>

      A =

      <strong>
        ${fmt(amplitude, 5)}
        m
      </strong>


      <br><br>


      <strong>
        3 · Find the phase
      </strong>

      <br>

      φ =
      atan2(−v₀/ω,x₀)

      <br>

      φ =

      <strong>
        ${fmt(phase, 4)}
        rad
      </strong>


      <br><br>


      <strong>
        Motion
      </strong>

      <br>

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
          ?.value ||
        0
      );


    const potential =
      ratio **
      2;

    const kinetic =
      1 -
      potential;


    if (
      $("energyXOut")
    ) {
      $("energyXOut")
        .textContent =
        fmt(
          ratio,
          2
        );
    }


    if (
      $("uBar")
    ) {
      $("uBar")
        .style.width =
        `${potential * 100}%`;
    }


    if (
      $("kBar")
    ) {
      $("kBar")
        .style.width =
        `${kinetic * 100}%`;
    }


    if (
      $("uPct")
    ) {
      $("uPct")
        .textContent =
        `${Math.round(
          potential *
          100
        )}%`;
    }


    if (
      $("kPct")
    ) {
      $("kPct")
        .textContent =
        `${Math.round(
          kinetic *
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


    const pad =
      48;


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
          2 *
          pad
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
          2 *
          pad
        ) *
        energy;


    const curves = [

      {
        name:
          "U/E",

        colour:
          css(
            "--cherry",
            "#d48295"
          ),

        fn:
          x =>
            x **
            2
      },


      {
        name:
          "K/E",

        colour:
          css(
            "--emerald",
            "#74a36c"
          ),

        fn:
          x =>
            1 -
            x **
            2
      }

    ];


    curves.forEach(
      curve => {
        ctx.strokeStyle =
          curve.colour;

        ctx.lineWidth =
          2.3;

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
            xPixel(
              x
            );

          const py =
            yPixel(
              curve.fn(
                x
              )
            );


          if (
            i === 0
          ) {
            ctx.moveTo(
              px,
              py
            );
          } else {
            ctx.lineTo(
              px,
              py
            );
          }
        }

        ctx.stroke();
      }
    );


    /*
      Total energy line
    */

    ctx.strokeStyle =
      css(
        "--gold",
        "#e9ad56"
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


    /*
      Current x
    */

    ctx.strokeStyle =
      "rgba(255,245,235,.34)";

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


    const potential =
      ratio **
      2;

    const kinetic =
      1 -
      potential;


    [
      {
        y:
          potential,

        colour:
          css(
            "--cherry",
            "#d48295"
          )
      },

      {
        y:
          kinetic,

        colour:
          css(
            "--emerald",
            "#74a36c"
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
            point.y
          ),
          6,
          0,
          Math.PI *
          2
        );

        ctx.fill();
      }
    );


    canvasLabel(
      ctx,
      "−A",
      xPixel(-1),
      h - 14,
      "center"
    );


    canvasLabel(
      ctx,
      "0",
      xPixel(0),
      h - 14,
      "center"
    );


    canvasLabel(
      ctx,
      "+A",
      xPixel(1),
      h - 14,
      "center"
    );


    canvasLabel(
      ctx,
      "E",
      pad - 7,
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
          18,
          13,
          3
        );

        canvasLabel(
          ctx,
          curve.name,
          legendX + 18,
          23
        );

        legendX +=
          85;
      }
    );
  }


  $("energyXInput")
    ?.addEventListener(
      "input",
      updateEnergyLab
    );



  /* =========================================================
     PENDULUM
  ========================================================= */

  function pendulumParameters() {
    const L =
      Number(
        $("pendLength")
          ?.value ||
        1
      );

    const angleDegrees =
      Number(
        $("pendAngle")
          ?.value ||
        10
      );

    const g =
      9.81;

    const omega =
      Math.sqrt(
        g /
        L
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

      g,
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


    /*
      Small-angle SHM approximation
      being visualised.
    */

    const theta =
      p.angleRadians *
      Math.cos(
        p.omega *
        time
      );


    const pivotX =
      w /
      2;

    const pivotY =
      h *
      0.14;

    const length =
      Math.min(
        h *
        0.63,
        w *
        0.35
      );


    const bobX =
      pivotX +
      length *
      Math.sin(
        theta
      );

    const bobY =
      pivotY +
      length *
      Math.cos(
        theta
      );


    ctx.fillStyle =
      "#573c2d";

    ctx.fillRect(
      pivotX - 75,
      pivotY - 10,
      150,
      10
    );


    ctx.strokeStyle =
      "rgba(245,234,223,.22)";

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


    ctx.strokeStyle =
      css(
        "--diamond",
        "#8acbd0"
      );

    ctx.lineWidth =
      2.5;

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
        "#d48295"
      );

    ctx.strokeStyle =
      "#704251";

    ctx.lineWidth =
      3;

    ctx.beginPath();

    ctx.arc(
      bobX,
      bobY,
      17,
      0,
      Math.PI *
      2
    );

    ctx.fill();

    ctx.stroke();


    canvasLabel(
      ctx,
      `θ(t) ≈ ${fmt(
        theta *
        180 /
        Math.PI,
        1
      )}°`,
      15,
      22
    );


    canvasLabel(
      ctx,
      `T ≈ ${fmt(
        p.period,
        3
      )} s`,
      15,
      41
    );


    if (
      p.angleDegrees >
      10
    ) {
      canvasLabel(
        ctx,

        "small-angle approximation becomes less accurate as amplitude increases",

        w /
        2,

        h - 16,

        "center",

        css(
          "--gold",
          "#e9ad56"
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
     DAMPING
  ========================================================= */

  function dampingParameters() {
    /*
      Demonstration oscillator:

      m = 1 kg
      k = 16 N/m

      Therefore:
      ω0 = 4 rad/s
      critical b = 8 kg/s
    */

    const m =
      1;

    const k =
      16;

    const b =
      Number(
        $("dampingInput")
          ?.value ||
        0.4
      );


    const omega0 =
      Math.sqrt(
        k /
        m
      );


    const critical =
      2 *
      Math.sqrt(
        m *
        k
      );


    const inside =
      k /
      m -
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


    return {
      m,
      k,
      b,
      omega0,
      critical,
      regime,

      omegaD:
        inside > 0
          ?
          Math.sqrt(
            inside
          )
          :
          0,

      amplitudeHalfLife:
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



  function dampingDisplacement(
    p,
    time
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
          time /
          (
            2 *
            m
          )
        ) *
        Math.cos(
          p.omegaD *
          time
        )
      );
    }


    if (
      Math.abs(
        b -
        critical
      ) <
      1e-5
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
        time
      ) *
      Math.exp(
        -gamma *
        time
      );
    }


    const root =
      Math.sqrt(
        b **
        2 -
        4 *
        m *
        k
      );


    const r1 =
      (
        -b +
        root
      ) /
      (
        2 *
        m
      );


    const r2 =
      (
        -b -
        root
      ) /
      (
        2 *
        m
      );


    /*
      Constants chosen such that
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
        time
      ) +
      c2 *
      Math.exp(
        r2 *
        time
      )
    );
  }



  function updateDampingLab() {
    const p =
      dampingParameters();


    if (
      $("dampingOut")
    ) {
      $("dampingOut")
        .textContent =
        `${fmt(
          p.b,
          2
        )} kg/s`;
    }


    if (
      $("dampedOmega")
    ) {
      $("dampedOmega")
        .textContent =
        p.regime ===
        "underdamped"
          ?
          `${fmt(
            p.omegaD,
            2
          )} rad/s`
          :
          p.regime;
    }


    if (
      $("ampHalfLife")
    ) {
      $("ampHalfLife")
        .textContent =
        Number.isFinite(
          p.amplitudeHalfLife
        )
          ?
          `${fmt(
            p.amplitudeHalfLife,
            2
          )} s`
          :
          "∞";
    }


    drawDampingGraph(
      p
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


    const pad =
      44;

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
          2 *
          pad
        ) *
        time /
        timeMax;


    const yPixel =
      value =>
        h /
        2 -
        (
          h -
          2 *
          pad
        ) *
        0.38 *
        value;


    ctx.strokeStyle =
      "rgba(245,234,223,.20)";

    ctx.beginPath();

    ctx.moveTo(
      pad,
      h /
      2
    );

    ctx.lineTo(
      w - pad,
      h /
      2
    );

    ctx.stroke();


    ctx.strokeStyle =
      css(
        "--diamond",
        "#8acbd0"
      );

    ctx.lineWidth =
      2.3;

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

      const value =
        dampingDisplacement(
          p,
          time
        );


      if (
        i === 0
      ) {
        ctx.moveTo(
          xPixel(
            time
          ),
          yPixel(
            value
          )
        );
      } else {
        ctx.lineTo(
          xPixel(
            time
          ),
          yPixel(
            value
          )
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
            "rgba(212,130,149,.48)";

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


            if (
              i === 0
            ) {
              ctx.moveTo(
                xPixel(
                  time
                ),
                yPixel(
                  envelope
                )
              );
            } else {
              ctx.lineTo(
                xPixel(
                  time
                ),
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


    canvasLabel(
      ctx,
      `regime: ${p.regime}`,
      pad,
      20
    );


    canvasLabel(
      ctx,
      `critical b = ${fmt(
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
     RESONANCE
  ========================================================= */

  function responseAmplitude(
    omega,
    m,
    k,
    b,
    F0 = 1
  ) {
    return (
      F0 /
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
    const m =
      1;

    const k =
      16;

    const b =
      Number(
        $("resDamping")
          ?.value ||
        0.3
      );

    const omegaDrive =
      Number(
        $("driveFreq")
          ?.value ||
        4
      );

    const omega0 =
      Math.sqrt(
        k /
        m
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
      responseAmplitude(
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
      $("resonanceReadout")
        .innerHTML = `

          Natural angular frequency:

          <strong>
            ω₀ =
            ${fmt(
              p.omega0,
              2
            )}
            rad/s
          </strong>


          <br>


          Drive ratio:

          <strong>
            ω/ω₀ =
            ${fmt(
              p.omegaDrive /
              p.omega0,
              2
            )}
          </strong>


          <br>


          Steady-state amplitude for F₀=1 N:

          <strong>
            ${fmt(
              amplitude,
              4
            )}
            m
          </strong>
        `;
    }


    drawResonanceGraph(
      p
    );
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


    const pad =
      46;

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


    let graphMaximum =
      0;


    for (
      let i = 0;
      i <= 500;
      i++
    ) {
      const omega =
        omegaMax *
        i /
        500;

      graphMaximum =
        Math.max(
          graphMaximum,

          responseAmplitude(
            omega,
            p.m,
            p.k,
            p.b
          )
        );
    }


    graphMaximum =
      Math.max(
        graphMaximum *
        1.08,
        0.2
      );


    const xPixel =
      omega =>
        pad +
        (
          w -
          2 *
          pad
        ) *
        omega /
        omegaMax;


    const yPixel =
      value =>
        h -
        pad -
        (
          h -
          2 *
          pad
        ) *
        value /
        graphMaximum;


    ctx.strokeStyle =
      css(
        "--diamond",
        "#8acbd0"
      );

    ctx.lineWidth =
      2.3;

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
        responseAmplitude(
          omega,
          p.m,
          p.k,
          p.b
        );


      if (
        i === 0
      ) {
        ctx.moveTo(
          xPixel(
            omega
          ),
          yPixel(
            amplitude
          )
        );
      } else {
        ctx.lineTo(
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



    /*
      Natural frequency marker
    */

    ctx.strokeStyle =
      css(
        "--gold",
        "#e9ad56"
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



    /*
      Current driving point
    */

    const currentAmplitude =
      responseAmplitude(
        p.omegaDrive,
        p.m,
        p.k,
        p.b
      );


    ctx.fillStyle =
      css(
        "--cherry",
        "#d48295"
      );

    ctx.beginPath();

    ctx.arc(
      xPixel(
        p.omegaDrive
      ),
      yPixel(
        currentAmplitude
      ),
      7,
      0,
      Math.PI *
      2
    );

    ctx.fill();


    canvasLabel(
      ctx,
      "response amplitude",
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
      "drive frequency →",
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
    60 *
    60;


  let paperTimerRunning =
    false;


  let timerInterval =
    null;



  function physicsPaper() {
    const mass =
      choose(
        [
          0.35,
          0.40,
          0.50,
          0.80,
          1.20
        ]
      );


    const spring =
      choose(
        [
          28,
          32,
          50,
          72,
          98
        ]
      );


    const amplitude =
      choose(
        [
          0.08,
          0.10,
          0.12,
          0.15,
          0.18
        ]
      );


    const omega =
      Math.sqrt(
        spring /
        mass
      );


    const period =
      2 *
      Math.PI /
      omega;


    const vmax =
      omega *
      amplitude;


    const pendulumLength =
      choose(
        [
          0.55,
          0.70,
          0.85,
          1.00,
          1.20
        ]
      );


    const pendulumPeriod =
      2 *
      Math.PI *
      Math.sqrt(
        pendulumLength /
        9.81
      );


    return [

      {
        marks: 6,

        question: `
          A ${mass} kg block is attached to an ideal horizontal
          spring of spring constant ${spring} N m⁻¹.

          Starting from Newton's second law and Hooke's law,
          derive the equation of motion and determine
          the angular frequency and period.
        `,

        scheme: `
          <strong>1.</strong>
          Hooke's law:

          F = −kx.

          <br><br>

          <strong>2.</strong>
          Newton II:

          mx¨ = −kx.

          <br><br>

          <strong>3.</strong>
          Rearrange:

          x¨ + (k/m)x = 0.

          <br><br>

          Compare with

          x¨ + ω²x = 0,

          so

          ω = √(k/m).

          <br><br>

          ω =
          √(${spring}/${mass})
          =
          <strong>
            ${fmt(omega, 3)}
            rad s⁻¹
          </strong>.

          <br><br>

          T = 2π/ω
          =
          <strong>
            ${fmt(period, 3)}
            s
          </strong>.

          <br><br>

          The minus sign is essential because
          the spring force is restoring.
        `
      },


      {
        marks: 5,

        question: `
          The oscillator above has amplitude ${amplitude} m.

          Calculate its maximum speed and state
          where in the cycle this occurs.
        `,

        scheme: `
          For

          v =
          −ωA sin(ωt+φ),

          the largest possible magnitude occurs when
          |sin(...)|=1.

          <br><br>

          Therefore

          vmax = ωA

          =
          ${fmt(omega, 3)}
          ×
          ${amplitude}

          =
          <strong>
            ${fmt(vmax, 3)}
            m s⁻¹
          </strong>.

          <br><br>

          Maximum speed occurs at equilibrium,
          x=0.
        `
      },


      {
        marks: 6,

        question: `
          Derive the relation

          v² = ω²(A²−x²)

          without explicitly solving for time.

          Explain the physical meaning of the relation
          at x=0 and x=±A.
        `,

        scheme: `
          Use

          x=Acosθ

          and

          v=−ωAsinθ.

          <br><br>

          Then

          x²/A² = cos²θ

          and

          v²/(ω²A²)=sin²θ.

          <br><br>

          Add them and use

          sin²θ+cos²θ=1.

          <br><br>

          This gives

          v²=ω²(A²−x²).

          <br><br>

          At x=0:

          |v|=ωA,
          so speed is maximum.

          <br><br>

          At x=±A:

          v=0,
          so the oscillator is at a turning point.
        `
      },


      {
        marks: 7,

        question: `
          Derive the kinetic energy of a spring oscillator
          as a function of position.

          Explain why maximum acceleration and zero speed
          can occur simultaneously.
        `,

        scheme: `
          Total energy:

          E=½kA².

          <br><br>

          Potential energy:

          U=½kx².

          <br><br>

          Therefore

          K=E−U

          =½k(A²−x²).

          <br><br>

          At x=±A:

          K=0,

          therefore v=0.

          <br><br>

          But

          |a|=ω²|x|

          is then largest.

          <br><br>

          Zero velocity does not imply zero acceleration.
        `
      },


      {
        marks: 6,

        question: `
          A simple pendulum has length
          ${pendulumLength} m.

          Derive its small-angle SHM equation
          and calculate its approximate period
          near Earth's surface.
        `,

        scheme: `
          Tangential equation:

          mLθ¨ = −mg sinθ.

          <br><br>

          For a small angle in radians:

          sinθ≈θ.

          <br><br>

          Hence:

          Lθ¨≈−gθ.

          <br><br>

          θ¨+(g/L)θ=0.

          <br><br>

          Therefore

          ω=√(g/L)

          and

          T=2π√(L/g).

          <br><br>

          T =
          <strong>
            ${fmt(
              pendulumPeriod,
              3
            )}
            s
          </strong>.
        `
      },


      {
        marks: 6,

        question: `
          Explain why a pendulum at large angular amplitude
          is not an exact simple harmonic oscillator.

          Refer explicitly to the restoring term.
        `,

        scheme: `
          The exact restoring term is proportional to

          sinθ,

          not θ.

          <br><br>

          SHM requires the restoring acceleration
          to be directly proportional to displacement.

          <br><br>

          Only for sufficiently small angles,
          measured in radians,
          can

          sinθ≈θ

          be used.

          <br><br>

          Large-amplitude pendulum motion is therefore nonlinear.
        `
      },


      {
        marks: 7,

        question: `
          Consider

          mx¨ + bx˙ + kx = 0.

          Explain the physical role of each term and
          distinguish underdamped, critically damped
          and overdamped motion.
        `,

        scheme: `
          mx¨:
          inertial response.

          <br><br>

          bx˙:
          dissipative force proportional to velocity.

          <br><br>

          kx:
          restoring contribution.

          <br><br>

          Underdamped:

          b < 2√mk,

          oscillatory decay.

          <br><br>

          Critical:

          b = 2√mk,

          fastest non-oscillatory return.

          <br><br>

          Overdamped:

          b > 2√mk,

          slower non-oscillatory return.
        `
      },


      {
        marks: 7,

        question: `
          Explain resonance in terms of energy transfer.

          Describe how increasing damping changes
          the resonance curve.
        `,

        scheme: `
          A periodic driver performs work on the oscillator.

          <br><br>

          Near the natural frequency,
          the phase relation allows energy supplied on
          successive cycles to accumulate efficiently.

          <br><br>

          Damping removes energy from the oscillator.

          <br><br>

          Increasing damping makes the resonance peak:

          <br>

          • lower

          <br>

          • broader

          <br><br>

          The steady-state motion follows
          the driving frequency.
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

    const amplitude =
      choose(
        [
          2,
          3,
          4
        ]
      );

    const mass =
      choose(
        [
          1,
          2,
          3
        ]
      );

    const spring =
      mass *
      omega **
      2;


    return [

      {
        marks: 6,

        question: `
          Verify directly that

          x(t) =
          ${amplitude}
          cos(${omega}t)

          satisfies

          x¨ +
          ${omega ** 2}x
          = 0.
        `,

        scheme: `
          Differentiate once:

          <br>

          x˙ =
          −${amplitude * omega}
          sin(${omega}t).

          <br><br>

          Differentiate again:

          <br>

          x¨ =
          −${amplitude * omega ** 2}
          cos(${omega}t).

          <br><br>

          Meanwhile:

          ${omega ** 2}x
          =
          ${amplitude * omega ** 2}
          cos(${omega}t).

          <br><br>

          Therefore:

          x¨ +
          ${omega ** 2}x
          = 0.
        `
      },


      {
        marks: 7,

        question: `
          Solve

          x¨ +
          ${omega ** 2}x
          = 0

          using the trial solution

          x=e^{rt}.
        `,

        scheme: `
          Assume:

          x=e^{rt}.

          <br><br>

          Then:

          x¨=r²e^{rt}.

          <br><br>

          Substitute:

          r²e^{rt}
          +
          ${omega ** 2}e^{rt}
          =0.

          <br><br>

          Since e^{rt}≠0:

          r²+
          ${omega ** 2}
          =0.

          <br><br>

          Therefore:

          r=±${omega}i.

          <br><br>

          Hence the real general solution is:

          x =
          C cos(${omega}t)
          +
          D sin(${omega}t).
        `
      },


      {
        marks: 7,

        question: `
          Show how

          x =
          Ccos(ωt)
          +
          Dsin(ωt)

          can be rewritten as

          x =
          Acos(ωt+φ).

          Obtain A in terms of C and D.
        `,

        scheme: `
          Expand:

          <br><br>

          Acos(ωt+φ)

          =
          Acosφ cosωt
          −
          Asinφ sinωt.

          <br><br>

          Compare coefficients:

          C=Acosφ,

          D=−Asinφ.

          <br><br>

          Therefore:

          C²+D²=A².

          <br><br>

          So:

          <strong>
            A=√(C²+D²)
          </strong>.

          <br><br>

          A consistent phase is

          φ=atan2(−D,C).
        `
      },


      {
        marks: 6,

        question: `
          Starting from

          sin²θ + cos²θ = 1,

          derive

          v²=ω²(A²−x²)

          for

          x=Acosθ

          and

          v=−ωAsinθ.
        `,

        scheme: `
          cosθ=x/A.

          <br>

          sinθ=−v/(ωA).

          <br><br>

          Square and add:

          x²/A²
          +
          v²/(ω²A²)
          =1.

          <br><br>

          Multiply through by ω²A²:

          ω²x²+v²=ω²A².

          <br><br>

          Therefore:

          <strong>
            v²=ω²(A²−x²)
          </strong>.
        `
      },


      {
        marks: 7,

        question: `
          For m=${mass} kg and
          k=${spring} N m⁻¹,

          calculate the natural angular frequency.

          Then use dimensional analysis to verify that
          √(k/m) has dimensions of inverse time.
        `,

        scheme: `
          ω=√(k/m)

          =
          √(${spring}/${mass})

          =
          <strong>
            ${omega}
            rad s⁻¹
          </strong>.

          <br><br>

          Dimensions:

          [k]
          =
          force / length.

          <br><br>

          [k]
          =
          (MLT⁻²)/L

          =
          MT⁻².

          <br><br>

          Therefore:

          [k/m]=T⁻².

          <br><br>

          Hence:

          [√(k/m)]
          =
          T⁻¹.
        `
      },


      {
        marks: 7,

        question: `
          Use the Taylor expansion of sinθ
          to explain why

          sinθ≈θ

          becomes progressively less accurate
          as |θ| increases.
        `,

        scheme: `
          In radians:

          <br><br>

          sinθ
          =
          θ
          −
          θ³/3!
          +
          θ⁵/5!
          − ...

          <br><br>

          The small-angle approximation keeps only
          the linear term θ.

          <br><br>

          When |θ| is small,
          θ³, θ⁵, ... are much smaller than θ.

          <br><br>

          As |θ| increases,
          the nonlinear terms become significant.

          Therefore sinθ is no longer well approximated by θ.
        `
      },


      {
        marks: 7,

        question: `
          Starting from

          E =
          ½mv²
          +
          ½kx²,

          differentiate with respect to time
          and prove that dE/dt=0
          for ideal SHM.
        `,

        scheme: `
          Differentiate:

          <br><br>

          dE/dt
          =
          mv(dv/dt)
          +
          kx(dx/dt).

          <br><br>

          Use

          dv/dt=a

          and

          dx/dt=v.

          <br><br>

          Hence:

          dE/dt
          =
          mav
          +
          kxv.

          <br><br>

          Factorise:

          dE/dt
          =
          v(ma+kx).

          <br><br>

          For ideal SHM:

          ma=−kx.

          <br><br>

          Therefore:

          <strong>
            dE/dt=0
          </strong>.
        `
      },


      {
        marks: 8,

        question: `
          For

          mx¨+bx˙+kx=0,

          substitute

          x=e^{rt}

          and derive the characteristic equation.

          Explain how its discriminant separates
          the three damping regimes.
        `,

        scheme: `
          Substitute:

          x=e^{rt}.

          <br><br>

          Then:

          x˙=re^{rt},

          x¨=r²e^{rt}.

          <br><br>

          Therefore:

          mr²e^{rt}
          +
          bre^{rt}
          +
          ke^{rt}
          =0.

          <br><br>

          Divide by e^{rt}:

          <strong>
            mr²+br+k=0
          </strong>.

          <br><br>

          Hence:

          r=
          [−b±√(b²−4mk)]/(2m).

          <br><br>

          If b²−4mk&lt;0:

          complex roots → underdamped.

          <br><br>

          If b²−4mk=0:

          repeated real root → critical damping.

          <br><br>

          If b²−4mk&gt;0:

          two real negative roots → overdamped.
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
        ?
        physicsPaper()
        :
        mathsPaper();


    const totalMarks =
      questions.reduce(
        (
          sum,
          question
        ) =>
          sum +
          question.marks,
        0
      );


    if (
      $("paperTitle")
    ) {
      $("paperTitle")
        .textContent =
        currentPaper ===
        "physics"
          ?
          "Physics Paper — Oscillations"
          :
          "Mathematical Methods Paper — Oscillations";
    }


    if (
      $("paperInfo")
    ) {
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
                type="button"
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

              if (
                !scheme
              ) {
                return;
              }

              scheme.classList.toggle(
                "show"
              );

              button.textContent =
                scheme.classList
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
                tab => {
                  tab.classList.remove(
                    "active"
                  );

                  tab.classList.remove(
                    "primary"
                  );
                }
              );


            button.classList.add(
              "active"
            );

            button.classList.add(
              "primary"
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



  /* =========================================================
     PAPER TIMER
  ========================================================= */

  function renderPaperTimer() {
    const minutes =
      Math.floor(
        paperTimerSeconds /
        60
      );

    const seconds =
      paperTimerSeconds %
      60;


    if (
      $("paperTimer")
    ) {
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
      timerInterval
    );

    timerInterval =
      null;

    paperTimerSeconds =
      60 *
      60;


    if (
      $("startTimer")
    ) {
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
            timerInterval
          );

          timerInterval =
            null;

          $("startTimer")
            .textContent =
            "Resume timer";

          return;
        }


        if (
          paperTimerSeconds <=
          0
        ) {
          resetPaperTimer();
        }


        paperTimerRunning =
          true;


        $("startTimer")
          .textContent =
          "Pause timer";


        timerInterval =
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
                  timerInterval
                );

                timerInterval =
                  null;

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
     QUICK PRACTICE
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
      type:
        "numeric",

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
      type:
        "mcq",

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
            `Which acceleration law represents SHM with ω²=${coefficient} s⁻²?`,

          options: [
            `a=+${coefficient}x`,
            `a=−${coefficient}x`,
            `a=−${coefficient}x²`,
            `a=${coefficient}/x`
          ],

          answer: 1,

          hint:
            "Acceleration must be proportional to displacement and directed toward equilibrium.",

          solution:
            `SHM requires a=−ω²x. Therefore a=−${coefficient}x.`
        });
      },


      () => {
        const T =
          choose(
            [
              0.50,
              0.80,
              1.00,
              1.25,
              2.00,
              2.50
            ]
          );


        return numericQuestion({

          topic:
            "Frequency",

          question:
            `An oscillator has period T=${T} s. Find f.`,

          answer:
            1 /
            T,

          tolerance:
            0.01,

          unit:
            "Hz",

          hint:
            "Frequency is the number of cycles per second.",

          solution:
            `f=1/T=1/${T}=${fmt(1/T, 3)} Hz.`
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
            `An oscillator has f=${f} Hz. Find ω.`,

          answer:
            omega,

          tolerance:
            0.03,

          unit:
            "rad/s",

          hint:
            "One full cycle contains 2π radians.",

          solution:
            `ω=2πf=2π(${f})=${fmt(omega, 3)} rad/s.`
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
            `For x=${A}cos(${omega}t+0.30) m, determine the maximum speed.`,

          answer:
            omega *
            A,

          tolerance:
            0.01,

          unit:
            "m/s",

          hint:
            "Differentiate x, then ask for the largest possible magnitude of the sine factor.",

          solution:
            `v=−ωA sin(...), so vmax=ωA=${omega}×${A}=${fmt(omega*A, 3)} m/s.`
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


        const acceleration =
          -(
            omega **
            2
          ) *
          x;


        return numericQuestion({

          topic:
            "Acceleration",

          question:
            `At one instant x=${x} m and ω=${omega} rad/s. Find a.`,

          answer:
            acceleration,

          tolerance:
            0.02,

          unit:
            "m/s²",

          hint:
            "Use the defining SHM relation.",

          solution:
            `a=−ω²x=−(${omega})²(${x})=${fmt(acceleration, 3)} m/s².`
        });
      },


      () =>
        multipleChoice({

          topic:
            "Phase",

          question:
            "At x=+A, which statement is correct?",

          options: [
            "v is maximum and a=0",
            "v=0 and acceleration points toward negative x",
            "v=0 and acceleration points toward positive x",
            "both v and a are zero"
          ],

          answer: 1,

          hint:
            "A turning point has zero instantaneous speed but maximum restoring force.",

          solution:
            "At x=+A, v=0 and a=−ω²A. Acceleration therefore points toward equilibrium."
        })

    ],


    springs: [

      () => {
        const m =
          choose(
            [
              0.25,
              0.40,
              0.50,
              0.80,
              1.00
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
            k /
            m
          );


        return numericQuestion({

          topic:
            "Mass-spring",

          question:
            `A ${m} kg mass is attached to a spring with k=${k} N/m. Find ω.`,

          answer:
            omega,

          tolerance:
            0.02,

          unit:
            "rad/s",

          hint:
            "Compare mx¨=−kx with x¨=−ω²x.",

          solution:
            `ω=√(k/m)=√(${k}/${m})=${fmt(omega, 3)} rad/s.`
        });
      },


      () => {
        const m =
          choose(
            [
              0.4,
              0.6,
              0.8,
              1.0,
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
            m /
            k
          );


        return numericQuestion({

          topic:
            "Mass-spring",

          question:
            `For m=${m} kg and k=${k} N/m, calculate the period.`,

          answer:
            T,

          tolerance:
            0.015,

          unit:
            "s",

          hint:
            "Use T=2π√(m/k).",

          solution:
            `T=2π√(${m}/${k})=${fmt(T, 3)} s.`
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


        const energy =
          0.5 *
          k *
          A **
          2;


        return numericQuestion({

          topic:
            "Energy",

          question:
            `A spring oscillator has k=${k} N/m and amplitude A=${A} m. Find its total mechanical energy.`,

          answer:
            energy,

          tolerance:
            0.005,

          unit:
            "J",

          hint:
            "Evaluate the energy at a turning point, where v=0.",

          solution:
            `E=½kA²=½(${k})(${A})²=${fmt(energy, 4)} J.`
        });
      },


      () => {
        const ratio =
          choose(
            [
              0,
              0.25,
              0.50,
              0.60,
              0.80
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
            `At an instant x/A=${ratio}. What fraction K/E of the total energy is kinetic?`,

          answer:
            kinetic,

          tolerance:
            0.01,

          unit:
            "",

          hint:
            "Start with U/E=x²/A².",

          solution:
            `K/E=1−x²/A²=1−(${ratio})²=${fmt(kinetic, 3)}.`
        });
      }

    ],


    pendulum: [

      () => {
        const L =
          choose(
            [
              0.40,
              0.60,
              0.80,
              1.00,
              1.20
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
            "Use T=2π√(L/g).",

          solution:
            `T=2π√(${L}/9.81)=${fmt(T, 3)} s.`
        });
      },


      () =>
        multipleChoice({

          topic:
            "Pendulum",

          question:
            "Why does the SHM approximation become inaccurate at large pendulum amplitudes?",

          options: [
            "Gravity stops acting",
            "Mass no longer cancels",
            "sinθ is no longer well approximated by θ",
            "Angular frequency becomes zero"
          ],

          answer: 2,

          hint:
            "Compare the exact restoring term with the linear approximation.",

          solution:
            "The exact restoring term is proportional to sinθ. SHM emerges only after using sinθ≈θ for small θ in radians."
        })

    ],


    damping: [

      () => {
        const m =
          choose(
            [
              0.5,
              1.0,
              1.5,
              2.0
            ]
          );


        const b =
          choose(
            [
              0.2,
              0.4,
              0.8,
              1.0
            ]
          );


        const halfLife =
          2 *
          m *
          Math.log(2) /
          b;


        return numericQuestion({

          topic:
            "Damping",

          question:
            `For A=A₀e^(−bt/2m), with m=${m} kg and b=${b} kg/s, calculate the amplitude half-life.`,

          answer:
            halfLife,

          tolerance:
            0.03,

          unit:
            "s",

          hint:
            "Set A/A₀=1/2 and solve the exponential equation.",

          solution:
            `t½=2m ln2/b=${fmt(halfLife, 3)} s.`
        });
      },


      () =>
        multipleChoice({

          topic:
            "Resonance",

          question:
            "What generally happens to a resonance curve when damping increases?",

          options: [
            "It becomes taller and narrower",
            "It becomes lower and broader",
            "It shifts to infinite frequency",
            "Nothing changes"
          ],

          answer: 1,

          hint:
            "Greater damping removes more energy each cycle.",

          solution:
            "Greater damping suppresses the maximum response and broadens the resonance peak."
        }),


      () =>
        multipleChoice({

          topic:
            "Driven motion",

          question:
            "After transient motion has decayed, what frequency does a forced oscillator follow?",

          options: [
            "Only its natural frequency",
            "Zero frequency",
            "The driving frequency",
            "Twice its natural frequency"
          ],

          answer: 2,

          hint:
            "Think about the steady-state particular solution.",

          solution:
            "The steady-state oscillator moves at the driving frequency. Its natural frequency determines how strongly it responds."
        })

    ]

  };



  let currentQuickQuestion =
    null;


  let quickQuestionAnswered =
    false;


  let quickScore =
    loadJSON(
      "oscillation-grove-score",
      {
        correct: 0,
        total: 0
      }
    );



  function selectedPracticePool() {
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



  function updateQuickScore() {
    if (
      $("scoreCorrect")
    ) {
      $("scoreCorrect")
        .textContent =
        quickScore.correct;
    }


    if (
      $("scoreTotal")
    ) {
      $("scoreTotal")
        .textContent =
        quickScore.total;
    }


    saveJSON(
      "oscillation-grove-score",
      quickScore
    );
  }



  function newQuickQuestion() {
    const pool =
      selectedPracticePool();


    currentQuickQuestion =
      choose(
        pool
      )();


    quickQuestionAnswered =
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
      currentQuickQuestion.type ===
      "numeric"
    ) {
      answerHTML = `

        <div class="numeric-answer">

          <label>

            Your answer
            ${
              currentQuickQuestion.unit
                ?
                `(${currentQuickQuestion.unit})`
                :
                ""
            }

            <input
              id="practiceNumeric"
              type="number"
              step="any"
              inputmode="decimal"
            />

          </label>

        </div>
      `;
    } else {
      answerHTML = `

        <div class="answer-options">

          ${
            currentQuickQuestion
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
                    />

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
        ${currentQuickQuestion.topic}
      </p>

      <h3>
        ${currentQuickQuestion.question}
      </h3>

      ${answerHTML}
    `;


    if (
      feedback
    ) {
      feedback.className =
        "feedback";

      feedback.innerHTML =
        "";
    }
  }



  function showPracticeHint() {
    if (
      !currentQuickQuestion
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

      ${currentQuickQuestion.hint}
    `;
  }



  function checkQuickAnswer() {
    if (
      !currentQuickQuestion
    ) {
      return;
    }


    let correct =
      false;

    let provided =
      false;


    if (
      currentQuickQuestion.type ===
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


        provided =
          Number.isFinite(
            value
          );


        const tolerance =
          Math.max(
            currentQuickQuestion.tolerance,

            Math.abs(
              currentQuickQuestion.answer
            ) *
            0.005
          );


        correct =
          provided &&
          Math.abs(
            value -
            currentQuickQuestion.answer
          ) <=
          tolerance;
      }
    } else {
      const selected =
        document.querySelector(
          'input[name="practiceChoice"]:checked'
        );


      if (
        selected
      ) {
        provided =
          true;

        correct =
          Number(
            selected.value
          ) ===
          currentQuickQuestion.answer;
      }
    }


    const feedback =
      $("practiceFeedback");

    if (!feedback) {
      return;
    }


    if (
      !provided
    ) {
      feedback.className =
        "feedback incorrect";

      feedback.textContent =
        "Enter or select an answer first.";

      return;
    }


    if (
      !quickQuestionAnswered
    ) {
      quickScore.total++;


      if (
        correct
      ) {
        quickScore.correct++;
      }


      quickQuestionAnswered =
        true;


      updateQuickScore();
    }


    feedback.className =
      `feedback ${
        correct
          ?
          "correct"
          :
          "incorrect"
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


      ${currentQuickQuestion.solution}


      <br><br>


      <em>
        Retrieval step:
        look away from the explanation
        and say the method aloud
        in your own words before continuing.
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


  updateQuickScore();

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
              const content =
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
                !content.includes(
                  query
                )
              );
            }
          );
      }
    );



  /* =========================================================
     CHECKLIST SUPPORT
     Safe even if no checklist exists in this HTML version.
  ========================================================= */

  const checklist =
    $$(
      ".check-grid input[type='checkbox']"
    );


  if (
    checklist.length
  ) {
    const saved =
      loadJSON(
        "oscillation-grove-checklist",
        []
      );


    checklist.forEach(
      (
        box,
        index
      ) => {
        box.checked =
          Boolean(
            saved[index]
          );


        box.addEventListener(
          "change",
          () => {
            saveJSON(
              "oscillation-grove-checklist",

              checklist.map(
                item =>
                  item.checked
              )
            );
          }
        );
      }
    );
  }



  /* =========================================================
     REDRAW AFTER RESIZE
  ========================================================= */

  let resizeTimer =
    null;


  window.addEventListener(
    "resize",
    () => {
      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          () => {
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
          },
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
          motionState.last
        ) /
        1000
      );


    motionState.last =
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
            .max ||
          12
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


    drawHero(
      now
    );


    updatePendulumLab(
      now /
      1000
    );


    requestAnimationFrame(
      animate
    );
  }



  /* =========================================================
     INITIALISE EVERYTHING
  ========================================================= */

  updateMotionLab();

  updateEnergyLab();

  updatePendulumLab(0);

  updateDampingLab();

  updateResonanceLab();


  requestAnimationFrame(
    now => {
      motionState.last =
        now;

      requestAnimationFrame(
        animate
      );
    }
  );

})();
