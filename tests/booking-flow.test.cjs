const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'Script.js'), 'utf8');

function createPage() {
  const listeners = new Map();

  class Element {
    constructor(value = '') {
      this.value = value;
      this.options = [];
      this.dataset = {};
      this.checked = false;
      this.textContent = '';
      this.attributes = {};
      this.classList = { toggle: () => false, remove: () => {} };
    }

    addEventListener(name, callback) {
      const callbacks = listeners.get(this) || {};
      callbacks[name] = callback;
      listeners.set(this, callbacks);
    }

    dispatch(name, event = {}) {
      listeners.get(this)?.[name]?.(event);
    }

    setAttribute(name, value) {
      this.attributes[name] = value;
    }

    querySelectorAll() {
      return [];
    }

    add(option) {
      this.options.push(option);
    }

    remove(index) {
      this.options.splice(index, 1);
    }
  }

  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : ['2026-05-21T12:00:00']))
    }

    getTimezoneOffset() {
      return 0;
    }
  }

  class Option {
    constructor(text, value) {
      this.text = text;
      this.value = value;
      this.disabled = false;
      this.selected = false;
    }
  }

  const toggle = new Element();
  const nav = new Element();
  const dateInput = new Element();
  const timeSelect = new Element('');
  timeSelect.options.push(new Option('Escolha um horário', ''));
  const bookingForm = new Element();
  const serviceInput = new Element();
  serviceInput.checked = true;
  serviceInput.value = 'Corte';
  serviceInput.dataset.price = '25';
  const totalDisplay = new Element();
  const serviceFeedback = new Element();
  const customerName = new Element('Ana');
  const elements = new Map([
    ['.menu-toggle', toggle],
    ['.main-nav', nav],
    ['#appointment-date', dateInput],
    ['#appointment-time', timeSelect],
    ['#booking-form', bookingForm],
    ['#booking-total', totalDisplay],
    ['#service-feedback', serviceFeedback],
    ['#customer-name', customerName]
  ]);

  const document = {
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: (selector) => selector === 'input[name="services"]' ? [serviceInput] : []
  };
  const window = { location: { href: '' } };

  vm.runInNewContext(script, {
    document,
    window,
    Date: FixedDate,
    Option,
    Intl,
    setInterval: () => 0
  });

  return { dateInput, timeSelect, bookingForm, serviceFeedback, window };
}

test('shows upcoming times for today before a date is chosen', () => {
  const page = createPage();
  const available = page.timeSelect.options.map((option) => option.value);

  assert.equal(available.includes('11:30'), false);
  assert.equal(available.includes('12:20'), true);
});

test('hides earlier times when booking for today', () => {
  const page = createPage();
  page.dateInput.value = '2026-05-21';
  page.dateInput.dispatch('change');

  const available = page.timeSelect.options.map((option) => option.value);
  assert.equal(available.includes('11:30'), false);
  assert.equal(available.includes('12:20'), true);
});

test('keeps the full schedule when booking for a future day', () => {
  const page = createPage();
  page.dateInput.value = '2026-05-22';
  page.dateInput.dispatch('change');

  const available = page.timeSelect.options.map((option) => option.value);
  assert.equal(available.includes('09:00'), true);
  assert.equal(available.includes('11:30'), true);
});

test('prepares a personalized WhatsApp message with emojis and booking details', () => {
  const page = createPage();
  page.dateInput.value = '2026-05-21';
  page.dateInput.dispatch('change');
  page.timeSelect.value = '12:20';
  page.bookingForm.dispatch('submit', { preventDefault() {} });

  const message = new URL(page.window.location.href).searchParams.get('text');
  assert.match(message, /💈/u);
  assert.match(message, /✂️/u);
  assert.match(message, /Nome: Ana/u);
  assert.match(message, /Horário desejado: 12:20/u);
  assert.match(message, /Por favor, confirme se esse horário está disponível/u);
});
