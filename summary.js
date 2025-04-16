document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawPhoneParam = params.get("p_phone") || "";
  const digitsOnly = rawPhoneParam.replace(/\D/g, "");
  const formattedPhone = digitsOnly.length === 11 && digitsOnly.startsWith("1")
    ? `+${digitsOnly}`
    : `+1${digitsOnly}`;

  console.log("Raw phone param:", rawPhoneParam);
  console.log("Digits only:", digitsOnly);
  console.log("Formatted phone:", formattedPhone);

  if (digitsOnly.length < 10) {
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

    // Section visibility based on *_submit fields
    const showIfYes = (field, sectionId) => {
      const val = contact[field]?.toLowerCase();
      if (val === "yes") {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = "block";
        console.log(`Showing ${sectionId}`);
      } else {
        console.log(`Not showing ${sectionId} — value:`, val);
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
    const additionalName = (additionalFirst || additionalLast)
      ? ` + ${additionalFirst} ${additionalLast}`.trim()
      : "";

    document.getElementById("contact-full-name-display").textContent = `${fullName}${additionalName}`;
    document.getElementById("contact-full-name-signature").textContent = `${fullName}${additionalName}`;

    if ((additionalFirst || additionalLast) && document.getElementById("additional-signature")) {
      document.getElementById("additional-signature").style.display = "block";
      document.getElementById("additional-name-display").textContent = `${additionalFirst} ${additionalLast}`.trim();
    }

    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";

    const address1 = contact.address1 || "";
    const city = contact.city || "";
    const state = contact.state || "";
    const postalCode = contact.postal_code || "";
    const fullAddress = `${address1}, ${city} ${state}${postalCode ? " " + postalCode : ""}`;
    const fullAddressElement = document.getElementById("fullAddress");
    if (fullAddressElement) fullAddressElement.textContent = fullAddress.trim();

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
