// variables
const inputs = document.querySelectorAll(".try input");
const firstTryInputs = document.querySelectorAll(".first-try input");
const secondTryInputs = document.querySelectorAll(".second-try input");
const thirdTryInputs = document.querySelectorAll(".third-try input");
const fourthTryInputs = document.querySelectorAll(".fourth-try input");
const fifthTryInputs = document.querySelectorAll(".fifth-try input");
const allTries = document.querySelectorAll(".try");
const allTriesInputs = [
  firstTryInputs,
  secondTryInputs,
  thirdTryInputs,
  fourthTryInputs,
  fifthTryInputs,
];
let activeTry = 0;
let correctPositions = [false, false, false, false, false, false];
let selectedWord = "";
const checkWordBtn = document.querySelector(".check-word");
let hintsBtn = document.querySelector(".hints");
let hintsNumber = document.querySelector(".hints span");
let streak = document.querySelector(".streak");
let streakFiller = document.querySelector(".filler");
let streakCounter = document.querySelector("#streak-count");
let streakRecords = document.querySelector(".streak-records");
let currentStreak = document.querySelector(".current-streak");
let bestStreak = document.querySelector(".best-streak");
let currentStreakValue = 0;
let bestStreakValue = Number(localStorage.getItem("bestStreak")) || 0;
let isHintAnimating = false;
let hintTimeout;

// refining input field
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    // Remove everything except letters
    input.value = input.value.replace(/[^a-zA-Z]/g, "");

    // Keep only one letter
    input.value = input.value.slice(0, 1);

    const currentTry = input.closest(".try");
    const tryInputs = [...currentTry.querySelectorAll("input")];
    const currentIndex = [...tryInputs].indexOf(input);
    //auto focus logic
    if (input.value) {
      const nextInput = tryInputs
        .slice(currentIndex + 1)
        .find((input) => !input.disabled);

      if (nextInput) {
        nextInput.focus();
      }
    }
  });
  input.addEventListener("keydown", (e) => {
    const currentTry = input.closest(".try");
    const tryInputs = [...currentTry.querySelectorAll("input")];
    const currentIndex = tryInputs.indexOf(input);

    if (e.key === "Backspace" && input.value === "") {
      const previousInput = tryInputs
        .slice(0, currentIndex)
        .reverse()
        .find((input) => !input.disabled);

      if (previousInput) {
        previousInput.focus();
      }
    }
  });
});
// Adding the words
const originalWords = [
  "planet",
  "orange",
  "school",
  "guitar",
  "rabbit",
  "window",
  "bottle",
  "pencil",
  "flower",
  "monkey",
  "dragon",
  "silver",
  "forest",
  "castle",
  "bridge",
  "yellow",
  "purple",
  "family",
  "friend",
  "summer",
  "winter",
  "spring",
  "cheese",
  "banana",
  "tomato",
  "potato",
  "coffee",
  "cherry",
  "grapes",
  "rocket",
  "circle",
  "square",
  "puzzle",
  "button",
  "screen",
  "laptop",
  "mobile",
  "camera",
  "soccer",
  "tennis",
  "player",
  "doctor",
  "artist",
  "engine",
  "travel",
  "island",
  "marble",
  "pillow",
  "pocket",
  "shadow",
];

let words = [...originalWords];

//shuffle words
function shuffle(array) {
  let current = array.length,
    temp,
    random;

  while (current > 0) {
    // get random element
    random = Math.floor(Math.random() * current);
    // decrease length by one
    current--;
    // save current element in stash
    temp = array[current];
    //current element = random element
    array[current] = array[random];
    // random element = get elment from stash
    array[random] = temp;
  }
  return array;
}

function resetWords() {
  words = [...originalWords];
  shuffle(words);
  selectedWord = words[0].toUpperCase();
}

// first input focus on reload

window.onload = function () {
  inputs[0].focus();
};

//streak system
let streakTimeout;

function showStreak() {
  streak.classList.add("show");

  clearTimeout(streakTimeout);

  streakTimeout = setTimeout(() => {
    streak.classList.remove("show");
  }, 3000);
}

function showStreakRecords() {
  currentStreak.textContent = currentStreakValue;
  bestStreak.textContent = bestStreakValue;

  streakRecords.classList.add("show");

  setTimeout(() => {
    streakRecords.classList.remove("show");
  }, 4000);
}

