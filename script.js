document.addEventListener("DOMContentLoaded", () => {
  // === Carrossel Automático + Manual ===
  const slides = document.querySelectorAll(".slide");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  let index = 0;
  let interval = setInterval(nextSlide, 6000);

  function showSlide(i) {
    slides.forEach((s) => s.classList.remove("active"));
    slides[i].classList.add("active");
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  }

  next.addEventListener("click", () => {
    nextSlide();
    resetTimer();
  });

  prev.addEventListener("click", () => {
    prevSlide();
    resetTimer();
  });

  function resetTimer() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 6000);
  }

  // === Scroll Animation ===
  const fadeElements = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  fadeElements.forEach((el) => observer.observe(el));

  // === Mouse Animation ===
  const cursor = document.createElement("div");
  cursor.classList.add("cursor");
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
});

// Estilo do cursor via JS
const style = document.createElement("style");
style.innerHTML = `
.cursor {
  position: fixed;
  width: 18px;
  height: 18px;
  border: 2px solid #33ff00ff;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: all 0.1s ease;
  z-index: 9999;
  mix-blend-mode: difference;
}`;
document.head.appendChild(style);
