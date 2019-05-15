'use strict';

// controls
const start = document.querySelector('.start');
const startText = document.querySelector('.start-text');
const restartIcon = document.querySelector('.start .fa-repeat');
const pause = document.querySelector('.pause');
const resume = document.querySelector('.resume');

// message
const message = document.querySelector('.message');
const messageTime = document.querySelector('.message-time');
const messageRating = document.querySelector('.message-rating');

// deck
const deck = document.querySelector('.deck');
const cardsStart = Array.from(document.querySelectorAll('.card')); // IE support by polyfill
const cardsPairs = cardsStart.length / 2;

// score panel
const stars = Array.from(document.querySelectorAll('.fa-star')); // IE support by polyfill
const timeEl = document.querySelector('.time');
const movesEl = document.querySelector('.moves');

// util
let movesCounter;
const move = {
  'cardName1': '',
  'cardName2': ''
}
let ratingCounter;
const rating = {
  'max': 3,
  'breakpoint1': cardsStart.length,
  'breakpoint2': cardsStart.length * 2
}
let time; // in seconds
let timer;
let matchCounter;

// Shuffle function from http://stackoverflow.com/a/2450976
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

// shuffle and render cards
function layoutCards () {
  deck.classList.remove('deck-inactive');
  const cards = shuffle(cardsStart);
  const frag = document.createDocumentFragment();
  // IE support by polyfill
  cards.forEach(function (el) {
    el.classList.remove('open');
    el.classList.remove('show');
    el.classList.remove('match');
    frag.appendChild(el);
  })
  deck.appendChild(frag);
}

// reset rating, initialize moves and match counters
function resetScorePanel () {
  // IE support by polyfill
  stars.forEach(function (el) {
    el.classList.remove('hidden');
  })
  ratingCounter = rating['max'];
  movesCounter = 0;
  movesEl.textContent = movesCounter;
  matchCounter = 0;
}

// start timer at a given amount of seconds
function startTimer (startTime) {
  time = startTime;
  timer = setInterval(function () {
    time++;
    timeEl.textContent = time;
  }, 1000);
}

// stop timer
function stopTimer () {
  clearInterval(timer);
}

// handler to start the game
function onStartClick () {
  message.classList.add('message-inactive');
  resetScorePanel();
  layoutCards();
  deck.addEventListener('click', onCardClick);
  startTimer(0);
  // update controls
  startText.textContent = 'Restart';
  restartIcon.classList.remove('fa-repeat-inactive');
  start.disabled = true;
  pause.disabled = false;
}

// handler to pause the game
function onPauseClick () {
  deck.removeEventListener('click', onCardClick);
  // pause timer
  timeEl.textContent = time;
  stopTimer();
  // update controls
  pause.disabled = true;
  resume.disabled = false;
}

// handler to restart the game
function onResumeClick () {
  deck.addEventListener('click', onCardClick);
  // restart timer from where it stopped
  startTimer(time);
  // update controls
  pause.disabled = false;
  resume.disabled = true;
}

start.addEventListener('click', onStartClick);
pause.addEventListener('click', onPauseClick);
resume.addEventListener('click', onResumeClick);


function showMessage () {
  message.classList.remove('message-inactive');
  messageTime.textContent = time;
  messageRating.textContent = ratingCounter;
  return message;
}

// check if the cards are the last match in a deck
function checkWin () {
  if (matchCounter === cardsPairs) {
    stopTimer();
    showMessage();
    start.disabled = false;
    pause.disabled = true;
  }
}

// remove a star at moves breakpoints
function updateRating () {
  if (movesCounter === rating['breakpoint1']) {
    stars[2].classList.add('hidden');
    ratingCounter--;
  } else if (movesCounter === rating['breakpoint2']) {
    stars[1].classList.add('hidden');
    ratingCounter--;
  }
}

// record open cards names to check for match
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

// clear current cards info
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

// check if the cards match and update score panel
function checkMatch () {
  if (move['cardName1'] === move['cardName2']) {
    // leave open and increase a match counter if cards match
    deck.querySelector('.card1').classList.add('match');
    deck.querySelector('.card2').classList.add('match');
    matchCounter++;
    resetMove();
  } else {
    // close if cards do not match
    setTimeout(resetMove, 300)
  }
  // update score panel
  movesCounter++;
  movesEl.textContent = movesCounter;
  updateRating();
  checkWin();
}

// open a card and check for match
function onCardClick (e) {
  // Check if a card is clicked and it is not the same as previously opened or matched
  if (e.target.classList.contains('card') && (!e.target.classList.contains('card1')) && (!e.target.classList.contains('match'))) {
    // open a card and record a move
    e.target.classList.add('open');
    e.target.classList.add('show');
    recordMove(e.target);

    // When two cards are open, check for match
    if (move['cardName1'] && move['cardName2']) {
      checkMatch();
    }
  }
}
