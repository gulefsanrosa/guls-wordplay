"use strict";

// ========================================
// 1. SAYFADAKİ ALANLAR
// ========================================

const categorySelect =
  document.getElementById("category-select");

const wordCategory = document.getElementById("word-category");
const wordTitle = document.getElementById("word-title");
const wordType = document.getElementById("word-type");
const wordMeaning = document.getElementById("word-meaning");
const wordDefinition = document.getElementById("word-definition");
const wordExample = document.getElementById("word-example");
const wordTranslation = document.getElementById("word-translation");

const translationButton =
  document.getElementById("translation-button");

const memeSentence = document.getElementById("meme-sentence");
const memeImage = document.getElementById("meme-image");

const imagePlaceholder =
  document.getElementById("image-placeholder");

const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const wordCounter = document.getElementById("word-counter");

const practiceContainer =
  document.getElementById("practice-container");


// ========================================
// 2. KELİME LİSTESİ VE KATEGORİLER
// ========================================

const categoryLabels = {
  all: "ALL WORDS",
  noun: "NOUNS",
  verb: "VERBS",
  adjective: "ADJECTIVES",
  adverb: "ADVERBS",
  phrase: "PHRASES"
};

let currentWords = [...vocabulary];
let currentWordIndex = 0;

let quizWords = [];
let quizIndex = 0;
let quizScore = 0;

// Başlangıçta bütün kelimeler seçili olsun.
categorySelect.value = "all";

// Veri dosyasındaki temel eksikleri kontrol eder.
const requiredFields = [
  "word",
  "type",
  "meaning",
  "definition",
  "example",
  "translation",
  "memeSentence"
];

vocabulary.forEach((item) => {
  requiredFields.forEach((field) => {
    if (
      typeof item[field] !== "string" ||
      !item[field].trim()
    ) {
      console.error(
        `Eksik kelime bilgisi: ${item.word || "İsimsiz kayıt"} / ${field}`
      );
    }
  });
});

console.info(`Yüklenen kelime sayısı: ${vocabulary.length}`);

if (vocabulary.length !== 92) {
  console.warn(
    "İlk içerik listesinde 92 kayıt olmalı. words.js dosyasını kontrol et."
  );
}

const uniqueWordCount = new Set(
  vocabulary.map((item) => item.word.trim().toLowerCase())
).size;

if (uniqueWordCount !== vocabulary.length) {
  console.warn("Kelime listesinde tekrarlanan kayıt var.");
}

// Kelimeyi uygun kategoriyle eşleştirir.
function matchesCategory(item, category) {
  if (category === "all") {
    return true;
  }

  const type = item.type.toLowerCase().trim();

  if (category === "phrase") {
    // "Out of focus" gibi ifadeler burada yer alır.
    // Fiil içeren ifadeler Verbs bölümünde gösterilir.
    return /\bphrase\b/.test(type) && !/\bverb\b/.test(type);
  }

  // Tam kelime eşleştirmesi yapar.
  // Böylece "adverb", yanlışlıkla "verb" sayılmaz.
  // "verb / noun" ise iki kategoride de görünür.
  return new RegExp(`\\b${category}\\b`).test(type);
}


// ========================================
// 3. KELİME KARTI
// ========================================

function showWord() {
  const item = currentWords[currentWordIndex];

  wordCategory.textContent =
    categoryLabels[categorySelect.value];

  // Yeni kelimeye geçince çeviriyi kapat.
  wordTranslation.hidden = true;
  translationButton.textContent = "Show Turkish meaning";
  translationButton.setAttribute("aria-expanded", "false");

  // Önceki görseli temizle.
  memeImage.hidden = true;
  memeImage.removeAttribute("src");
  memeImage.alt = "";

  imagePlaceholder.hidden = false;
  imagePlaceholder.textContent = "Your meme goes here.";

  // Kategoride kelime bulunmuyorsa:
  if (!item) {
    wordTitle.textContent = "Coming soon";
    wordType.textContent = "";
    wordMeaning.textContent = "";
    wordDefinition.textContent =
      "Words in this category will be added soon.";
    wordExample.textContent = "";
    wordTranslation.textContent = "";
    memeSentence.textContent = "";

    imagePlaceholder.textContent = "More memes coming soon.";

    translationButton.disabled = true;
    previousButton.disabled = true;
    nextButton.disabled = true;
    wordCounter.textContent = "0 / 0";

    return;
  }

  // Kelime bilgilerini yerleştir.
  wordTitle.textContent = item.word;
  wordType.textContent = item.type;
  wordMeaning.textContent = item.meaning;
  wordDefinition.textContent = item.definition;
  wordExample.textContent = item.example;
  wordTranslation.textContent = item.translation;
  memeSentence.textContent = item.memeSentence;

  translationButton.disabled = false;

  // Görsel eklenmişse yükle.
  if (item.image) {
    memeImage.alt =
      item.imageAlt || `Meme illustrating “${item.word}”.`;

    memeImage.src = item.image;
  }

  // Sayacı ve geçiş düğmelerini güncelle.
  wordCounter.textContent =
    `${currentWordIndex + 1} / ${currentWords.length}`;

  previousButton.disabled = currentWordIndex === 0;

  nextButton.disabled =
    currentWordIndex === currentWords.length - 1;
}


