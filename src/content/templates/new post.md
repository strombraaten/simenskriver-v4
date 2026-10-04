<%*
const title = (await tp.system.prompt("Tittel")) || "Uten tittel";
const slug = title.toLowerCase()
  .replace(/æ/g, "a").replace(/ø/g, "o").replace(/å/g, "a")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const folder = tp.file.folder(true);
if (!app.vault.getAbstractFileByPath(`${folder}/${slug}.md`)) {
  await tp.file.rename(slug);
}
-%>
---
title: "<% title.replace(/"/g, '\\"') %>"
date: <% tp.date.now("YYYY-MM-DD") %>
permalink: "<% slug %>"
description: ""
tags: []
hideTOC: false
targetKeyword: ""
draft: true
---

