const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  });
});

const dateInput = document.querySelector('#appointment-date');
const timeSelect = document.querySelector('#appointment-time');
const bookingForm = document.querySelector('#booking-form');

const localToday = new Date();
localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
dateInput.min = localToday.toISOString().slice(0, 10);

// Suggested request times; the shop confirms actual availability on WhatsApp.
for (let minutes = 9 * 60; minutes <= 20 * 60; minutes += 30) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  const value = `${hour}:${minute}`;
  timeSelect.add(new Option(value, value));
}

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#customer-name').value.trim();
  const service = document.querySelector('#service-choice').value;
  const dateValue = dateInput.value;
  const date = new Date(`${dateValue}T12:00:00`);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date);
  const time = timeSelect.value;
  const message = [
    'Olá! Gostaria de solicitar um agendamento na Power Black Barber Shop.',
    `Nome: ${name}`,
    `Serviço: ${service}`,
    `Data: ${formattedDate}`,
    `Horário desejado: ${time}`,
    'Aguardo a confirmação. Obrigado!'
  ].join('\n');
  window.location.href = `https://wa.me/5586995412466?text=${encodeURIComponent(message)}`;
});
