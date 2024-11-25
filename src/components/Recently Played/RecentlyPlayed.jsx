import React, { useState, useEffect } from "react";
import { fetchFromSpotify } from "../../spotifyAuth";

export default function RecentlyPlayed({ token }) {
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewAudio, setPreviewAudio] = useState(null);

  useEffect(() => {
    fetchAllRecentTracks();
  }, [token]);

  // Fetch all recently played tracks
  const fetchAllRecentTracks = async () => {
    setLoading(true);
    let allTracks = [];
    let nextUrl = "/me/player/recently-played?limit=50";

    try {
      while (nextUrl) {
        const data = await fetchFromSpotify(nextUrl, token);
        allTracks = [...allTracks, ...data.items];
        nextUrl = data.next?.replace("https://api.spotify.com/v1", "") || null;
      }
      setRecentTracks(allTracks);
    } catch (error) {
      console.error("Error fetching recent tracks:", error);
      setRecentTracks([]);
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
        Recently Played
      </h2>
      {loading ? (
        <p className="text-center text-lg">Loading recently played songs...</p>
      ) : recentTracks.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {recentTracks.map(({ track }, index) => (
            <li
              key={track.id + index}
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
                Artist: {track.artists[0].name}
              </p>
              <p className="text-gray-500 truncate">
                Album: {track.album.name}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-lg">No recent songs found.</p>
      )}
    </div>
  );
}
