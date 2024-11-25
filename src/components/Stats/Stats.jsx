import React, { useState, useEffect } from "react";
import { fetchFromSpotify } from "../../spotifyAuth";
import HistoricalRankingModal from "../Ranking/Ranking";

export default function Statistics({ token }) {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("short_term");
  const [playingTrack, setPlayingTrack] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Elemento seleccionado para mostrar en el modal
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    fetchTopItems();
  }, [token, timeRange]);

  const fetchTopItems = async () => {
    setLoading(true);
    try {
      const tracksData = await fetchFromSpotify(
        `/me/top/tracks?limit=10&time_range=${timeRange}`,
        token
      );
      setTopTracks(tracksData.items || []);

      const artistsData = await fetchFromSpotify(
        `/me/top/artists?limit=10&time_range=${timeRange}`,
        token
      );
      setTopArtists(artistsData.items || []);

      const albumsData = tracksData.items.map((track) => track.album);
      const albumCounts = albumsData.reduce((acc, album) => {
        acc[album.id] = acc[album.id] || { ...album, count: 0 };
        acc[album.id].count++;
        return acc;
      }, {});
      const sortedAlbums = Object.values(albumCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setTopAlbums(sortedAlbums);

      const playlistsData = await fetchFromSpotify(
        "/me/playlists?limit=10",
        token
      );
      setTopPlaylists(playlistsData.items || []);
    } catch (error) {
      console.error("Error fetching top items:", error);
      setTopTracks([]);
      setTopArtists([]);
      setTopAlbums([]);
      setTopPlaylists([]);
    }
    setLoading(false);
  };

  const handleItemClick = async (item, type) => {
    const data = await fetchHistoricalData(item.id, type);
    setRankingData(data);

    const songDetails = {
      albumCover: item.album.images[0].url,
      albumName: item.album.name,
      artistNames: item.artists.map((artist) => artist.name),
      spotifyUrl: item.external_urls.spotify,
    };

    setSelectedItem({ ...item, songDetails });
  };

  const fetchHistoricalData = async (id, type) => {
    // Lógica para obtener datos históricos para el gráfico
    return [
      { date: "10/3/2023", rank: 1 },
      { date: "10/10/2023", rank: 3 },
      // Agrega más datos para el historial
    ];
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const togglePlay = (trackUrl) => {
    if (playingTrack && playingTrack.src === trackUrl) {
      playingTrack.pause();
      setPlayingTrack(null);
    } else {
      if (playingTrack) {
        playingTrack.pause();
      }
      const newTrack = new Audio(trackUrl);
      newTrack.play();
      setPlayingTrack(newTrack);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-lg font-semibold">
        Cargando estadísticas...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-12">
        <button
          onClick={() => handleTimeRangeChange("short_term")}
          className={`w-full md:w-auto px-5 py-2 rounded-lg ${
            timeRange === "short_term"
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
          } transition-all duration-200`}
        >
          Últimas 4 semanas
        </button>
        <button
          onClick={() => handleTimeRangeChange("medium_term")}
          className={`w-full md:w-auto px-5 py-2 rounded-lg ${
            timeRange === "medium_term"
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
          } transition-all duration-200`}
        >
          Últimos 6 meses
        </button>
        <button
          onClick={() => handleTimeRangeChange("long_term")}
          className={`w-full md:w-auto px-5 py-2 rounded-lg ${
            timeRange === "long_term"
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
          } transition-all duration-200`}
        >
          Todo el año
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
        <div className="rounded-lg shadow-lg p-6 bg-gray-800 hover:bg-gray-700 transition-all duration-200 ease-in-out">
          <h2 className="text-xl font-bold mb-4">Top Canciones</h2>
          <ol className="space-y-4">
            {topTracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center space-x-3 hover:bg-gray-600 p-3 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
                onClick={() => handleItemClick(track, "track")}
              >
                <img
                  src={track.album.images[0].url}
                  alt={track.name}
                  className="w-16 h-16 rounded-lg shadow-md"
                />
                <div className="flex-1">
                  <span className="block font-semibold text-white">
                    {track.name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {track.artists[0].name}
                  </span>
                </div>
                {track.preview_url && (
                  <button
                    onClick={() => togglePlay(track.preview_url)}
                    className="px-3 py-1 bg-[#1DB954] rounded-full text-white font-semibold hover:bg-[#2e6a33] focus:outline-none"
                  >
                    {playingTrack &&
                    playingTrack.src === track.preview_url &&
                    !playingTrack.paused
                      ? "Pause"
                      : "Play"}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-gray-800 hover:bg-gray-700 transition-all duration-200 ease-in-out">
          <h2 className="text-xl font-bold mb-4">Top Artistas</h2>
          <ol className="space-y-4">
            {topArtists.map((artist) => (
              <li
                key={artist.id}
                className="flex items-center space-x-3 hover:bg-gray-600 p-3 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
              >
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full shadow-md"
                />
                <span className="font-semibold text-white">{artist.name}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-gray-800 hover:bg-gray-700 transition-all duration-200 ease-in-out">
          <h2 className="text-xl font-bold mb-4">Top Álbumes</h2>
          <ol className="space-y-4">
            {topAlbums.map((album) => (
              <li
                key={album.id}
                className="flex items-center space-x-3 hover:bg-gray-600 p-3 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
              >
                <img
                  src={album.images[0].url}
                  alt={album.name}
                  className="w-16 h-16 rounded-lg shadow-md"
                />
                <div>
                  <span className="block font-semibold text-white">
                    {album.name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {album.artists[0].name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-gray-800 hover:bg-gray-700 transition-all duration-200 ease-in-out">
          <h2 className="text-xl font-bold mb-4">Top Playlists</h2>
          <ol className="space-y-4">
            {topPlaylists.map((playlist) => (
              <li
                key={playlist.id}
                className="flex items-center space-x-3 hover:bg-gray-600 p-3 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
              >
                <img
                  src={playlist.images[0]?.url}
                  alt={playlist.name}
                  className="w-16 h-16 rounded-lg shadow-md"
                />
                <span className="font-semibold text-white">
                  {playlist.name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {selectedItem && (
        <HistoricalRankingModal
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          rankingData={rankingData}
        />
      )}
    </div>
  );
}
