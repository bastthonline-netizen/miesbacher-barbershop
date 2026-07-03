/* Miesbacher Barbershop, Probewebsite
   Motion: Lenis (Smooth Scroll) + GSAP ScrollTrigger.
   Alles hinter prefers-reduced-motion; ohne JS bleibt die Seite voll nutzbar. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header-Zustand braucht kein GSAP */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScrollHeader();

  if (reduceMotion || typeof gsap === "undefined") {
    /* Fallback: statische Seite, Video der Cinema-Sektion läuft normal */
    var cinemaVideo = document.querySelector(".cinema__media video");
    if (cinemaVideo) cinemaVideo.play().catch(function () {});
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis Smooth Scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", function () {
      ScrollTrigger.update();
      onScrollHeader();
    });
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* Anker-Links durch Lenis routen */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -88 });
      });
    });
  } else {
    ScrollTrigger.create({ onUpdate: onScrollHeader });
  }

  /* ---------- Hero: Zeilen-Reveal beim Laden ---------- */
  gsap.from(".hero .line", {
    yPercent: 110,
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.12,
    delay: 0.15,
  });
  gsap.from(".hero__sub, .hero__ctas", {
    opacity: 0,
    y: 24,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.1,
    delay: 0.55,
  });

  /* ---------- Scroll-Reveals (Sektionen) ---------- */
  /* .service wird unten separat als Batch gestaggert */
  gsap.utils.toArray(".reveal:not(.service)").forEach(function (el) {
    gsap.from(el, {
      opacity: 0,
      y: 36,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
  });

  /* ---------- Cinema: Video wächst beim Scrollen auf Vollbild ---------- */
  var cinema = document.querySelector(".cinema");
  var cinemaMedia = document.querySelector(".cinema__media");
  var cinemaTitle = document.querySelector(".cinema__title");
  var video = cinemaMedia ? cinemaMedia.querySelector("video") : null;

  if (cinema && cinemaMedia && video) {
    gsap.set(cinemaMedia, { scale: 0.42, borderRadius: 8 });

    gsap.timeline({
      scrollTrigger: {
        trigger: cinema,
        start: "top top",
        end: "+=140%",
        pin: ".cinema__pin",
        scrub: 1,
        invalidateOnRefresh: true,
        onEnter: function () { video.play().catch(function () {}); },
        onLeave: function () { video.pause(); },
        onEnterBack: function () { video.play().catch(function () {}); },
        onLeaveBack: function () { video.pause(); },
      },
    })
      .to(cinemaMedia, { scale: 1, borderRadius: 0, ease: "none" }, 0)
      .to(cinemaTitle, { opacity: 0, yPercent: -60, ease: "none" }, 0.55);
  }

  /* ---------- Positionen neu messen, sobald Fonts/Medien da sind ----------
     (Remote-Videos und Webfonts verschieben das Layout nach der ersten Messung) */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  document.querySelectorAll("video").forEach(function (v) {
    v.addEventListener("loadedmetadata", function () { ScrollTrigger.refresh(); }, { once: true });
  });

  /* ---------- Service-Zeilen: leichter Stagger ---------- */
  ScrollTrigger.batch(".service", {
    start: "top 88%",
    once: true,
    onEnter: function (items) {
      gsap.from(items, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      });
    },
  });
})();
