import React, { useState } from 'react';
import axios from 'axios';

function ComplaintForm({ onComplaintAdded }) {
  const [formData, setFormData] = useState({
    name: '', email: '', title: '', description: '', category: '', location: ''
  });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Analyze with AI first
      const aiResponse = await axios.post('http://localhost:5000/api/ai/analyze', {
        title: formData.title,
        description: formData.description,
        category: formData.category
      }, { headers });
      
      const aiData = aiResponse.data;
      setAiResult(aiData);

      let calculatedPriority = 4; // Default to 4 (Low)
      if (aiData.urgency === 'Critical') calculatedPriority = 1;
      else if (aiData.urgency === 'High') calculatedPriority = 2;
      else if (aiData.urgency === 'Medium') calculatedPriority = 3;
      else if (aiData.urgency === 'Low') calculatedPriority = 4;

      // Save to database
      await axios.post('http://localhost:5000/api/complaints', { ...formData, priorityRank: calculatedPriority }, { headers });
      onComplaintAdded();
      setFormData({ name: '', email: '', title: '', description: '', category: '', location: '' });
    } catch (err) {
      console.error(err);
      alert('Error submitting complaint');
    }
    setLoading(false);
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">Register a Complaint</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <input type="text" name="name" placeholder="Name" className="form-control" onChange={handleChange} value={formData.name} required />
            </div>
            <div className="col-md-6 mb-3">
              <input type="email" name="email" placeholder="Email" className="form-control" onChange={handleChange} value={formData.email} required />
            </div>
            <div className="col-md-12 mb-3">
              <input type="text" name="title" placeholder="Complaint Title" className="form-control" onChange={handleChange} value={formData.title} required />
            </div>
            <div className="col-md-12 mb-3">
              <textarea name="description" placeholder="Description" className="form-control" onChange={handleChange} value={formData.description} required></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <input type="text" name="category" placeholder="Category (e.g., Water Supply)" className="form-control" onChange={handleChange} value={formData.category} required />
            </div>
            <div className="col-md-6 mb-3">
              <input type="text" name="location" placeholder="Location" className="form-control" onChange={handleChange} value={formData.location} required />
            </div>
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Complaint'}
          </button>
        </form>

        {aiResult && (
          <div className="mt-4 alert alert-info">
            <h5>AI Analysis Result:</h5>
            <p><strong>Urgency:</strong> <span className={`badge ${aiResult.urgency === 'High' || aiResult.urgency === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>{aiResult.urgency}</span> <small className="text-muted">(Rank {aiResult.urgency === 'Critical' ? 1 : aiResult.urgency === 'High' ? 2 : aiResult.urgency === 'Medium' ? 3 : 4} Assigned)</small></p>
            <p><strong>Recommended Department:</strong> {aiResult.department}</p>
            <p><strong>Summary:</strong> {aiResult.summary}</p>
            <p><strong>Auto Response:</strong> <em>{aiResult.autoResponse}</em></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintForm;
