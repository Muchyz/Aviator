export const fKES = n =>
  `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fTime = d =>
  d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
export const fDate = d =>
  d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
export const cbCls = v => v >= 10 ? "hi" : v >= 2 ? "mi" : "lo";