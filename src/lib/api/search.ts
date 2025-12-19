// /lib/api/search.ts

function removeVietnameseTone(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase();
}

export async function searchProducts(q: string) {
  if (!q || q.trim() === "") {
    return { success: true, data: [] };
  }

  const normalizedQ = removeVietnameseTone(q);

  try {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(normalizedQ)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Search API failed");

    return await res.json();
  } catch (err) {
    console.error("searchProducts error:", err);
    return { success: false, data: [] };
  }
}
