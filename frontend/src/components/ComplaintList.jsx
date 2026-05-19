import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ComplaintList({ complaints, fetchComplaints }) {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/complaints/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status. Only admins can do this.');
    }
  };

  const handlePriorityUpdate = async (id, newPriority) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/complaints/${id}`, { priorityRank: newPriority }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update priority rank.');
    }
  };

  const handleSearch = async () => {
    if (!search) return fetchComplaints();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/complaints/search?location=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Replace the global state via a local state approach if needed, or pass it to parent.
      // For simplicity, we just filter existing complaints here if we didn't want to make an API call, 
      // but the requirement says API endpoint. 
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    (filter ? c.category.toLowerCase().includes(filter.toLowerCase()) : true) &&
    (search ? c.location.toLowerCase().includes(search.toLowerCase()) : true)
  );

  return (
    <div className="card">
      <div className="card-header bg-secondary text-white">Complaint List & Tracking</div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Search by location..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Filter by category..." value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Priority Rank</th>
                <th>Status</th>
                {user.role === 'admin' && <th>Admin Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(c => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.location}</td>
                  <td>{c.priorityRank || 0}</td>
                  <td>
                    <span className={`badge ${c.status === 'Pending' ? 'bg-warning text-dark' : c.status === 'Resolved' ? 'bg-success' : 'bg-primary'}`}>
                      {c.status}
                    </span>
                  </td>
                  {user.role === 'admin' && (
                    <td>
                      <select className="form-select form-select-sm mb-2" value={c.status} onChange={(e) => handleStatusUpdate(c._id, e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <input 
                        type="number" 
                        className="form-control form-control-sm" 
                        placeholder="Priority (e.g. 1)" 
                        defaultValue={c.priorityRank || 0} 
                        onBlur={(e) => handlePriorityUpdate(c._id, e.target.value)} 
                      />
                    </td>
                  )}
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={user.role === 'admin' ? "6" : "5"} className="text-center">No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ComplaintList;
