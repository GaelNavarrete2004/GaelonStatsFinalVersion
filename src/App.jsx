import React, { useState, useEffect } from "react";
import { getAuthUrl } from "./spotifyAuth";
import Playlists from "./components/Playlist/Playlist";
import Discovery from "./components/Discovery/Discovery";
import RecentlyPlayed from "./components/Recently Played/RecentlyPlayed";
import Statistics from "./components/Stats/Stats";
import Profile from "./components/Profile/Profile";
import logo from "./stats.png";

export default function App() {
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("playlists");
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState({
    photoURL: "",
    name: "",
  });

  // Verifica si hay un token en el hash de la URL
  useEffect(() => {
    const hash = window.location.hash;
    const storedToken = localStorage.getItem("spotifyAccessToken");

    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
      return;
    }

    if (hash) {
      const token = new URLSearchParams(hash.replace("#", "?")).get(
        "access_token"
      );
      if (token) {
        localStorage.setItem("spotifyAccessToken", token);
        setToken(token);
        fetchUserData(token);
        window.location.hash = "";
      } else {
        setError("Error: Token de acceso no encontrado");
      }
    }
  }, []);

  // Función para obtener los datos del usuario
  const fetchUserData = async (accessToken) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setUser({
        photoURL: data.images[0]?.url || "https://via.placeholder.com/150",
        name: data.display_name || "Usuario Spotify",
      });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("spotifyAccessToken");
    setToken(null);
    window.location.hash = "";
  };

  // Alternar menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <a
          href={getAuthUrl()}
          className="px-6 py-3 text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
        >
          Iniciar sesión con Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded-full" />
            <h1 className="text-xl font-bold text-white">Gaelon Stats</h1>
          </div>

          {/* Opciones centradas */}
          <ul className="hidden md:flex space-x-6 justify-center flex-1">
            <li>
              <button
                onClick={() => setActiveTab("playlists")}
                className={`px-4 py-2 rounded ${
                  activeTab === "playlists"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Playlists
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("discovery")}
                className={`px-4 py-2 rounded ${
                  activeTab === "discovery"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Discovery
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("recentlyplayed")}
                className={`px-4 py-2 rounded ${
                  activeTab === "recentlyplayed"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Recently Played
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`px-4 py-2 rounded ${
                  activeTab === "statistics"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Stats
              </button>
            </li>
          </ul>

          {/* Foto de perfil */}
          <div className="relative hidden md:block">
            <button onClick={toggleProfileMenu} className="flex items-center">
              <div className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-300">
                <img
                  src={user.photoURL}
                  alt="Foto de perfil"
                  className="w-10 h-10 rounded-full"
                />
              </div>
            </button>
            {/* Menú desplegable mejorado */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                <ul>
                  <li>
                    <button onClick={() => setActiveTab("profile")} className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left">
                      Ver perfil
                    </button>
                  </li>
                  <hr className="border-gray-600" />
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-gray-300 hover:bg-red-500 hover:text-white w-full text-left"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Menú móvil */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Menú desplegable móvil */}
        {/* Menú desplegable en móvil */}
        {isMenuOpen && (
          <ul className="md:hidden mt-4 space-y-2 bg-gray-700 p-4 rounded-md">
            <li>
              <button
                onClick={() => {
                  setActiveTab("playlists");
                  toggleMenu();
                }}
                className={`block w-full text-left px-4 py-2 rounded ${
                  activeTab === "playlists"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                Playlists
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("discovery");
                  toggleMenu();
                }}
                className={`block w-full text-left px-4 py-2 rounded ${
                  activeTab === "discovery"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                Discovery
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("recentlyplayed");
                  toggleMenu();
                }}
                className={`block w-full text-left px-4 py-2 rounded ${
                  activeTab === "recentlyplayed"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                Recently Played
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("statistics");
                  toggleMenu();
                }}
                className={`block w-full text-left px-4 py-2 rounded ${
                  activeTab === "statistics"
                    ? "bg-green-500 text-white"
                    : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                Stats
              </button>
            </li>
            <hr className="border-gray-600" />
            <li>
              <button onClick={() => setActiveTab("profile")} className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-white">
                Ver perfil
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-red-500 hover:text-white"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        )}
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto mt-8 p-4">
        {activeTab === "playlists" && <Playlists token={token} />}
        {activeTab === "discovery" && <Discovery token={token} />}
        {activeTab === "recentlyplayed" && <RecentlyPlayed token={token} />}
        {activeTab === "statistics" && <Statistics token={token} />}
        {activeTab === "profile" && <Profile token={token} />}
      </main>
    </div>
  );
}
