document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawPhone = params.get("p_phone") || "";
  const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone.replace(/\D/g, "")}`;

  if (!formattedPhone) return;

  try {
    const response = await fetch(`https://acro-ghl-estimate.dennis-e64.workers.dev/?phone=${encodeURIComponent(formattedPhone)}`);
    const result = await response.json();
    const contact = result.contact;
    if (!contact) return;

    const showIfYes = (field, sectionId) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = "block";
      }
    };

    showIfYes("basic_submit", "basic-section");
    showIfYes("roofing_submit", "roofing-section");
    showIfYes("siding_submit", "siding-section");
    showIfYes("windows_submit", "windows-section");

    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    const additionalName = (additionalFirst || additionalLast) ? ` + ${additionalFirst} ${additionalLast}`.trim() : "";

    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const postalCode = contact.postal_code || "";
    const fullAddress = `${contact.address1 || ""}, ${contact.city || ""} ${contact.state || ""} ${contact.postal_code || ""}`.trim();


    document.getElementById("contact-full-name-display").textContent = fullName + additionalName;
    document.getElementById("contact-full-name-signature").textContent = fullName + additionalName;
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";
    document.getElementById("address").textContent = contact["Address"] || "";
    document.getElementById("city").textContent = contact["Address"] || "";
    document.getElementById("state").textContent = contact["Address"] || "";
    document.getElementById("postal-code").textContent = contact["Address"] || "";
    


    
    document.getElementById("field-roof-size").textContent = contact["Roof Size (square footage)"] || "";
    document.getElementById("field-roof-pitch").textContent = contact["Roof pitch/slope"] || "";
    document.getElementById("field-siding-type").textContent = contact["Type of New Siding"] || "";
    document.getElementById("field-siding-color").textContent = contact["Siding Brand/Model/Color"] || "";
    document.getElementById("field-window-style").textContent = contact["Type of Windows"] || "";
    document.getElementById("field-num-windows").textContent = contact["Number of Windows"] || "";

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
