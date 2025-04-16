document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  let rawPhone = params.get("p_phone");

  if (!rawPhone) {
    console.warn("No phone passed in URL");
    return;
  }

  // Normalize: remove spaces and extra + signs
  rawPhone = decodeURIComponent(rawPhone).replace(/\s/g, "").replace(/\+/g, "");
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

  console.log("Raw phone param:", rawPhone);
  console.log("Digits only:", digitsOnly);
  console.log("Formatted phone:", formattedPhone);

  if (digitsOnly.length < 10) {
    console.error("Invalid phone number.");
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

    // Show sections based on *_submit
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

    // Full name + optional additional name
    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    const additionalName = (additionalFirst || additionalLast)
      ? ` + ${additionalFirst} ${additionalLast}`.trim()
      : "";

    const displayName = `${fullName}${additionalName}`;
    document.getElementById("contact-full-name-display").textContent = displayName;
    document.getElementById("contact-full-name-signature").textContent = displayName;

    if (additionalFirst || additionalLast) {
      document.getElementById("additional-signature").style.display = "block";
      document.getElementById("additional-name-display").textContent = `${additionalFirst} ${additionalLast}`.trim();
    }

    // Address formatting
    const addressParts = [
      contact.address1,
      contact.city,
      contact.state,
      contact.postal_code
    ].filter(Boolean); // remove empty items
    document.getElementById("fullAddress").textContent = addressParts.join(", ");

    // Other fields
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";

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
