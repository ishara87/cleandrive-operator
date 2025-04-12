import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function OperatorApp() {
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [taskQueue, setTaskQueue] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchServices();
      fetchQueue();
    }
  }, [isLoggedIn]);

  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select('*');
    if (!error) setServices(data);
  };

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('vehicle_visits')
      .select('id, vehicle_id(license_plate), service_id(name), status')
      .order('created_at', { ascending: true });
    if (!error) setTaskQueue(data);
  };

  const handleLogin = () => {
    if (pin === '1234') setIsLoggedIn(true);
  };

  const addToQueue = async () => {
    await supabase
      .from('vehicles')
      .upsert({ license_plate: licensePlate }, { onConflict: ['license_plate'], returning: 'minimal' });

    const { data: foundVehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('license_plate', licensePlate)
      .single();

    await supabase.from('vehicle_visits').insert({
      vehicle_id: foundVehicle.id,
      service_id: selectedService,
      status: 'queued',
    });

    setLicensePlate('');
    setSelectedService('');
    fetchQueue();
  };

  const updateStatus = async (id, currentStatus) => {
    const statusFlow = ['queued', 'washing', 'drying', 'done'];
    const nextStatus = statusFlow[statusFlow.indexOf(currentStatus) + 1] || 'done';
    await supabase.from('vehicle_visits').update({ status: nextStatus }).eq('id', id);
    fetchQueue();
  };

  if (!isLoggedIn) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Operator Login</h1>
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Add Vehicle</h1>
      <input
        type="text"
        placeholder="License Plate"
        value={licensePlate}
        onChange={(e) => setLicensePlate(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <select
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
        className="border p-2 mb-2 w-full"
      >
        <option value="">Select Service</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
      <button
        onClick={addToQueue}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Add to Queue
      </button>

      <h2 className="text-xl font-bold mt-6 mb-2">Task Queue</h2>
      <ul>
        {taskQueue.map((task) => (
          <li key={task.id} className="border p-2 mb-2 flex justify-between items-center">
            <div>
              <div><strong>{task.vehicle_id.license_plate}</strong></div>
              <div className="text-sm text-gray-500">
                {task.service_id.name} - {task.status}
              </div>
            </div>
            <button
              onClick={() => updateStatus(task.id, task.status)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Next
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
