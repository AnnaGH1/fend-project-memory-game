'use strict';

/**
 * Select control elements
 * @type {Element}
 */
const start = document.querySelector('.start');
const startText = document.querySelector('.start-text');
const restartIcon = document.querySelector('.start .fa-repeat');
const pause = document.querySelector('.pause');
const resume = document.querySelector('.resume');

/**
 * Select message elements
 * @type {Element}
 */
const message = document.querySelector('.message');
const messageTime = document.querySelector('.message-time');
const messageRating = document.querySelector('.message-rating');
const leader = document.querySelector('.leader');
const leaderTime = document.querySelector('.leader-time');

/**
 * Select deck element
 * @type {Element}
 */
const deck = document.querySelector('.deck');

/**
 * Select score panel elements
 * @type {Element}
 */
const timeEl = document.querySelector('.time');
const movesEl = document.querySelector('.moves');
const starsEls = document.querySelectorAll('.fa-star');

/*
IE support by polyfill
 */
const stars = Array.from(starsEls);

/**
 * Declare or initialize variables for game control
 */
let cardsPairs = 0;
let movesCounter;
const move = {
  'cardName1': '',
  'cardName2': ''
};
let ratingCounter;
const rating = {
  'max': 3,
  'breakpoint1': 0,
  'breakpoint2': 0
};
let time;
let timer;
let matchCounter;

/**
 * List of unique cards
 * @type {string[]}
 */
const cardsUnique = [
  'anchor',
  'bicycle',
  'bolt',
  'bomb',
  'cube',
  'diamond',
  'leaf',
  'paper-plane-o'
];

/**
 * @function duplicateCards
 * @param {Array} arr - List of unique cards
 * @returns {Array} - List of cards to be rendered
 */
function duplicateCards (arr) {
  const duplicateArr = [];
  arr.forEach(function(el) {
    duplicateArr.push(el);
    duplicateArr.push(el);
  });
  return duplicateArr;
}

/**
 * @function shuffle - from http://stackoverflow.com/a/2450976
 * @param {Array} array
 * @returns {Array}
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * @function layoutCards - Shuffle and render cards
 */
function layoutCards () {
  deck.classList.remove('deck-inactive');
  const cardsListHtml = [];
  const cards = shuffle(duplicateCards(cardsUnique));
  /*
  Once the number of cards is known, update variables
   */
  cardsPairs = cards.length / 2;
  rating['breakpoint1'] = cards.length;
  rating['breakpoint2'] = cards.length * 2;
  // render cards
  cards.forEach(function(el) {
    const cardTemplate = '<li class="card"><i class="fa fa-' + el + '"></i></li>';
    cardsListHtml.push(cardTemplate);
  });
  deck.innerHTML = cardsListHtml.join('');
}

/**
 * @function resetScorePanel - Reset rating, initialize moves and match counters
 */
function resetScorePanel () {
  /*
  IE support by polyfill
   */
  stars.forEach(function (el) {
    el.classList.remove('hidden');
  });
  ratingCounter = rating['max'];
  movesCounter = 0;
  movesEl.textContent = movesCounter;
  matchCounter = 0;
}

/**
 * @function startTimer - Start timer at a given number of seconds
 * @param {number} startTime
 */
function startTimer (startTime) {
  time = startTime;
  timer = setInterval(function () {
    time++;
    timeEl.textContent = time;
  }, 1000);
}

/**
 * @function stopTimer
 */
function stopTimer () {
  clearInterval(timer);
}

/**
 * @function onStartClick - Handler to start the game
 */
function onStartClick () {
  message.classList.add('message-inactive');
  resetScorePanel();
  layoutCards();
  deck.addEventListener('click', onCardClick);
  startTimer(0);
  /*
  Update controls
   */
  startText.textContent = 'Restart';
  restartIcon.classList.remove('fa-repeat-inactive');
  start.disabled = true;
  pause.disabled = false;
}

/**
 * @function onStartClick - Handler to pause the game
 */
function onPauseClick () {
  deck.removeEventListener('click', onCardClick);
  /*
  Pause timer
   */
  timeEl.textContent = time;
  stopTimer();
  /*
  Update controls
   */
  pause.disabled = true;
  resume.disabled = false;
}

