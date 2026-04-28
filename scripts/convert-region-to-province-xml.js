import fs from "node:fs";

function pickSourceJson() {
  const files = fs.readdirSync(".").filter((f) => f.toLowerCase().endsWith(".json"));
  for (const file of files) {
    if (file === "china-province-and-city-data-cxSelect.json") continue;
    if (file === "province-city-code-cxselect.json") continue;
    const text = fs.readFileSync(file, "utf8").trim();
    if (!text.startsWith("{")) continue;
    if (!text.includes('"items"') || !text.includes('"val"')) continue;
    return file;
  }
  throw new Error("No source JSON matching province-city-code structure was found.");
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildDistrictLines(cityItems) {
  const lines = [];
  for (const [districtName, districtValue] of Object.entries(cityItems || {})) {
    if (districtValue && typeof districtValue === "object" && "val" in districtValue) {
      lines.push(
        `      <district name="${xmlEscape(districtName)}" zipcode="${xmlEscape(districtValue.val)}" />`
      );
      continue;
    }
    lines.push(
      `      <district name="${xmlEscape(districtName)}" zipcode="${xmlEscape(districtValue)}" />`
    );
  }
  return lines;
}

function main() {
  const src = pickSourceJson();
  const dst = "province_data_from_codes.xml";
  const input = JSON.parse(fs.readFileSync(src, "utf8"));

  const lines = ["<root>"];
  for (const [provinceName, provinceNode] of Object.entries(input)) {
    const provinceZipcode =
      provinceNode && typeof provinceNode === "object" && "val" in provinceNode
        ? provinceNode.val
        : "";

    lines.push(
      `  <province name="${xmlEscape(provinceName)}" zipcode="${xmlEscape(provinceZipcode)}">`
    );

    const provinceItems =
      provinceNode && typeof provinceNode === "object" && provinceNode.items ? provinceNode.items : {};

    for (const [cityName, cityNode] of Object.entries(provinceItems)) {
      const cityZipcode =
        cityNode && typeof cityNode === "object" && "val" in cityNode ? cityNode.val : cityNode;
      lines.push(`    <city name="${xmlEscape(cityName)}" zipcode="${xmlEscape(cityZipcode)}">`);

      const cityItems =
        cityNode && typeof cityNode === "object" && cityNode.items ? cityNode.items : {};
      lines.push(...buildDistrictLines(cityItems));

      lines.push("    </city>");
    }

    lines.push("  </province>");
  }
  lines.push("</root>");
  lines.push("");

  fs.writeFileSync(dst, lines.join("\n"), "utf8");
  console.log(`Written ${dst} from ${src}`);
}

main();
