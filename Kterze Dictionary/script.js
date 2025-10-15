let data = [];

fetch("data/dictionary.json")
  .then(res => res.json())
  .then(json => {
    data = json;
  });

document.getElementById("search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  const matches = data.filter(entry => entry.word.toLowerCase().includes(term));
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = matches.map(entry => `
    <div class="entry">
      <h2>${entry.word}</h2>
      <p><strong>${entry.pos}</strong> — ${entry.gloss}</p>
      <p>${entry.definition}</p>
      ${entry.examples.map(ex => `<p><em>${ex}</em></p>`).join("")}
    </div>
  `).join("");
});

function renderEntry(entry) {
  return `
    <div class="entry">
      <h2>${entry.word}</h2>
      <p class="pos">${entry.pos}</p>
      <div class="senses">
        ${entry.senses.map((s, i) => `
          <div class="sense">
            <p><strong>${i + 1}. ${s.gloss}</strong> — ${s.definition}</p>
            ${s.note ? `<p class="note">${s.note}</p>` : ""}
            ${s.examples.length ? `
              <ul class="examples">
                ${s.examples.map(ex => `<li>❖ ${ex}</li>`).join("")}
              </ul>
            ` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}