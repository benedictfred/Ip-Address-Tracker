import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet";
import { Icon } from "leaflet";

const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/447/447031.png",
  iconSize: [38, 38],
});

const regexPattern =
  "^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]).(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]).(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]).(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$";

function App() {
  const [ipData, setIpData] = useState({});
  const [error, setError] = useState("");

  function handleAddIp(ipAddress) {
    setIpData((ipData) => ({ ...ipData, ip: ipAddress }));
  }

  useEffect(function () {
    async function ipTracker() {
      try {
        const res = await fetch(
          `https://geo.ipify.org/api/v2/country,city?apiKey=at_IA5J2e9KJcxRmoB4oL4Ul7UynZpeR`
        );
        if (!res.ok)
          throw new Error("Something went wrong. Try again please ☹️");
        const data = await res.json();

        setIpData(data);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }

    ipTracker();
  }, []);

  useEffect(
    function () {
      async function ipTracker() {
        if (ipData.ip === "") return;
        try {
          const res = await fetch(
            `https://geo.ipify.org/api/v2/country,city?apiKey=at_IA5J2e9KJcxRmoB4oL4Ul7UynZpeR&ipAddress=${ipData.ip}`
          );
          if (!res.ok)
            throw new Error("Something went wrong. Try again please ☹️");
          const data = await res.json();

          setIpData(data);
          setError("");
        } catch (err) {
          setError(err.message);
        }
      }

      if (ipData.ip !== "") ipTracker();
    },
    [ipData.ip]
  );

  const data = [
    {
      name: "IP ADDRESS",
      value: ipData?.ip,
      id: 1,
    },
    {
      name: "LOCATION",
      value: ipData?.location?.region,
      id: 2,
    },
    {
      name: "TIMEZONE",
      value: ipData?.location?.timezone,
      id: 3,
    },
    {
      name: "ISP",
      value: ipData?.isp,
      id: 4,
    },
  ];
  return (
    <>
      <Search onHandleAddIp={handleAddIp} />
      <SearchResults data={data} error={error} />
      <Map data={ipData} />
    </>
  );
}

function Search({ onHandleAddIp }) {
  const [inputData, setInputData] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (inputData === "") return;
    onHandleAddIp(inputData);
    setInputData("");
  }
  return (
    <div className="bg-[url('../public/img/pattern-bg-desktop.png')] max-md:bg-[url('../public/img/pattern-bg-mobile.png')] h-[13rem] flex flex-col content-center items-center pt-[1rem]">
      <h1 className="text-white max-md:text-[1.5rem]">IP Address Tracker</h1>
      <form
        className="mt-[1rem] flex items-center content-center"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className="w-[25rem] max-md:w-[15rem] h-[3rem]  rounded-[0.75rem_0rem_0rem_0.75rem] outline-none pl-[1rem]"
          placeholder="Search for any IP address or domain"
          pattern={regexPattern}
          title="Eg. 8.8.8.8"
          onChange={(e) => setInputData(e.target.value)}
          value={inputData}
        />
        <button className="bg-black text-center text-white w-[3rem] h-[3rem] rounded-[0rem_0.5rem_0.5rem_0rem] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="14">
            <path fill="none" stroke="#FFF" strokeWidth="3" d="M2 1l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function SearchResults({ data, error }) {
  return (
    <div className="bg-white w-[70%] rounded-lg h-[8rem] z-[1000] absolute top-[8rem] right-[12rem] flex items-center justify-center max-md:flex-col max-md:right-[1rem] max-md:top-[9rem] max-md:w-[90%] max-md:h-[18rem] max-md:pl-[1rem] max-md:pb-[1rem]">
      {error ? (
        <div className="max-md:text-center">
          Something went wrong. Try again please ☹️
        </div>
      ) : (
        data.map((data) => (
          <React.Fragment key={data.id}>
            <div className="mr-[2rem] max-md:mt-[0.5rem] max-md:text-center">
              <span className="text-gray-500 text-[0.75rem] tracking-wide">
                {data.name}
              </span>
              <p className="font-bold tracking-wide">
                {data.value || "Loading..."}
              </p>
            </div>
            {data.name === "ISP" ? "" : <Demarcate />}
          </React.Fragment>
        ))
      )}
    </div>
  );
}

function Map({ data }) {
  if (
    data &&
    data.location &&
    data.location.lat !== undefined &&
    data.location.lng !== undefined
  )
    return (
      <MapContainer
        key={`${data.location.lat}-${data.location.lng}`}
        center={[data.location?.lat, data.location?.lng]}
        zoom={13}
        zoomControl={false}
        className="h-[100vh]"
      >
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        <Marker
          position={[data.location?.lat, data.location?.lng]}
          icon={customIcon}
        ></Marker>
      </MapContainer>
    );

  return (
    <div className="mt-[9rem] text-center max-md:mt-[15rem]">
      Loading Map....
    </div>
  );
}

function Demarcate() {
  return (
    <div className="bg-gray-400 h-[3rem] w-[0.05rem] mr-[2rem] max-md:hidden"></div>
  );
}
export default App;
