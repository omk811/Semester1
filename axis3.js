const form = document.querySelector('#practice');
const bank = JSON.parse(document.querySelector('#questions').textContent);
const arabicNumber = new Intl.NumberFormat('ar-OM');
const numbers = value => arabicNumber.format(value);
const score = document.querySelector('#score');

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function normalize(text, exact) {
  const clean = text.trim().replace(/\s+/g, ' ');
  return exact ? clean : clean.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
}

function renderQuestion(question, index) {
  const id = 'q' + index;
  const card = node('section', '', 'exercise');
  const group = node('fieldset');
  const prompt = node('legend', numbers(index + 1) + ' — ' + question.prompt);
  group.append(prompt);

  if (question.options) {
    const choices = node('div', '', 'choices');
    question.options.forEach(option => {
      const label = node('label');
      const input = node('input');
      input.type = 'radio';
      input.name = id;
      input.value = option;
      label.append(input, node('span', option));
      choices.append(label);
    });
    group.append(choices);
  } else {
    const input = node('input');
    input.type = 'text';
    input.name = id;
    input.id = id;
    input.autocomplete = 'off';
    input.spellcheck = false;
    const label = node('label', 'اكتب إجابتك');
    label.htmlFor = id;
    group.append(label, input);
  }

  const feedback = node('p', '', 'feedback');
  feedback.setAttribute('aria-live', 'polite');
  card.append(group, feedback);
  document.getElementById(question.group).append(card);

  return { id, question, feedback };
}

const items = bank.map(renderQuestion);
form.addEventListener('submit', event => {
  event.preventDefault();
  const answers = new FormData(form);
  let correct = 0;
  let answered = 0;

  items.forEach(({ id, question, feedback }) => {
    const answer = normalize(answers.get(id) || '', question.exact);
    if (!answer) {
      feedback.dataset.state = 'missing';
      feedback.textContent = 'أجب عن هذا السؤال ثم تحقّق مجددًا.';
      return;
    }
    answered++;
    const expected = question.answers;
    const matches = expected.some(value => normalize(value, question.exact) === answer);
    if (matches) correct++;
    feedback.dataset.state = matches ? 'correct' : 'wrong';
    feedback.textContent = (matches ? 'صحيح. ' : 'الإجابة الصحيحة: ' + expected[0] + '. ') + question.why;
  });

  score.textContent = 'النتيجة ' + numbers(correct) + ' من ' + numbers(items.length) +
    ' · أجبت عن ' + numbers(answered) + ' من ' + numbers(items.length);
  score.focus();
});

form.addEventListener('reset', () => {
  items.forEach(({ feedback }) => {
    feedback.textContent = '';
    delete feedback.dataset.state;
  });
  score.textContent = '';
  document.querySelector('#practice-title').focus();
});