// ========================================
// 4. GÖRSEL VE ÇEVİRİ
// ========================================

memeImage.addEventListener("load", () => {
  memeImage.hidden = false;
  imagePlaceholder.hidden = true;
});

memeImage.addEventListener("error", () => {
  memeImage.hidden = true;
  imagePlaceholder.hidden = false;
  imagePlaceholder.textContent =
    "Meme image could not be loaded.";
});

translationButton.addEventListener("click", () => {
  const willShow = wordTranslation.hidden;

  wordTranslation.hidden = !willShow;

  translationButton.textContent = willShow
    ? "Hide Turkish meaning"
    : "Show Turkish meaning";

  translationButton.setAttribute(
    "aria-expanded",
    String(willShow)
  );
});


// ========================================
// 5. KELİMELER ARASINDA GEÇİŞ
// ========================================

previousButton.addEventListener("click", () => {
  if (currentWordIndex > 0) {
    currentWordIndex--;
    showWord();
  }
});

nextButton.addEventListener("click", () => {
  if (currentWordIndex < currentWords.length - 1) {
    currentWordIndex++;
    showWord();
  }
});


// ========================================
// 6. OYUN İÇİN YARDIMCI FONKSİYON
// ========================================

// Orijinal listeyi değiştirmeden sıralamayı karıştırır.
function shuffleList(list) {
  const shuffled = [...list];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] =
      [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}


// ========================================
// 7. OYUNU BAŞLATMA
// ========================================

function startQuiz() {
  quizWords = shuffleList(currentWords);
  quizIndex = 0;
  quizScore = 0;

  if (quizWords.length === 0) {
    practiceContainer.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
      "Choose another category to start practising.";

    practiceContainer.appendChild(message);
    return;
  }

  showQuizQuestion();
}


// ========================================
// 8. SORU VE SEÇENEKLER
// ========================================

function showQuizQuestion(moveFocus = false) {
  practiceContainer.replaceChildren();

  const item = quizWords[quizIndex];

  const progress = document.createElement("p");
  progress.className = "quiz-progress";
  progress.textContent =
    `Question ${quizIndex + 1} of ${quizWords.length}`;

  const question = document.createElement("h3");
  question.className = "quiz-question";
  question.textContent = `What does “${item.word}” mean?`;
  question.tabIndex = -1;

  // Öncelikle aynı kategoriden yanlış seçenekler seç.
  const categoryMeanings = currentWords.map(
    (word) => word.meaning
  );

  // Küçük kategorilerde diğer kelimelerden de seçenek al.
  // Böylece tek kelimelik Adverbs kategorisi de çalışır.
  const allMeanings = vocabulary.map(
    (word) => word.meaning
  );

  const alternativeMeanings = [
    ...new Set([
      ...shuffleList(categoryMeanings),
      ...shuffleList(allMeanings)
    ])
  ].filter((meaning) => meaning !== item.meaning);

  const answers = shuffleList([
    item.meaning,
    ...alternativeMeanings.slice(0, 2)
  ]);

  const options = document.createElement("div");
  options.className = "quiz-options";

  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  feedback.setAttribute("aria-atomic", "true");

  const nextQuestionButton = document.createElement("button");
  nextQuestionButton.type = "button";
  nextQuestionButton.className = "button button-primary";

  nextQuestionButton.textContent =
    quizIndex === quizWords.length - 1
      ? "See my result →"
      : "Next question →";

  nextQuestionButton.hidden = true;

  let answered = false;

  answers.forEach((answer) => {
    const answerButton = document.createElement("button");

    answerButton.type = "button";
    answerButton.className = "button quiz-option";
    answerButton.textContent = answer;
    answerButton.lang = "tr";

    answerButton.addEventListener("click", () => {
      // Aynı sorudan birden fazla puan alınmasını önle.
      if (answered) return;
      answered = true;

      const isCorrect = answer === item.meaning;

      if (isCorrect) {
        quizScore++;
        answerButton.classList.add("is-correct");

        feedback.textContent =
          `Correct! ${item.word} = ${item.meaning}`;
      } else {
        answerButton.classList.add("is-wrong");

        feedback.textContent =
          `Not quite! The correct answer is: ${item.meaning}`;
      }

      // Cevap sonrası seçenekleri kilitle.
      options.querySelectorAll("button").forEach((button) => {
        button.disabled = true;

        if (button.textContent === item.meaning) {
          button.classList.add("is-correct");
        }
      });

      nextQuestionButton.hidden = false;
      nextQuestionButton.focus({ preventScroll: true });
    });

    options.appendChild(answerButton);
  });

  nextQuestionButton.addEventListener("click", () => {
    quizIndex++;

    if (quizIndex < quizWords.length) {
      showQuizQuestion(true);
    } else {
      showQuizResult();
    }
  });

  practiceContainer.append(
    progress,
    question,
    options,
    feedback,
    nextQuestionButton
  );

  if (moveFocus) {
    question.focus({ preventScroll: true });
  }
}


