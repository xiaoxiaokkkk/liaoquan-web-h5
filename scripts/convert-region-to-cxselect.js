import fs from "node:fs";

function pickSourceJson() {
  const files = fs.readdirSync(".").filter((f) => f.toLowerCase().endsWith(".json"));
  for (const file of files) {
    if (file === "china-province-and-city-data-cxSelect.json") continue;
    const text = fs.readFileSync(file, "utf8").trim();
    if (!text.startsWith("{")) continue;
    if (!text.includes('"items"') || !text.includes('"val"')) continue;
    return file;
  }
  throw new Error("No source JSON matching province-city-code structure was found.");
}

function districtNode(name, value) {
  return { n: name, v: String(value) };
}

function cityNode(name, node) {
  if (typeof node === "string" || typeof node === "number") {
    return { n: name, v: String(node), s: [] };
  }

  const items = (node && node.items) || {};
  const districts = Object.entries(items).map(([districtName, districtValue]) => {
    if (districtValue && typeof districtValue === "object" && "val" in districtValue) {
      return {
        n: districtName,
        v: String(districtValue.val),
        s: Object.entries(districtValue.items || {}).map(([name2, value2]) =>
          districtNode(name2, value2)
        ),
      };
    }
    return districtNode(districtName, districtValue);
  });

  return {
    n: name,
    v: String((node && node.val) || ""),
    s: districts,
  };
}

function main() {
  const src = pickSourceJson();
  const dst = "province-city-code-cxselect.json";
  const input = JSON.parse(fs.readFileSync(src, "utf8"));

  const output = Object.entries(input).map(([provinceName, provinceValue]) => {
    if (typeof provinceValue === "string" || typeof provinceValue === "number") {
      return { n: provinceName, v: String(provinceValue), s: [] };
    }
    return {
      n: provinceName,
      v: String((provinceValue && provinceValue.val) || ""),
      s: Object.entries((provinceValue && provinceValue.items) || {}).map(([cityName, cityValue]) =>
        cityNode(cityName, cityValue)
      ),
    };
  });

  fs.writeFileSync(dst, JSON.stringify(output, null, 4), "utf8");
  console.log(`Written ${dst} from ${src}, provinces: ${output.length}`);
}

main();
