export function randomColor() {
  const random = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + random;
}

export function handleNumberPress(event: any) {
  let regex = new RegExp("^[0-9.]+$");
  let charCode = event.key;
  if (!regex.test(charCode)) {
    event.preventDefault();
    return false;
  }
}

export const formatterNumber = (val?: string | number, unit?: string) => {
  if (!val) return unit ?? "";
  let value = `${val}`
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    .replace(/\.(?=\d{0,2}$)/g, ".");
  if (unit) value = value + unit;
  return value;
};

export const parserNumber = (val?: string, unit?: string) => {
  if (!val) return "";
  let value = Number.parseFloat(
    val.replace(/\$\s?|(\,*)/g, "").replace(/(\.{2})/g, ",")
  ).toFixed(2);
  if (unit) value = value!.replace(unit, "");
  return value;
};
