document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawPhone = (params.get("p_phone") || params.get("phone") || "").trim();
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

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
    console.log("Fetched result:", result);

    const contact = result.contact;
    if (!contact) {
      console.warn("No contact found for this phone.");
      return;
    }

    // Show sections conditionally
    const showIfYes = (field, sectionId) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = "block";
        console.log(`Showing section: ${sectionId}`);
      }
    };

    showIfYes("basic_submit", "basic-section");
    showIfYes("roofing_submit", "roofing-section");
    showIfYes("siding_submit", "siding-section");
    showIfYes("windows_submit", "windows-section");

    // Full name with additional signer (if exists)
    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    const additionalName = (additionalFirst || additionalLast) ? ` + ${additionalFirst} ${additionalLast}`.trim() : "";

    document.getElementById("contact-full-name-display").textContent = `${fullName}${additionalName}`;
    document.getElementById("contact-full-name-signature").textContent = `${fullName}${additionalName}`;

    // Conditionally show second signature block
    if (additionalFirst || additionalLast) {
      const additionalBlock = document.getElementById("additional-signature");
      const nameDisplay = document.getElementById("additional-name-display");
      if (additionalBlock && nameDisplay) {
        additionalBlock.style.display = "block";
        nameDisplay.textContent = `${additionalFirst} ${additionalLast}`.trim();
      }
    }

    // Basic contact info
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";

    // Address formatting
    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const postalCode = contact.postal_code || "";
    const fullAddress = `${address1}${city ? ", " + city : ""}${state ? " " + state : ""}${postalCode ? " " + postalCode : ""}`.trim();
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

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
