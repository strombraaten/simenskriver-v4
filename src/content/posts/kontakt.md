---
title: Kontakt
description: Send meg en melding
permalink: kontakt
noIndex: true
hideTOC: true
aliases:
  - kontakt-meg
  - contact
---

Send meg en melding. 

<form   
  name="contact"   
  method="POST"   
  data-netlify="true"   
  netlify-honeypot="bot-field"
  action="/thank-you"  
  class="form-sleek"  
>  
  <!-- Hidden honeypot field for spam protection -->  
  <input type="hidden" name="bot-field" />  
    
  <!-- Hidden form name field (required for Netlify) -->  
  <input type="hidden" name="form-name" value="contact" />  
    
  <input   
    type="text"   
    id="name"   
    name="name"   
    required   
    class="w-full"   
    placeholder="Navn"  
  />  
    
  <input   
    type="email"   
    id="email"   
    name="email"   
    required   
    class="w-full"   
    placeholder="Epost"  
  />  
    
  <textarea   
    id="message"   
    name="message"   
    rows="4"   
    required   
    class="w-full"   
    placeholder="Melding"  
  ></textarea>  
    
  <button type="submit" class="btn btn-primary w-full">  
    Send melding  
  </button>  
</form>
