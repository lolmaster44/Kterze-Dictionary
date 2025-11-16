let entries = [];

const customAlphabet = [
  "A", "Á", "B", "C", "Ch", "D", "Ð", "E", "É", "F", "G", "H", "İ", "Í", "I",
  "J", "K", "K̦", "L", "M", "N", "O", "Ó", "Ö", "P", "Q", "R", "RZ", "Ř", "S", "Sz", "T",
  "Þ", "U", "Ú", "V", "W", "X", "Y", "Ý", "Z", "-"
];

function customSort(a, b) {
  const normalize = (str) => str.normalize("NFC").toUpperCase();
  const aChars = Array.from(normalize(a.word));
  const bChars = Array.from(normalize(b.word));

  const len = Math.max(aChars.length, bChars.length);
  for (let i = 0; i < len; i++) {
    const aChar = aChars[i] || "";
    const bChar = bChars[i] || "";
    if (aChar === bChar) continue;

    const aIndex = customAlphabet.indexOf(aChar);
    const bIndex = customAlphabet.indexOf(bChar);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

    if (aIndex === -1 || bIndex === -1)
      return aChar.localeCompare(bChar, "en", { sensitivity: "variant" });
  }

  return 0;
}

fetch("data/dictionary.json")
  .then(res => res.json())
  .then(data => {
    entries = data.sort(customSort);
    renderDictionary(entries);
  })
  .catch(err => console.error("Error loading dictionary:", err));

function renderDictionary(list) {
  const container = document.getElementById("dictionary");
  container.innerHTML = "";

  let currentLetter = "";

  list.forEach(entry => {
    const word = entry.word.normalize("NFC").trim();
    const firstLetter = Array.from(word)[0].toUpperCase();

    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      const header = document.createElement("h2");
      header.textContent = currentLetter;
      header.classList.add("letter-header");
      container.appendChild(header);
    }

    container.insertAdjacentHTML("beforeend", renderEntry(entry));
  });

  if (list.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
  }

  updateWordCount(list);
}

function renderEntry(entry) {
  let etyHTML = "";
  if (entry.ety) {
    etyHTML = entry.ety.replace(
      /<b>(.*?)<\/b>/g,
      '<span class="ety-link" data-ref="$1">$1</span>'
    );
  }

  return `
    <div class="entry" id="${entry.word}">
      <h3>${entry.word}</h3>
      ${entry.ipa ? `<p class="ipa">${entry.ipa}</p>` : ""}
      ${etyHTML ? `<p class="ety">${etyHTML}</p>` : ""}
      ${entry.notes && entry.notes.filter(n => n.trim() !== "").length ? entry.notes
        .filter(n => n.trim() !== "")
        .map(n => `<p class="notes">${n}</p>`)
        .join('')
      : ""}
      <div class="senses">
        ${entry.senses
          .map(
            (s, i) => `
          <div class="sense">
            <p><strong>${i + 1}.</strong> ${s.def}</p>
            ${
              s.eg && s.eg.length
                ? `
              <ul class="examples">
                ${s.eg.map((ex) => `<li>${ex}</li>`).join("")}
              </ul>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("ety-link")) {
    const ref = e.target.dataset.ref.toLowerCase();
    const allTargets = document.querySelectorAll("[id]");
    const target = Array.from(allTargets).find(
      (el) => el.id.toLowerCase() === ref
    );

    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("highlight");
      setTimeout(() => target.classList.remove("highlight"), 1200);
    }
  }
});

document.getElementById("search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();

  const filtered = entries.filter(entry =>
    entry.word.toLowerCase().includes(term) ||
    entry.senses.some(s => s.def.toLowerCase().includes(term))
  );

  renderDictionary(filtered);
});

function updateWordCount(list) {
  const container = document.getElementById("word-count");
  container.textContent = `Total entries: ${list.length}`;
}