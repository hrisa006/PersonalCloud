import { message } from "antd";

export async function customHttpRequest<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(input, init);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${error.message}`);
    }

    const contentType = res.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      const text = await res.text();
      return text as unknown as T;
    }
  } catch (err: any) {
    message.error(`Неуспешна заявка: ${err.message}`);
    throw err;
  }
}

export async function customHttpBlobRequest(
  input: RequestInfo,
  init?: RequestInit
): Promise<Blob> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.blob();
  } catch (err: any) {
    message.error(`Неуспешна заявка: ${err.message}`);
    throw err;
  }
}
