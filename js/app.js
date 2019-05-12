'use strict';

const reset = document.querySelector('.restart');
const resetText = document.querySelector('.restart-text');
const timerCount = document.querySelector('.timer');
const deck = document.querySelector('.deck');
const cardsStart = Array.from(document.querySelectorAll('.card'));

const stars = Array.from(document.querySelectorAll('.fa-star'));
const cardsPairs = cardsStart.length / 2;
const movesCount = document.querySelector('.moves');

const move = {
  'cardName1': '',
  'cardName2': ''
}

const rating = {
  'breakpoint1': cardsStart.length / 4,
  'breakpoint2': cardsStart.length * 2
}

/*
 * Create a list that holds all of your cards
 */


/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

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
  cards.forEach(function (el) {
    el.classList.remove('open');
    el.classList.remove('show');
    el.classList.remove('match');
    frag.appendChild(el);
  })
  deck.appendChild(frag);
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */


let secondCount;
let timer;

let movesCounter;
let matchCounter;

// reset rating, initialize moves and match counters
function resetScorePanel () {
  stars.forEach(function (el) {
    el.classList.remove('hidden');
  })
  movesCounter = 0;
  movesCount.textContent = movesCounter;
  matchCounter = 0;
  resetText.textContent = 'Reset';
}

function displayTime () {
  secondCount++;
  timerCount.textContent = secondCount;
}

// start timer
function startTimer () {
  secondCount = 0;
  timer = setInterval(displayTime, 1000);
}

// stop timer
function stopTimer () {
  clearInterval(timer);
}

// handler to restart the game
function onResetClick () {
  // stop timer if game not finished
  stopTimer();
  // reset deck
  resetScorePanel();
  layoutCards();
  deck.addEventListener('click', onCardClick);
  startTimer();
}

reset.addEventListener('click', onResetClick);


// check if the cards are the last match in a deck
function checkWin () {
  if (matchCounter === cardsPairs) {
    console.log('Winner message');
    stopTimer();
  }
}

// remove a star at moves breakpoints
function updateRating () {
  if (movesCounter === rating['breakpoint1']) {
    stars[2].classList.add('hidden');
  } else if (movesCounter === rating['breakpoint2']) {
    stars[1].classList.add('hidden');
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
  deck.querySelector('.card1').classList.remove('open', 'show');
  deck.querySelector('.card2').classList.remove('open', 'show');
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
    matchCounter += 1;
    resetMove();
  } else {
    // close if cards do not match
    setTimeout(resetMove, 300)
  }
  // update score panel
  movesCounter += 1;
  movesCount.textContent = movesCounter;
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
