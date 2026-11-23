import { content, t } from './i18n.js';
import { backLink, escapeHtml, flagPicture, icon, lamps, notice, pageHeader } from './ui.js';

const nothing = () => {};
const allExercises = () => backLink('#/practice', t('exerciseBack'));

export function reactionView() {
  return `${allExercises()}${pageHeader(t('reaction'), t('reactionInstructions'))}
    <section class="surface reaction-surface">
      <button type="button" class="reaction-pad" aria-describedby="reaction-keyboard">
        ${lamps()}
        <span class="pad-status">${escapeHtml(t('reactionReady'))}</span>
        <span class="pad-detail" hidden></span>
      </button>
      <p id="reaction-keyboard" class="reaction-keyboard">${escapeHtml(t('reactionKeyboard'))}</p>
      <p class="visually-hidden" id="reaction-announcement" role="status" aria-atomic="true"></p>
    </section>`;
}

export function bindReaction(container) {
  const pad = container.querySelector('.reaction-pad');
  const lights = [...pad.querySelectorAll('.lamp')];
  const status = pad.querySelector('.pad-status');
  const detail = pad.querySelector('.pad-detail');
  const announcement = container.querySelector('#reaction-announcement');
  let phase = 'idle';
  let litCount = 0;
  let signalAt = 0;
  let timeout;
  let frame;

  function stopClock() {
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
  }

  function show(next, title, secondary = '', announce = false) {
    phase = next;
    pad.dataset.phase = phase;
    pad.setAttribute('aria-label', [t('reactionPlace'), title, secondary].filter(Boolean).join('. '));
    lights.forEach((light, index) => light.classList.toggle('is-lit', index < litCount));
    status.textContent = title;
    detail.textContent = secondary;
    detail.hidden = !secondary;
    if (announce) announcement.textContent = [title, secondary].filter(Boolean).join('. ');
  }

  function illuminate() {
    litCount += 1;
    show('waiting', t('reactionWait'));
    if (litCount < lights.length) {
      timeout = setTimeout(illuminate, 380);
      return;
    }
    timeout = setTimeout(() => {
      frame = requestAnimationFrame(() => {
        litCount = 0;
        show('go', t('reactionGo'), '', true);
        signalAt = performance.now();
      });
    }, 850 + Math.random() * 1850);
  }

  function eventTime(event) {
    const now = performance.now();
    let time = event.timeStamp;
    if (time > now + 60_000) time -= performance.timeOrigin;
    return time > 0 && time <= now && now - time < 30_000 ? time : now;
  }

  function press(event) {
    if (phase === 'waiting' || (phase === 'go' && eventTime(event) < signalAt)) {
      stopClock();
      litCount = 0;
      show('early', t('reactionEarly'), t('reactionEarlyHint') + ' ' + t('retry'), true);
      return;
    }
    if (phase === 'go') {
      const value = Math.max(0, Math.round(eventTime(event) - signalAt));
      show('done', `${value} ${t('ms')}`, t('reactionResult') + ' · ' + t('retry'), true);
      return;
    }
    announcement.textContent = '';
    illuminate();
  }

  function pause() {
    if (document.hidden && (phase === 'waiting' || phase === 'go')) {
      stopClock();
      litCount = 0;
      show('interrupted', t('reactionInterrupted'), t('reactionInterruptedHint'), true);
    }
  }

  const hasPointer = 'PointerEvent' in window;
  if (hasPointer) {
    pad.addEventListener('pointerdown', event => {
      if (event.isPrimary && event.button === 0) press(event);
    });
  }
  pad.addEventListener('click', event => {
    if (!hasPointer || event.detail === 0) press(event);
  });
  pad.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) press(event);
    }
  });
  document.addEventListener('visibilitychange', pause);
  show('idle', t('reactionReady'));

  return () => {
    stopClock();
    document.removeEventListener('visibilitychange', pause);
  };
}

function shuffle(array) {
  const items = [...array];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

export function quizView(kind) {
  const [title, description] = kind === 'flags'
    ? ['flagQuiz', 'flagQuizShort']
    : ['situationQuiz', 'situationQuizShort'];
  return `${allExercises()}${pageHeader(t(title), t(description))}
    <section class="surface quiz-card" id="quiz-card"></section>
    ${notice(t('trackPriority'))}`;
}

function makeQuestion(kind, id) {
  const dictionary = content();
  if (kind === 'flags') {
    const [title, picture, meaning, instructions] = dictionary.flags[id];
    const distractors = shuffle(Object.keys(dictionary.flags).filter(flag => flag !== id)).slice(0, 2);
    const choices = shuffle([id, ...distractors]);
    return {
      title: t('flagQuestion'),
      picture: flagPicture(id, picture),
      choices: choices.map(flag => dictionary.flags[flag][2]),
      answer: choices.indexOf(id),
      explanation: `${title}. ${instructions}`
    };
  }
  const scenario = dictionary.situations[id];
  const choices = shuffle(scenario.options.map((_, index) => index));
  return {
    title: scenario.prompt,
    picture: '',
    choices: choices.map(index => scenario.options[index]),
    answer: choices.indexOf(scenario.correct),
    explanation: scenario.explanation
  };
}

export function bindQuiz(container, kind) {
  const card = container.querySelector('#quiz-card');
  const ids = Object.keys(kind === 'flags' ? content().flags : content().situations);
  let pool = shuffle(ids);
  let last;
  let selected = -1;
  let question;

  function renderQuestion(focusSelector = '') {
    const answered = selected >= 0;
    const { title, picture, choices, answer, explanation } = question;
    card.innerHTML = `${picture ? `<div class="quiz-flag">${picture}</div>` : ''}
      <h2 id="quiz-question" tabindex="-1">${escapeHtml(title)}</h2>
      <div class="answer-list" role="group" aria-label="${escapeHtml(t('choices'))}">
        ${choices.map((choice, index) => {
          const type = answered && index === answer ? 'right' : index === selected ? 'wrong' : '';
          const marker = type ? icon(type === 'right' ? 'check' : 'close', 19) : '';
          return `<button type="button" class="answer ${type}" data-answer="${index}" ${answered ? 'disabled' : ''}>
            <span>${escapeHtml(choice)}</span>${marker}
          </button>`;
        }).join('')}
      </div>
      ${answered ? `<div class="answer-feedback">
        <p class="answer-title" tabindex="-1">${escapeHtml(t(selected === answer ? 'correct' : 'incorrect'))}</p>
        ${selected === answer ? '' : `<p class="answer-correct">${escapeHtml(choices[answer])}</p>`}
        <p>${escapeHtml(explanation)}</p>
      </div>
      <button class="button primary next-question" type="button" data-next>${escapeHtml(t('nextQuestion'))}${icon('arrow', 19)}</button>` : ''}`;
    if (focusSelector) card.querySelector(focusSelector)?.focus();
  }

  function next(focus = false) {
    if (!pool.length) {
      pool = shuffle(ids);
      if (pool[0] === last) [pool[0], pool[1]] = [pool[1], pool[0]];
    }
    last = pool.shift();
    selected = -1;
    question = makeQuestion(kind, last);
    renderQuestion(focus ? '#quiz-question' : '');
  }

  card.addEventListener('click', event => {
    const chosen = event.target.closest('[data-answer]');
    if (chosen && selected === -1) {
      selected = Number(chosen.dataset.answer);
      renderQuestion('.answer-title');
    } else if (event.target.closest('[data-next]')) {
      next(true);
    }
  });
  next();
  return nothing;
}
