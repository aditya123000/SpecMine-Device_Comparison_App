import React,{useEffect,useState} from 'react';
import Spinner from "../../components/Global-components/Spinner";
import { getDevices } from "../../Api/deviceApi";
import DeviceCard from '../Devices/DeviceCard';
import { useCompare } from "../Compare/context/CompareContext";
import { useNavigate } from "react-router-dom";
import DeviceImage from '../../components/DEviceImage';

const Devices = () => {
  const [devices,setDevices]=useState([]);
  const[loading,setLoading]=useState(true);
  const navigate = useNavigate();
  const { selectedDevices,toggleCompare } = useCompare();


  useEffect(()=>{
    const fetchDevices=async()=>{
      try{
        const res=await getDevices();
        setDevices(res);
      }
      catch(error){
        console.error("Failed to fetch Devices",error.message);
      }
      finally{
        setLoading(false);
      }
    };

    fetchDevices();
  },[]);

  if (loading) {
    return <Spinner loading={loading} />;
  }
  if (devices.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <p className="text-gray-700 text-lg font-medium">
          No devices to display
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Please check back later or try again.
        </p>
      </div>
    );
  }

  return (
      <div className='flex flex-col gap-12'>
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-slate-50">
            Devices
          </h1>
          <p className="mt-2 text-slate-400 max-w-xl">
            Browse and compare smartphones based on your preferences.
          </p>
        </section>
        {selectedDevices.length >= 2 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 rounded-lg px-6 py-3 flex items-center gap-4 shadow-lg">
            <p className="text-slate-300 text-sm">
              {selectedDevices.length} device
              {selectedDevices.length > 1 ? "s" : ""} selected
            </p>

            <button
              onClick={() => navigate("/compare")}
              className="px-4 py-2 rounded-md text-sm font-medium bg-sky-400 text-slate-900 hover:bg-sky-300 transition"
            >
              Compare ({selectedDevices.length}/3)
            </button>
          </div>
        )}
        <section>
          <div className="p-6">
            {loading ? (
              <Spinner loading={loading}/>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {devices.map((device) => {
                  const isSelected = selectedDevices.some(
                    (d) => d.id === device.id
                  );
                  return (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      isSelected={isSelected}
                      onToggleCompare={toggleCompare}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
  )
}

export default Devices