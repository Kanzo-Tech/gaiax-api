export async function fetchCredential(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();

    console.log(`Response from ${url}:`, text.substring(0, 100));

    const cleanText = text.trim().replace(/^\uFEFF/, "");

    if (!cleanText) {
      throw new Error("Empty response");
    }

    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error(`Error fetching credential from ${url}:`, error);
    throw new Error(`Failed to fetch credential: ${error.message}`);
  }
}