/**
 * @function onStartClick - Handler to restart the game
 */
function onResumeClick () {
  deck.addEventListener('click', onCardClick);
  /*
  Restart timer from where it stopped
   */
  startTimer(time);
  /*
  Update controls
   */
  pause.disabled = false;
  resume.disabled = true;
}

/*
Attach event listeners to controls
 */
start.addEventListener('click', onStartClick);
pause.addEventListener('click', onPauseClick);
resume.addEventListener('click', onResumeClick);

/**
 * @function showMessage - Show winner message
 * @returns {Element}
 */
function showMessage () {
  deck.classList.add('deck-inactive');
  message.classList.remove('message-inactive');
  messageTime.textContent = time;
  messageRating.textContent = ratingCounter;
  return message;
}

/**
 * @function checkWin - Check if cards are the last match in the deck
 * @returns {boolean}
 */
function checkWin () {
  if (matchCounter === cardsPairs) {
    stopTimer();
    /*
    Check web storage support
     */
    if (typeof(Storage) !== 'undefined') {
      /*
      Update local storage with the best time
       */
      if (!localStorage.bestTime || localStorage.bestTime > time) {
        localStorage.bestTime = time;
      }
      leaderTime.textContent = localStorage.bestTime;
      leader.classList.remove('leader-inactive');
    }
    showMessage();
    start.disabled = false;
    pause.disabled = true;
    return true;
  }
  return false;
}

/**
 * @function updateRating - Remove a star at moves breakpoints
 */
function updateRating () {
  if (movesCounter === rating['breakpoint1']) {
    stars[2].classList.add('hidden');
    ratingCounter--;
  } else if (movesCounter === rating['breakpoint2']) {
    stars[1].classList.add('hidden');
    ratingCounter--;
  }
}

/**
 * @function recordMove - Record open cards names to check for match
 * @param {Element} card - Open card
 * @returns {{cardName1: string, cardName2: string}}
 */
function recordMove (card) {
  if (!move['cardName1'] && !move['cardName2']) {
    card.classList.add('card1');
    move['cardName1'] = card.firstElementChild.classList[1];
    return move;
  } else if (!move['cardName2']) {
    card.classList.add('card2');
    move['cardName2'] = card.firstElementChild.classList[1];
    return move;
  }
  return move;
}

/**
 * @function resetMove - Clear current cards values
 * @returns {{cardName1: string, cardName2: string}}
 */
function resetMove () {
  move['cardName1'] = '';
  move['cardName2'] = '';
  deck.querySelector('.card1').classList.remove('open');
  deck.querySelector('.card2').classList.remove('open');
  deck.querySelector('.card1').classList.remove('show');
  deck.querySelector('.card2').classList.remove('show');
  deck.querySelector('.card1').classList.remove('card1');
  deck.querySelector('.card2').classList.remove('card2');
  return move;
}

/**
 * @function checkMatch - Check if cards match and update score panel
 * @returns {boolean}
 */
function checkMatch () {
  if (move['cardName1'] === move['cardName2']) {
    /*
    Leave open and increase a match counter if cards match
     */
    deck.querySelector('.card1').classList.add('match');
    deck.querySelector('.card2').classList.add('match');
    matchCounter++;
    resetMove();
    return true;
  }
  /*
  Close if cards do not match
   */
  setTimeout(resetMove, 300);
  return false
}

/**
 * @function onCardClick - Handler to open a card and check for match
 * @param {Event} e - Click event
 */
function onCardClick (e) {
  /*
  Check if card is clicked and is not the same as previously opened or matched
   */
  if (e.target.classList.contains('card') && (!e.target.classList.contains('card1')) && (!e.target.classList.contains('match'))) {
    /*
    Open a card and record a move
     */
    e.target.classList.add('open');
    e.target.classList.add('show');
    recordMove(e.target);
    /*
    When two cards are open, check for match
     */
    if (move['cardName1'] && move['cardName2']) {
      checkMatch();
      /*
      Update score panel
       */
      movesCounter++;
      movesEl.textContent = movesCounter;
      updateRating();
      checkWin();
    }
  }
}
