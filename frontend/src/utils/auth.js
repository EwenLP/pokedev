export const TOKEN_KEY = "token";
export const CURRENT_TEAM_KEY = "current_team_id";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn("localStorage quota exceeded, clearing cache and retrying...");
    localStorage.removeItem("pokedex_all_pokemon");
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (secondError) {
      localStorage.clear();
      localStorage.setItem(TOKEN_KEY, token);
    }
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_TEAM_KEY);
  localStorage.removeItem("pokedex_all_pokemon");
  localStorage.removeItem("pokedex_all_pokemon_v2");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getCurrentTeamId() {
  return localStorage.getItem(CURRENT_TEAM_KEY);
}

export function setCurrentTeamId(id) {
  if (!id) {
    localStorage.removeItem(CURRENT_TEAM_KEY);
    return;
  }

  localStorage.setItem(CURRENT_TEAM_KEY, String(id));
}
