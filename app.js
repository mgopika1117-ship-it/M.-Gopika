const $ = id => document.getElementById(id);
let lastComic = null;

$("generate").addEventListener("click", async () => {
  const idea = $("idea").value.trim();
  if (!idea) {
    $("status").textContent = "Please enter a story idea.";
    return;
  }

  $("generate").disabled = true;
  $("status").textContent = "Creating your comic with Gemini...";
  $("result").innerHTML = '<div class="empty"><div class="empty-icon">✨</div><h3>Writing your story...</h3><p>Creating characters, panels and dialogue.</p></div>';

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        idea,
        genre: $("genre").value,
        panels: $("panels").value,
        characters: $("characters").value
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Generation failed.");

    lastComic = data;
    renderComic(data);
    $("download").disabled = false;
    $("status").textContent = "Comic created successfully!";
  } catch (err) {
    $("result").innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><h3>Something went wrong</h3><p class="error">${escapeHtml(err.message)}</p></div>`;
    $("status").textContent = "";
  } finally {
    $("generate").disabled = false;
  }
});

$("download").addEventListener("click", () => {
  if (!lastComic) return;
  const blob = new Blob([JSON.stringify(lastComic, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(lastComic.title || "comiccraft-comic").replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

function renderComic(c) {
  const characters = (c.characters || []).map(x =>
    `<div class="character"><strong>${escapeHtml(x.name)}</strong><br>${escapeHtml(x.role)}</div>`
  ).join("");

  const panels = (c.panels || []).map(p => {
    const dialogue = (p.dialogue || []).map(d =>
      `<p><strong>${escapeHtml(d.speaker)}:</strong> ${escapeHtml(d.text)}</p>`
    ).join("");
    return `<article class="panel">
      <div class="panel-top"><span class="panel-number">PANEL ${p.panel}</span></div>
      <div class="scene">${escapeHtml(p.scene)}</div>
      ${p.caption ? `<div class="caption">${escapeHtml(p.caption)}</div>` : ""}
      ${dialogue ? `<div class="dialogue">${dialogue}</div>` : ""}
      ${p.image_prompt ? `<div class="prompt">🎨 Image prompt: ${escapeHtml(p.image_prompt)}</div>` : ""}
    </article>`;
  }).join("");

  $("result").innerHTML = `
    <h1 class="comic-title">${escapeHtml(c.title || "Untitled Comic")}</h1>
    <p class="logline">${escapeHtml(c.logline || "")}</p>
    <div class="character-list">${characters}</div>
    ${panels}
  `;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}
