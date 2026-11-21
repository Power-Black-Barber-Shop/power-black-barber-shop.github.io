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

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().slice(0, 10);

function refreshAvailableTimes() {
  const previousSelection = timeSelect.value;
  while (timeSelect.options.length > 1) timeSelect.remove(1);
  timeSelect.value = '';

  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const isToday = !dateInput.value || dateInput.value === localDate;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Suggested request times every 50 minutes; past times today are omitted.
  for (let minutes = 9 * 60; minutes <= 20 * 60; minutes += 50) {
    if (isToday && minutes <= currentMinutes) continue;
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');
    const value = `${hour}:${minute}`;
    timeSelect.add(new Option(value, value));
  }

  if ([...timeSelect.options].some((option) => option.value === previousSelection)) {
    timeSelect.value = previousSelection;
  }
}

dateInput.addEventListener('change', refreshAvailableTimes);
timeSelect.addEventListener('focus', refreshAvailableTimes);
refreshAvailableTimes();

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
  refreshAvailableTimes();
  if (!timeSelect.value) {
    serviceFeedback.textContent = 'Escolha um horário disponível para continuar.';
    timeSelect.focus();
    return;
  }
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
    '💈 Olá! Tudo bem? Gostaria de agendar meu horário na Power Black Barber Shop. ✂️',
    `👤 Nome: ${name}`,
    `💈 Serviços: ${serviceList}`,
    `💰 Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`,
    `📅 Data: ${formattedDate}`,
    `⏰ Horário desejado: ${time}`,
    '✅ Por favor, confirme se esse horário está disponível. Se não estiver, pode me sugerir outro? 😊',
    '🙏 Obrigado!'
  ].join('\n');
  window.location.href = `https://wa.me/5586995412466?text=${encodeURIComponent(message)}`;
});
