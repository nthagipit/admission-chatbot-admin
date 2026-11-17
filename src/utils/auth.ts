export const LocalStorageEventTarget = new EventTarget();

export const getAccessTokenFromLS = () =>
  localStorage.getItem("access_token") || "";

export const getRefreshTokenFromLS = () =>
  localStorage.getItem("refresh_token") || "";

export const setProfileToLS = (profile: string) => {
  localStorage.setItem("profile", JSON.stringify(profile));
};

export const getProfileFromLS = () => {
  try {
    const result = localStorage.getItem("profile");
    return result && result !== "undefined" ? JSON.parse(result) : null;
  } catch {
    return null;
  }
};

export const setAccessTokenToLS = (access_token: string) => {
  localStorage.setItem("access_token", access_token);
};

export const setRefreshTokenToLS = (refresh_token: string) => {
  localStorage.setItem("refresh_token", refresh_token);
};

export const clearFromLS = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("profile");
  const eventLS = new Event("clearLS");
  LocalStorageEventTarget.dispatchEvent(eventLS);
};
