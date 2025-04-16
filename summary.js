document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawPhone = decodeURIComponent(params.get("phone") || params.get("p_phone") || "").trim();

  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

  console.log("Raw phone:", rawPhone);
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

    if (!contact) {
      console.warn("No contact found.");
      return;
    }

    // Show sections
    const showIfYes = (field, sectionId) => {
      if (contact[field]?.toLowerCase() === "yes") {
        const el = document.getElementById(sectionId);
        if (el) el.style.display = "block";
      }
    };

    showIfYes("basic_submit", "basic-section");
    showIfYes("roofing_submit", "roofing-section");
    showIfYes("siding_submit", "siding-section");
    showIfYes("windows_submit", "windows-section");

    // Basic info
    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    const additionalName = (additionalFirst || additionalLast) ? ` + ${additionalFirst} ${additionalLast}` : "";
    const displayName = fullName + additionalName;

    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const zip = contact.postal_code || "";
    const fullAddress = `${address1}${city ? ", " + city : ""}${state ? " " + state : ""}${zip ? " " + zip : ""}`;

    document.getElementById("contact-full-name-display").textContent = displayName;
    document.getElementById("contact-full-name-signature")?.textContent = displayName;
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";
    document.getElementById("field-address").textContent = fullAddress;

    // Roofing
    document.getElementById("field-roof-size").textContent = contact["Roof Size (square footage)"] || "";
    document.getElementById("field-roof-pitch").textContent = contact["Roof pitch/slope"] || "";

    // Siding
    document.getElementById("field-siding-type").textContent = contact["Type of New Siding"] || "";
    document.getElementById("field-siding-color").textContent = contact["Siding Brand/Model/Color"] || "";

    // Windows
    document.getElementById("field-window-style").textContent = contact["Type of Windows"] || "";
    document.getElementById("field-num-windows").textContent = contact["Number of Windows"] || "";

    // Additional Signature
    if (additionalFirst || additionalLast) {
      const extraSig = document.getElementById("additional-signature");
      const nameSpan = document.getElementById("additional-name-display");
      if (extraSig && nameSpan) {
        extraSig.style.display = "block";
        nameSpan.textContent = `${additionalFirst} ${additionalLast}`.trim();
      }
    }
  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
