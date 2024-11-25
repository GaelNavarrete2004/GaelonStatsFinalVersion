import React, { useState, useEffect } from "react";
import { fetchFromSpotify } from "../../spotifyAuth";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Datos del usuario
        const userResponse = await fetchFromSpotify("/me");
        setUserData(userResponse);

        // Artistas principales
        const topArtistsResponse = await fetchFromSpotify("/me/top/artists");
        setTopArtists(topArtistsResponse.items.slice(0, 5)); // Top 5 artistas
      } catch (err) {
        console.error("Error fetching Spotify data:", err);
        setError("No se pudo obtener la información del perfil.");
      }
    };

    fetchProfileData();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-300">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex flex-col items-center space-y-6">
        {/* Imagen y nombre de perfil */}
        <div className="flex flex-col items-center text-center">
          <img
            src={userData.images[0]?.url || "https://via.placeholder.com/150"}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full shadow-lg ring-4 ring-green-400"
          />
          <h2 className="text-2xl font-bold text-white mt-4">
            {userData.display_name}
          </h2>
          <p className="text-gray-400">{userData.email}</p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-400">Seguidores</h3>
            <p className="text-2xl font-bold text-white">
              {userData.followers.total}
            </p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-400">Subscription</h3>
            <p className="text-2xl font-bold text-white">
              {userData.product === "premium" ? "Premium" : "Free"}
            </p>
          </div>
        </div>

        {/* Artistas principales */}
        <div className="w-full mt-6">
          <h3 className="text-xl font-bold text-white">Tus artistas favoritos</h3>
          <ul className="mt-4 space-y-4">
            {topArtists.map((artist) => (
              <li
                key={artist.id}
                className="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition"
              >
                <img
                  src={artist.images[0]?.url || "https://via.placeholder.com/50"}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="text-white font-semibold">{artist.name}</h4>
                  <p className="text-gray-400 text-sm">
                    Popularidad: {artist.popularity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
