import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ComplaintForm from './ComplaintForm';
import ComplaintList from './ComplaintList';

function Dashboard({ setIsAuthenticated }) {
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      <ComplaintForm onComplaintAdded={fetchComplaints} />
      <ComplaintList complaints={complaints} fetchComplaints={fetchComplaints} />
    </div>
  );
}

export default Dashboard;
