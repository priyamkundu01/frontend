import { useEffect, useState } from "react";
import "../styles/DriverVehicleDetails.css";
import withAuth from "../utils/withAuth";
const DriverVehicleDetails = () => {
  const [driverData, setDriverData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  // Function to fetch data from the API
  async function fetchData(apiUrl, setData) {
    try {
      const token =   localStorage.getItem('token');
    
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  

  // Function to get query parameter from URL
  function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  useEffect(() => {
    const driverId = getQueryParameter("driverId");
    const vehicleId = getQueryParameter("vehicleId");
    console.log(driverId, vehicleId);
    // const areaId = getQueryParameter('areaId');

    fetchData(
      `https://garbage-tracking-backend.onrender.com/drivers/get-all-drivers/${driverId}`,
      setDriverData
    );
    fetchData(
      `https://garbage-tracking-backend.onrender.com/vehicles/get-vehicles/${vehicleId}`,
      setVehicleData
    );
  }, []);

  function goBack() {
    window.history.back();
  }

  console.log(vehicleData)
  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Driver Details</h2>
              {driverData && (
                <>
                  <img
                    src={driverData.image}
                    alt="Driver Image"
                    className="driver-image mb-3"
                  />
                  <p className="driver-info">Name: {driverData.name}</p>
                  <p className="driver-info">Age: {driverData.age}</p>
                  <p className="driver-info">Gender: {driverData.gender}</p>
                  <p className="driver-info">
                    Driver ID: {driverData.driverId}
                  </p>
                  <p className="driver-info">
                    Phone: {driverData.phoneNumbers}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Vehicle Details</h2>
              {vehicleData && (
                <>
                  <p className="vehicle-info">Vehicle ID: {vehicleData.vehicleId}</p>
                  <p className="vehicle-info">
                    Registration No: {vehicleData.registrationNo}
                  </p>
                  <p className="vehicle-info">Type: {vehicleData.type}</p>
                  <p className="vehicle-info">
                    Capacity: {vehicleData.capacity}
                  </p>
                </>
              )}
              <div className="btn mt-3 d-flex justify-content-end gap-5">
                <button
                  className="btn mr-2 btn-custom"
                  onClick={() => console.log("Track button clicked")}
                >
                  Track
                </button>
                <button className="btn btn-custom-secondary" onClick={goBack}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverVehicleDetailsWithAuth = withAuth(DriverVehicleDetails);

export default DriverVehicleDetailsWithAuth;