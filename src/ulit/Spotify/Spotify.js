// const clientID = "de83f921a25b43f49153b0498b041bfa";
// const redirectUrl = "http://127.0.0.1:3000";

// const scopes = [
//   "playlist-modify-public",
//   "playlist-modify-private",
// ].join(" ");

// function generateCodeVerifier() {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
//   const randomValues = new Uint8Array(64);
//   window.crypto.getRandomValues(randomValues);

//   return Array.from(
//     randomValues,
//     (value) => characters[value % characters.length]
//   ).join("");
// }

// async function generateCodeChallenge(verifier) {
//   const data = new TextEncoder().encode(verifier);
//   const digest = await window.crypto.subtle.digest("SHA-256", data);

//   return btoa(String.fromCharCode(...new Uint8Array(digest)))
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=+$/, "");
// }

// const Spotify = {
//   async getAccessToken() {
//     const savedToken = localStorage.getItem("spotify_access_token");
//     const expiry = Number(
//       localStorage.getItem("spotify_token_expiry") || 0
//     );

//     if (savedToken && Date.now() < expiry - 60000) {
//       return savedToken;
//     }

//     const url = new URL(window.location.href);
//     const code = url.searchParams.get("code");

//     if (code) {
//       const returnedState = url.searchParams.get("state");
//       const savedState = sessionStorage.getItem("spotify_auth_state");
//       const verifier = sessionStorage.getItem("spotify_code_verifier");

//       if (!returnedState || returnedState !== savedState || !verifier) {
//         throw new Error(
//           "Spotify authentication could not be verified. Please sign in again."
//         );
//       }

//       const response = await fetch(
//         "https://accounts.spotify.com/api/token",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: new URLSearchParams({
//             client_id: clientID,
//             grant_type: "authorization_code",
//             code,
//             redirect_uri: redirectUrl,
//             code_verifier: verifier,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.error_description || "Spotify could not provide an access token."
//         );
//       }

//       localStorage.setItem("spotify_access_token", data.access_token);
//       localStorage.setItem(
//         "spotify_token_expiry",
//         String(Date.now() + data.expires_in * 1000)
//       );

//       sessionStorage.removeItem("spotify_code_verifier");
//       sessionStorage.removeItem("spotify_auth_state");

//       window.history.replaceState(
//         {},
//         document.title,
//         window.location.pathname
//       );

//       return data.access_token;
//     }

//     const verifier = generateCodeVerifier();
//     const challenge = await generateCodeChallenge(verifier);
//     const state = generateCodeVerifier().slice(0, 32);

//     sessionStorage.setItem("spotify_code_verifier", verifier);
//     sessionStorage.setItem("spotify_auth_state", state);

//     const authUrl = new URL(
//       "https://accounts.spotify.com/authorize"
//     );

//     authUrl.search = new URLSearchParams({
//       client_id: clientID,
//       response_type: "code",
//       redirect_uri: redirectUrl,
//       scope: scopes,
//       code_challenge_method: "S256",
//       code_challenge: challenge,
//       state,
//     }).toString();

//     window.location.assign(authUrl.toString());
//     return null;
//   },

//   async search(term) {
//     if (!term.trim()) return [];

//     const token = await Spotify.getAccessToken();
//     if (!token) return [];

//     const response = await fetch(
//       `https://api.spotify.com/v1/search?${new URLSearchParams({
//         type: "track",
//         q: term,
//         limit: "20",
//       })}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

    
//     const rawResponse = await response.text();

//     let data;

//     try {
//       data = JSON.parse(rawResponse);
//     } catch {
//       console.error("Non-JSON Spotify response:", rawResponse);

//       throw new Error(
//         `Spotify returned a non-JSON response (HTTP ${response.status}): ` +
//         rawResponse.slice(0, 250)
//       );
//     }

//     if (!response.ok) {
//       throw new Error(
//         data.error?.message ||
//         `Spotify search failed (HTTP ${response.status}).`
//       );
//     }

//     return data.tracks.items.map((track) => ({
//       id: track.id,
//       name: track.name,
//       artist: track.artists.map((artist) => artist.name).join(", "),
//       album: track.album.name,
//       uri: track.uri,
//     }));

//   },

//   async savePlaylist(name, trackUris) {
//     if (!name?.trim()) {
//       throw new Error("Please enter a playlist name.");
//     }

//     const token = await Spotify.getAccessToken();
//     if (!token) return;

//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };

//     const playlistResponse = await fetch(
//       "https://api.spotify.com/v1/me/playlists",
//       {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           name: name.trim(),
//           public: true,
//         }),
//       }
//     );

//     const playlist = await playlistResponse.json();

//     if (!playlistResponse.ok) {
//       throw new Error(
//         playlist.error?.message || "Spotify could not create the playlist."
//       );
//     }

//     if (trackUris.length > 0) {
//       const tracksResponse = await fetch(
//         `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
//         {
//           method: "POST",
//           headers,
//           body: JSON.stringify({
//             uris: trackUris,
//           }),
//         }
//       );

//       if (!tracksResponse.ok) {
//         throw new Error("The playlist was created, but adding tracks failed.");
//       }
//     }

//     return playlist;
//   },
// };

// export { Spotify };

const Spotify = {
  async search(term) {
    const query = term.trim();

    if (!query) {
      return [];
    }

    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("term", query);
    url.searchParams.set("entity", "song");
    url.searchParams.set("limit", "25");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Music search failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((track) => ({
      id: String(track.trackId),
      name: track.trackName,
      artist: track.artistName,
      album: track.collectionName || "Unknown Album",
      uri: track.trackViewUrl,
      previewUrl: track.previewUrl || null,
      artwork: track.artworkUrl100 || null
    }));
  },

  async savePlaylist(name, trackUris) {
    const playlistName = name.trim();

    if (!playlistName) {
      throw new Error("Please enter a playlist name.");
    }

    if (!trackUris || trackUris.length === 0) {
      throw new Error("Add at least one track to your playlist.");
    }

    const savedPlaylists = JSON.parse(
      localStorage.getItem("jammmingPlaylists") || "[]"
    );

    const playlist = {
      id: `playlist-${Date.now()}`,
      name: playlistName,
      tracks: trackUris,
      createdAt: new Date().toISOString()
    };

    savedPlaylists.push(playlist);

    localStorage.setItem(
      "jammmingPlaylists",
      JSON.stringify(savedPlaylists)
    );

    return playlist;
  }
};

export { Spotify };