// ========================================
// 9. SONUÇ EKRANI
// ========================================

function showQuizResult() {
  practiceContainer.replaceChildren();

  const heading = document.createElement("h3");
  heading.className = "quiz-question";
  heading.textContent = "Practice complete!";
  heading.tabIndex = -1;

  const result = document.createElement("p");
  result.className = "quiz-score";
  result.textContent = `${quizScore} / ${quizWords.length}`;

  const message = document.createElement("p");

  if (quizScore === quizWords.length) {
    message.textContent =
      "All correct! You know your words.";
  } else {
    message.textContent =
      "Keep going! Revisit the words and try again.";
  }

  const restartButton = document.createElement("button");
  restartButton.type = "button";
  restartButton.className = "button button-primary";
  restartButton.textContent = "Try again ↻";

  restartButton.addEventListener("click", () => {
    startQuiz();

    const question =
      practiceContainer.querySelector(".quiz-question");

    if (question) {
      question.focus({ preventScroll: true });
    }
  });

  practiceContainer.append(
    heading,
    result,
    message,
    restartButton
  );

  heading.focus({ preventScroll: true });
}


// ========================================
// 10. KATEGORİ DEĞİŞİMİ
// ========================================

categorySelect.addEventListener("change", () => {
  currentWords = vocabulary.filter((item) =>
    matchesCategory(item, categorySelect.value)
  );

  currentWordIndex = 0;

  showWord();
  startQuiz();
});


// ========================================
// 11. İLK AÇILIŞ
// ========================================

showWord();
startQuiz();
// ========================================
// GÖRSELE TIKLAYINCA BÜYÜK AÇMA
// ========================================

// Görseli klavyeyle de kullanılabilen bir düğmeye al.
const zoomTrigger = document.createElement("button");

zoomTrigger.type = "button";
zoomTrigger.className = "meme-zoom-trigger";
zoomTrigger.setAttribute("aria-label", "Enlarge meme image");
zoomTrigger.setAttribute("aria-haspopup", "dialog");
zoomTrigger.hidden = true;

memeImage.replaceWith(zoomTrigger);
zoomTrigger.appendChild(memeImage);

// Büyük görsel penceresi.
const memeDialog = document.createElement("dialog");

memeDialog.className = "meme-dialog";
memeDialog.setAttribute("aria-labelledby", "meme-dialog-title");

memeDialog.innerHTML = `
  <div class="meme-dialog-toolbar">
    <h2 class="meme-dialog-title" id="meme-dialog-title"></h2>

    <button
      class="button button-secondary"
      id="meme-dialog-close"
      type="button"
      autofocus
    >
      Close ✕
    </button>
  </div>

  <img class="meme-dialog-image" alt="">
`;

document.body.appendChild(memeDialog);

const largeMemeImage =
  memeDialog.querySelector(".meme-dialog-image");

const largeMemeTitle =
  memeDialog.querySelector(".meme-dialog-title");

const closeMemeButton =
  memeDialog.querySelector("#meme-dialog-close");

// Görsel hazır değilken boş bir düğme görünmesin.
function updateZoomTrigger() {
  zoomTrigger.hidden =
    memeImage.hidden || !memeImage.getAttribute("src");
}

// Mevcut kod görseli değiştirdiğinde düğmeyi de güncelle.
const memeImageObserver =
  new MutationObserver(updateZoomTrigger);

memeImageObserver.observe(memeImage, {
  attributes: true,
  attributeFilter: ["hidden", "src"]
});

updateZoomTrigger();

// Görsele basınca büyük pencereyi aç.
zoomTrigger.addEventListener("click", () => {
  if (
    memeImage.hidden ||
    !memeImage.complete ||
    memeImage.naturalWidth === 0
  ) {
    return;
  }

  largeMemeTitle.textContent = wordTitle.textContent;
  largeMemeImage.src = memeImage.src;
  largeMemeImage.alt = memeImage.alt;

  memeDialog.showModal();
  memeDialog.scrollTop = 0;

  document.body.classList.add("meme-dialog-open");
});

// Close düğmesi.
closeMemeButton.addEventListener("click", () => {
  memeDialog.close();
});

// Pencerenin dışındaki karanlık alana basınca kapat.
memeDialog.addEventListener("click", (event) => {
  if (event.target !== memeDialog) return;

  const bounds = memeDialog.getBoundingClientRect();

  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedOutside) {
    memeDialog.close();
  }
});

// Esc ile veya düğmeyle kapanınca sayfayı normale döndür.
memeDialog.addEventListener("close", () => {
  document.body.classList.remove("meme-dialog-open");

  largeMemeImage.removeAttribute("src");

  if (!zoomTrigger.hidden) {
    zoomTrigger.focus({ preventScroll: true });
  }
});