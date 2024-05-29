import { useEffect, useState } from "react";
import io from "socket.io-client";
import MapComponent from "../components/MapComponent";
import withAuth from "../utils/withAuth";
import Skeleton from "../components/Skeleton";
import TrackingProgressBar from "../components/TrackingProgressBar";
import "../styles/TrackingMap.css"; // Ensure you have the CSS file imported

const socket = io("https://production-backend-3olq.onrender.com"); // Replace with your backend URL

const TrackingMap = () => {
  const getQueryParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedParam = urlParams.get(name);
    return encodedParam ? atob(encodedParam) : null;
  };

  const [areaData, setAreaData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [areaId, setAreaId] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const areaId = getQueryParameter("areaId");
    setAreaId(areaId);
    const driverId = getQueryParameter("driverId");
    setDriverId(driverId);
    const vehicleId = getQueryParameter("vehicleId");
    setVehicleId(vehicleId);

    const fetchAreaData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch(
          `https://garbage-tracking-backend.onrender.com/areas/get-area-details/${areaId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch area details");
        }

        const data = await response.json();
        setAreaData(data);
      } catch (error) {
        console.error("Error fetching area data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchDriverData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch(
          `https://garbage-tracking-backend.onrender.com/drivers/get-all-drivers/${driverId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch driver details");
        }

        const data = await response.json();
        setDriverData(data);
        console.log("Driver Data:", data); // Debug: Log the driver data
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
    };

    if (areaId || driverId) {
      fetchAreaData();
      fetchDriverData();
    } else {
      setError("Invalid area ID");
      setLoading(false);
    }

    // Set up WebSocket listeners
    socket.on("coordinatesUpdated", (data) => {
      const { vehicleId, latitude, longitude } = data;
      console.log(`Received coordinates for vehicle ${vehicleId}: ${latitude}, ${longitude}`);
      // Update your state or map with the new coordinates here
      // For example, you can update the areaData or another state based on the vehicleId
    });

    socket.on("dustbinVisited", (data) => {
      const { id, isVisited, visitedTimestamp } = data;
      console.log(`Dustbin ${id} visited: ${isVisited}`);
      // Update the dustbin status in the areaData
      setAreaData((prevData) => {
        const updatedDustbins = prevData.dustbins.map((dustbin) =>
          dustbin._id === id ? { ...dustbin, isVisited, visitedTimestamp } : dustbin
        );
        return { ...prevData, dustbins: updatedDustbins };
      });
    });

    return () => {
      socket.off("coordinatesUpdated");
      socket.off("dustbinVisited");
    };
  }, [areaId]);

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Generate points with isVisited status
  const generatePoints = () => {
    const points = [{ label: "Start", isVisited: false, visitedTimestamp: null }];
    areaData.dustbins.forEach((dustbin, index) => {
      points.push({
        label: `Point ${index + 1}`,
        isVisited: dustbin.isVisited,
        visitedTimestamp: dustbin.visitedTimestamp,
      });
    });
    points.push({ label: "End", isVisited: false, visitedTimestamp: null });
    return points;
  };

  const points = generatePoints();

  return (
    <div className={`tracking-map-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="map-container">
        <MapComponent
          areaData={areaData}
          driverData={driverData}
          vehicleId={vehicleId}
        />
        <button className="toggle-sidebar-button" onClick={toggleSidebar}>
          {isSidebarOpen ? "Close" : "Open"} Sidebar
        </button>
      </div>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2>Details</h2>
        <p>Area Name: {areaData.name}</p>
        <p>Driver Name: {driverData.name}</p>
        <p>Driver Phone: {driverData.phoneNumbers}</p>
        <p>Vehicle No: {vehicleId}</p>
        <hr />
        <div>
          <h3>Route Progress</h3>
          <TrackingProgressBar points={points} areaData={areaData} />
        </div>
      </div>
    </div>
  );
};

const TrackingMapWithAuth = withAuth(TrackingMap);

export default TrackingMapWithAuth;
