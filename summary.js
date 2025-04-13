document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const rawPhone = params.get("phone") || "";
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const formattedPhone = digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`;

  console.log("Raw phone:", rawPhone);
  console.log("Formatted phone:", formattedPhone);

  if (!formattedPhone) return;

  try {
    const response = await fetch(`https://acro-ghl-estimate.dennis-e64.workers.dev/?phone=${encodeURIComponent(formattedPhone)}`);
    const result = await response.json();
    console.log("Fetched result:", result);

    const contact = result.contact;
    if (!contact) {
      console.warn("No contact found for this phone.");
      return;
    }

    // Section visibility based on *_submit fields
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

    // Basic info
    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    
    let additionalName = "";
    if (additionalFirst || additionalLast) {
      additionalName = ` + ${additionalFirst} ${additionalLast}`.trim();
    }

    document.getElementById("contact-full-name-display").textContent = `${fullName}${additionalName}`;
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";


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
