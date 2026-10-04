<%*
// Publiserer innlegget: lager permalink fra tittel, gir filen nytt navn,
// setter draft: false og dagens dato (bare første gang).
const file = tp.config.target_file;
const fm = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
const title = String(fm.title ?? "").trim();

if (!title) {
  new Notice("Fyll inn title før du publiserer.");
} else {
  const slugify = (s) => s.toLowerCase()
    .replace(/æ/g, "a").replace(/ø/g, "o").replace(/å/g, "a")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Eksisterende permalink endres aldri, så gamle lenker ikke brekker
  const slug = String(fm.permalink ?? "").trim() || slugify(title);
  const firstPublish = fm.draft !== false;

  await app.fileManager.processFrontMatter(file, (f) => {
    f.permalink = slug;
    f.draft = false;
    if (firstPublish) f.date = tp.date.now("YYYY-MM-DD");
  });

  const target = `${file.parent.path}/${slug}.md`;
  if (file.basename !== slug && !app.vault.getAbstractFileByPath(target)) {
    await app.fileManager.renameFile(file, target);
  }
  new Notice(`Publisert som /posts/${slug}/ – push med Cmd+Shift+S`);
}
-%>
