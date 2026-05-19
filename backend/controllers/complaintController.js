const Complaint = require('../models/Complaint');

exports.addComplaint = async (req, res) => {
  try {
    const complaintData = { ...req.body, user: req.user._id };
    const complaint = new Complaint(complaintData);
    await complaint.save();
    res.status(201).json({ message: 'Complaint stored successfully', complaint });
  } catch (error) {
    res.status(400).json({ error: 'Validation error', details: error.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    const complaints = await Complaint.find(query).sort({ priorityRank: 1, createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update complaint status and priority' });
    }
    const { status, priorityRank } = req.body;
    let updateFields = {};
    if (status) {
      updateFields.status = status;
      if (status === 'Resolved') {
        updateFields.priorityRank = 5; // Auto-drop priority for resolved complaints (5 is lowest)
      }
    }
    if (priorityRank !== undefined && status !== 'Resolved') {
      updateFields.priorityRank = Number(priorityRank);
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.searchComplaintByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ error: 'Location query parameter is required' });
    const complaints = await Complaint.find({ location: { $regex: new RegExp(location, 'i') } });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
