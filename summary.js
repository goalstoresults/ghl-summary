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

    // Show sections if *_submit is "yes"
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

    // Format name + additional name
    const fullName = contact.full_name || "";
    const additionalFirst = contact["Additional First Name"]?.trim() || "";
    const additionalLast = contact["Additional Last Name"]?.trim() || "";
    const additionalName = [additionalFirst, additionalLast].filter(Boolean).join(" ");
    const combinedName = [fullName, additionalName].filter(Boolean).join(" + ");

    document.getElementById("contact-full-name-display").textContent = combinedName;
    document.getElementById("contact-full-name-signature")?.textContent = combinedName;

    if (additionalName) {
      document.getElementById("additional-signature").style.display = "block";
      document.getElementById("additional-name-display").textContent = additionalName;
    }

    // Phone & email
    document.getElementById("field-phone").textContent = contact.phone || "";
    document.getElementById("field-email").textContent = contact.email || "";

    // Address
    const addressParts = [];
    if (contact.address1) addressParts.push(contact.address1);
    if (contact.city) addressParts.push(contact.city);
    if (contact.state) addressParts.push(contact.state);
    if (contact.postal_code) addressParts.push(contact.postal_code);
    const fullAddress = addressParts.join(", ");
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

  } catch (err) {
    console.error("Failed to fetch contact:", err);
  }
});
