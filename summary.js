document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);

  const rawPhone = decodeURIComponent(params.get("phone") || params.get("p_phone") || "").trim();
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

  console.log("URL:", window.location.href);
  console.log("Search:", window.location.search);
  console.log("Raw phone param:", rawPhone);
  console.log("Digits only:", digitsOnly);
  console.log("Formatted phone:", formattedPhone);

  if (!digitsOnly) {
    console.warn("Invalid phone number.");
    return;
  }

  try {
    const response = await fetch(`https://acro-ghl-estimate.dennis-e64.workers.dev/?phone=${encodeURIComponent(formattedPhone)}`);
    const result = await response.json();
    const contact = result.contact;

    console.log("Fetched result:", result);
    if (!contact) {
      console.warn("No contact found for this phone.");
      return;
    }

    const showIfYes = (field, sectionId) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = "block";
        console.log(`Showing section: ${sectionId}`);
      } else {
        console.log(`NOT showing section: ${sectionId} (value: ${contact[field]})`);
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

    const fullDisplayName = `${fullName}${additionalName}`;
    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const postalCode = contact.postal_code || "";
    const fullAddress = `${address1}${city ? ", " + city : ""}${state ? " " + state : ""}${postalCode ? " " + postalCode : ""}`.trim();

    document.getElementById("contact-full-name-display").textContent = fullDisplayName;
    document.getElementById("contact-full-name-signature")?.textContent = fullDisplayName;
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";
    document.getElementById("fullAddress").textContent = fullAddress;

    // Roofing
    document.getElementById("field-roof-size").textContent = contact["Roof Size (square footage)"] || "";
    document.getElementById("field-roof-pitch").textContent = contact["Roof pitch/slope"] || "";

    // Siding
    document.getElementById("field-siding-type").textContent = contact["Type of New Siding"] || "";
    document.getElementById("field-siding-color").textContent = contact["Siding Brand/Model/Color"] || "";

    // Windows
    document.getElementById("field-window-style").textContent = contact["Type of Windows"] || "";
    document.getElementById("field-num-windows").textContent = contact["Number of Windows"] || "";

    // Show additional signature section if extra name exists
    if (additionalFirst || additionalLast) {
      const additionalSection = document.getElementById("additional-signature");
      const additionalSpan = document.getElementById("additional-name-display");
      if (additionalSection && additionalSpan) {
        additionalSection.style.display = "block";
        additionalSpan.textContent = `${additionalFirst} ${additionalLast}`;
      }
    }

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
