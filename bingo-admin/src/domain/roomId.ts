const ROOM_ID_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const ROOM_ID_LENGTH = 15;

const getCrypto = () => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return crypto;
  }

  return null;
};

export const generateRoomId = (): string => {
  const characters = ROOM_ID_CHARSET.length;
  const buffer: string[] = new Array(ROOM_ID_LENGTH);
  const cryptoInstance = getCrypto();

  if (cryptoInstance) {
    const randomValues = cryptoInstance.getRandomValues(new Uint32Array(ROOM_ID_LENGTH));
    randomValues.forEach((value, index) => {
      buffer[index] = ROOM_ID_CHARSET[value % characters];
    });
  } else {
    for (let index = 0; index < ROOM_ID_LENGTH; index += 1) {
      const randomIndex = Math.floor(Math.random() * characters);
      buffer[index] = ROOM_ID_CHARSET[randomIndex];
    }
  }

  return buffer.join("");
};

export const buildMemberUrlWithRoomId = (baseUrl: string, roomId: string): string => {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("roomId", roomId);
    return url.toString();
  } catch {
    const delimiter = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${delimiter}roomId=${encodeURIComponent(roomId)}`;
  }
};
