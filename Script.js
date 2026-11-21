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
const serviceInputs = [...document.querySelectorAll('input[name="services"]')];
const totalDisplay = document.querySelector('#booking-total');
const serviceFeedback = document.querySelector('#service-feedback');

const localToday = new Date();
localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
dateInput.min = localToday.toISOString().slice(0, 10);

// Suggested request times every 50 minutes; the shop confirms actual availability on WhatsApp.
for (let minutes = 9 * 60; minutes <= 20 * 60; minutes += 50) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  const value = `${hour}:${minute}`;
  timeSelect.add(new Option(value, value));
}

function selectedServices() {
  return serviceInputs.filter((input) => input.checked);
}

function updateServiceTotal() {
  const total = selectedServices().reduce((sum, input) => sum + Number(input.dataset.price), 0);
  totalDisplay.textContent = `Total dos serviços: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`;
  serviceFeedback.textContent = '';
}

serviceInputs.forEach((input) => input.addEventListener('change', updateServiceTotal));

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const services = selectedServices();
  if (services.length === 0) {
    serviceFeedback.textContent = 'Escolha pelo menos um serviço para continuar.';
    serviceInputs[0].focus();
    return;
  }
  const name = document.querySelector('#customer-name').value.trim();
  const serviceList = services.map((input) => `${input.value} — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(input.dataset.price))}`).join(', ');
  const total = services.reduce((sum, input) => sum + Number(input.dataset.price), 0);
  const dateValue = dateInput.value;
  const date = new Date(`${dateValue}T12:00:00`);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date);
  const time = timeSelect.value;
  const message = [
    'Olá! Gostaria de solicitar um agendamento na Power Black Barber Shop.',
    `Nome: ${name}`,
    `Serviços: ${serviceList}`,
    `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`,
    `Data: ${formattedDate}`,
    `Horário desejado: ${time}`,
    'Aguardo a confirmação. Obrigado!'
  ].join('\n');
  window.location.href = `https://wa.me/5586995412466?text=${encodeURIComponent(message)}`;
});
