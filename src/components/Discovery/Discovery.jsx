import React, { useState, useEffect } from "react";
import { fetchFromSpotify } from "../../spotifyAuth";

export default function Discovery({ token }) {
  const [recommendations, setRecommendations] = useState([]);
  const [mood, setMood] = useState("happy");
  const [loading, setLoading] = useState(true);
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [token, mood]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const topTracks = await fetchFromSpotify("/me/top/tracks?limit=5", token);
      const seedTracks = topTracks.items.map((track) => track.id).join(",");

      const moodParams = {
        happy: { valence: 0.8, energy: 0.8, danceability: 0.8 },
        sad: { valence: 0.2, energy: 0.2, acousticness: 0.7 },
        energetic: { valence: 0.7, energy: 1.0, tempo: 140 },
        relaxed: { valence: 0.5, energy: 0.3, acousticness: 0.8 },
        romantic: { valence: 0.7, energy: 0.4, danceability: 0.6, acousticness: 0.6 },
      };

      const { valence, energy, danceability, tempo, acousticness } =
        moodParams[mood];
      const query =
        `/recommendations?seed_tracks=${seedTracks}` +
        (valence ? `&target_valence=${valence}` : "") +
        (energy ? `&target_energy=${energy}` : "") +
        (danceability ? `&target_danceability=${danceability}` : "") +
        (tempo ? `&target_tempo=${tempo}` : "") +
        (acousticness ? `&target_acousticness=${acousticness}` : "");

      const data = await fetchFromSpotify(query, token);
      setRecommendations(data.tracks || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    }
    setLoading(false);
  };

  // Play preview when hovering over a track
  const playPreview = (previewUrl) => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    if (previewUrl) {
      const audio = new Audio(previewUrl);
      audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
      setPreviewAudio(audio);
    }
  };

  // Stop preview on hover out
  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-extrabold mb-6 text-center">
        Descubre Nueva Música
      </h2>
      <div className="flex justify-center mb-6">
        <label className="mr-4 text-lg font-semibold">Estado de ánimo:</label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="bg-gray-800 p-3 rounded border border-gray-700 text-lg"
        >
          <option value="happy">Feliz</option>
          <option value="sad">Triste</option>
          <option value="energetic">Energético</option>
          <option value="relaxed">Relajado</option>
          <option value="romantic">Romántico</option>
        </select>
      </div>
      {loading ? (
        <p className="text-center text-lg">Cargando recomendaciones...</p>
      ) : recommendations.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {recommendations.map((track) => (
            <li
              key={track.id}
              className="bg-gray-800 p-4 rounded shadow-md transform transition-transform duration-300 hover:scale-105"
              onMouseEnter={() => playPreview(track.preview_url)}
              onMouseLeave={stopPreview}
            >
              <div className="relative">
                <img
                  src={track.album.images[1]?.url}
                  alt={track.name}
                  className="w-full rounded mb-4"
                />
              </div>
              <p className="text-lg font-bold truncate">{track.name}</p>
              <p className="text-gray-400 truncate">
                Artista: {track.artists[0].name}
              </p>
              <p className="text-gray-500 truncate">
                Álbum: {track.album.name}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-lg">No se encontraron recomendaciones.</p>
      )}
    </div>
  );
}