function updateStreak() {
  currentStreakValue++;

  let isNewBest = currentStreakValue > bestStreakValue;

  if (isNewBest) {
    bestStreakValue = currentStreakValue;
    localStorage.setItem("bestStreak", bestStreakValue);

    // Trigger the new record animation
    streak.classList.remove("new-record");
    void streak.offsetWidth; // Restart the animation
    streak.classList.add("new-record");

    setTimeout(() => {
      streak.classList.remove("new-record");
    }, 1800);
  }

  streakCounter.textContent = currentStreakValue;
  currentStreak.textContent = currentStreakValue;
  bestStreak.textContent = bestStreakValue;

  let currentWidth = parseFloat(streakFiller.style.width) || 0;
  streakFiller.style.width = `${Math.min(currentWidth + 2, 100)}%`;
}

// check word function

function checkWord() {
  let selectedWordLetters = Array.from(selectedWord);

  const currentInputs = allTriesInputs[activeTry];

  // Check if all inputs are filled
  const isComplete = [...currentInputs].every((input) => input.value !== "");

  if (!isComplete) {
    Swal.fire({
      title: "Oops!",
      text: "Complete the word first!",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  let isCorrect = true;

  currentInputs.forEach((input, index) => {
    const value = input.value.toUpperCase();

    if (value === selectedWordLetters[index]) {
      input.style.backgroundColor = "#009688";
      input.style.borderBottom = "none";
      input.style.color = "white";
      correctPositions[index] = true;
    } else if (selectedWordLetters.includes(value)) {
      input.style.backgroundColor = "#ffc107";
      input.style.borderBottom = "none";
      input.style.color = "white";
      isCorrect = false;
    } else {
      input.style.backgroundColor = "#9e9e9e";
      input.style.borderBottom = "none";
      input.style.color = "white";
      isCorrect = false;
    }
  });

  if (isCorrect) {
    document.activeElement.blur();

    currentInputs.forEach((input) => {
      input.classList.remove("active");
      input.disabled = true;
    });
    // Remove the correctly guessed word
    words.splice(0, 1);
    // Check if all words have been guessed
    if (words.length === 0) {
      Swal.fire({
        title: "Good Job!!!!!",
        text: "You gussed all of the words correctly!",
        icon: "success",
        confirmButtonText: "Play Again!",
      }).then((result) => {
        if (result.isConfirmed) {
          resetWords();
          restartGame();
        }
      });
    } else {
      shuffle(words);
      selectedWord = words[0].toUpperCase();

      Swal.fire({
        title: "Congratulations!",
        text: "You gussed the word correctly!",
        icon: "success",
        confirmButtonText: "Next Word!",
      }).then((result) => {
        if (result.isConfirmed) {
          restartGame();
          showStreak();
          setTimeout(() => {
            updateStreak();
          }, 1500);
          console.log(words[0]);
          console.log(selectedWord);
        }
      });
    }
    checkWordBtn.disabled = true;
    checkWordBtn.style.cursor = "default";
  } else {
    nextTry();
  }
}

// hints system
hintsBtn.addEventListener("click", hintsFunc);

function hintsFunc() {
  if (isHintAnimating) return;
  let remainingHints = Number(hintsNumber.textContent);

  if (remainingHints <= 0) {
    Swal.fire({
      title: "No Hints Left!",
      text: "You have used all your hints.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  const currentInputs = allTriesInputs[activeTry];

  // Find positions that are not already correct
  const availablePositions = [];

  currentInputs.forEach((input, index) => {
    if (!correctPositions[index]) {
      availablePositions.push(index);
    }
  });

  if (availablePositions.length === 0) {
    Swal.fire({
      title: "No More Hints!",
      text: "All letters are already correct!",
      icon: "info",
      confirmButtonText: "OK",
    });
    return;
  }

  // Choose a random position
  const randomIndex = Math.floor(Math.random() * availablePositions.length);

  const selectedPosition = availablePositions[randomIndex];

  const correctLetter = selectedWord[selectedPosition].toUpperCase();
  const selectedInput = currentInputs[selectedPosition];

  // Mark this position as correct
  correctPositions[selectedPosition] = true;

  // 1. Prepare the empty white input
  selectedInput.value = "";
  selectedInput.style.backgroundColor = "white";
  selectedInput.style.color = "transparent";
  selectedInput.style.borderBottom = "1px solid black";

  // Remove active class
  selectedInput.classList.remove("active");

  // 2. Restart the animation
  selectedInput.classList.remove("hint-reveal");
  void selectedInput.offsetWidth;

  isHintAnimating = true;
  selectedInput.classList.add("hint-reveal");

  // 3. Reveal the letter at the halfway point
  hintTimeout = setTimeout(() => {
    selectedInput.value = correctLetter;

    selectedInput.style.backgroundColor = "#009688";
    selectedInput.style.color = "white";
    selectedInput.style.borderBottom = "none";
  }, 300);

  // 4. Disable the input after animation finishes
  selectedInput.addEventListener(
    "animationend",
    () => {
      isHintAnimating = false;
      selectedInput.classList.remove("hint-reveal");
      selectedInput.disabled = true;
    },
    { once: true },
  );

  // Decrease available hints
  remainingHints--;
  hintsNumber.textContent = remainingHints;

  // Focus the next available input (skip the animating input)
  const nextInput = [...currentInputs].find(
    (input) => input !== selectedInput && !input.disabled && input.value === "",
  );

  if (nextInput) {
    nextInput.focus();
  }
}

shuffle(words);
selectedWord = words[0].toLocaleUpperCase();
// check word button

checkWordBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (isHintAnimating || Swal.isVisible()) return;

  checkWord();
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    !checkWordBtn.disabled &&
    !isHintAnimating &&
    !Swal.isVisible()
  ) {
    e.preventDefault();
    checkWord();
  }
});

// making only active try inputs wrritable
allTries.forEach((tryRow) => {
  if (!tryRow.classList.contains("active-try")) {
    const tryInputs = tryRow.querySelectorAll("input");
    tryInputs.forEach((input) => {
      input.disabled = true;
      input.style.backgroundColor = "white";
    });
  }
});

//moving between attempts

function nextTry() {
  // Remove active class from current h3
  allTries[activeTry].querySelector("h3").classList.remove("active");
  const currentInputs = allTriesInputs[activeTry];

  currentInputs.forEach((input) => {
    input.classList.remove("active");
    input.disabled = true;
  });

  allTries[activeTry].classList.remove("active-try");

  activeTry++;

  if (activeTry < allTries.length) {
    // Add active class to next h3
    allTries[activeTry].querySelector("h3").classList.add("active");
    allTries[activeTry].classList.add("active-try");

    const nextInputs = allTriesInputs[activeTry];

    nextInputs.forEach((input, index) => {
      if (correctPositions[index]) {
        input.value = selectedWord[index].toUpperCase();
        input.disabled = true;

        input.style.backgroundColor = "#009688";
        input.style.borderBottom = "none";
        input.style.color = "white";

        input.classList.remove("active");
      } else {
        input.disabled = false;
        input.classList.add("active");
      }
    });
    //focus on the first available input field
    const firstAvailableInput = [...nextInputs].find(
      (input) => !input.disabled,
    );

    if (firstAvailableInput) {
      firstAvailableInput.focus();
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Game Over!",
      text: `The correct word was ${words[0]}`,
      confirmButtonText: "View Records",
    }).then((result) => {
      if (result.isConfirmed) {
        // Show streak records
        showStreakRecords();

        // Reset current streak only
        currentStreakValue = 0;
        streakCounter.textContent = "0";
        streakFiller.style.width = "0%";

        // Start a new game
        resetWords();
        restartGame();
      }
    });

    checkWordBtn.disabled = true;
    checkWordBtn.style.cursor = "default";
  }
}

// restart game function

function restartGame() {
  clearTimeout(hintTimeout);
  isHintAnimating = false;
  //reset hints
  hintsNumber.textContent = 3;
  // Reset active attempt
  activeTry = 0;
  //reset positions
  correctPositions = [false, false, false, false, false, false];
  // Reset all attempts
  allTriesInputs.forEach((tryInputs, index) => {
    tryInputs.forEach((input) => {
      input.value = "";
      input.disabled = index !== 0;

      input.style.backgroundColor = "white";
      input.style.borderBottom = "";
      input.style.color = "";

      // Add active class only to first attempt inputs
      input.classList.toggle("active", index === 0);
    });
  });

  // Reset attempt titles
  allTries.forEach((tryRow, index) => {
    const title = tryRow.querySelector("h3");

    title.classList.toggle("active", index === 0);
    tryRow.classList.toggle("active-try", index === 0);
  });

  // Enable check button
  checkWordBtn.disabled = false;
  checkWordBtn.style.cursor = "pointer";

  // Focus first input
  setTimeout(() => {
    allTriesInputs[0][0].focus();
  }, 0);
}
console.log(words[0]);
