const languageButtons = document.querySelectorAll(".language-button");
const translatableElements = document.querySelectorAll("[data-es][data-en]");
const menuToggle = document.querySelector(".menu-toggle");
const bookingForm = document.querySelector("#booking-form");
const bookingDate = document.querySelector("#booking-date");
const bookingService = document.querySelector("#booking-service");
const formStatus = document.querySelector("#form-status");
const bookingSteps = Array.from(document.querySelectorAll(".booking-step"));
let currentBookingStep = 0;

let currentLanguage = "es";

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;

  translatableElements.forEach((element) => {
    const translation = element.dataset[language];
    if (translation !== undefined) element.innerHTML = translation;
  });

  document.querySelectorAll("[data-placeholder-es][data-placeholder-en]").forEach((input) => {
    input.placeholder = input.dataset[`placeholder${language.toUpperCase()}`];
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  document.body.classList.toggle("menu-open", !isExpanded);
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");
bookingDate.min = localToday;

function showBookingStep(step) {
  currentBookingStep = step;
  bookingSteps.forEach((element, index) => {
    element.hidden = index !== step;
  });
  document.querySelectorAll(".progress-step").forEach((element, index) => {
    element.classList.toggle("is-active", index === step);
    element.classList.toggle("is-complete", index < step);
    if (index === step) element.setAttribute("aria-current", "step");
    else element.removeAttribute("aria-current");
  });
}

bookingForm.addEventListener("click", (event) => {
  const nextButton = event.target.closest("[data-next]");
  const previousButton = event.target.closest("[data-prev]");

  if (nextButton) {
    const invalidField = bookingSteps[currentBookingStep].querySelector(":invalid");
    if (invalidField) {
      invalidField.reportValidity();
      return;
    }
    showBookingStep(Math.min(currentBookingStep + 1, bookingSteps.length - 1));
  } else if (previousButton) {
    showBookingStep(Math.max(currentBookingStep - 1, 0));
  }
});

document.querySelectorAll(".service-add").forEach((button) => {
  button.addEventListener("click", () => {
    const serviceName = button.dataset[`service${currentLanguage === "en" ? "En" : ""}`];
    const matchingOption = Array.from(bookingService.options).find(
      (option) => option.value === button.dataset.service,
    );
    if (matchingOption) bookingService.value = matchingOption.value;
    showBookingStep(0);
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    bookingService.focus({ preventScroll: true });
    formStatus.textContent = currentLanguage === "es"
      ? `${serviceName} seleccionado. Completa tus datos para solicitar la cita.`
      : `${serviceName} selected. Fill in your details to request the appointment.`;
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  const formData = new FormData(bookingForm);
  const date = new Date(`${formData.get("date")}T12:00:00`);
  const serviceLabel = bookingService.selectedOptions[0].dataset[currentLanguage]
    || formData.get("service");
  const barberLabel = document.querySelector("#booking-barber").selectedOptions[0].dataset[currentLanguage]
    || formData.get("barber");
  const formattedDate = new Intl.DateTimeFormat(
    currentLanguage === "es" ? "es-ES" : "en-GB",
    { dateStyle: "long" },
  ).format(date);
  const message = currentLanguage === "es"
    ? `Hola, quiero solicitar una cita en Legendarios Barber Shop.\n\nServicio: ${serviceLabel}\nPreferencia de barbero: ${barberLabel}\nDía: ${formattedDate}\nHora preferida: ${formData.get("time")}\nNombre: ${formData.get("name")}\nContacto: ${formData.get("contact")}\n\nEntiendo que la cita queda pendiente de confirmación.`
    : `Hi, I’d like to request an appointment at Legendarios Barber Shop.\n\nService: ${serviceLabel}\nBarber preference: ${barberLabel}\nDate: ${formattedDate}\nPreferred time: ${formData.get("time")}\nName: ${formData.get("name")}\nContact: ${formData.get("contact")}\n\nI understand the appointment is pending confirmation.`;

  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  formStatus.textContent = currentLanguage === "es"
    ? "Se ha preparado tu mensaje en WhatsApp. Envíalo para que el equipo pueda confirmar la cita."
    : "Your WhatsApp message is ready. Send it so the team can confirm your appointment.";
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
