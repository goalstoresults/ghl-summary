document.addEventListener("DOMContentLoaded", async () => {
  const phoneParam = new URLSearchParams(window.location.search).get("p_phone");
  if (!phoneParam) return;

  const res = await fetch(`https://acro-ghl-estimate.dennis-e64.workers.dev/?phone=${encodeURIComponent(phoneParam)}`);
  const result = await res.json();
  const contact = result.contact;
  if (!contact) return;

  const showIfYes = (field, sectionId) => {
    if (contact[field] && contact[field].toLowerCase() === "yes") {
      const section = document.getElementById(sectionId);
      if (section) section.style.display = "block";
    }
  };

  showIfYes("roofing_submit", "roofing-section");

  document.getElementById("field-full-name").textContent = contact.full_name || "";
  document.getElementById("field-email").textContent = contact.email || "";
  document.getElementById("field-phone").textContent = contact.phone || "";
  document.getElementById("field-roof-size").textContent = contact["Roof Size (square footage)"] || "";
  document.getElementById("field-roof-pitch").textContent = contact["Roof pitch/slope"] || "";
});
