const Session = require("../schema/Session");

// Get all sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add a session
exports.addSession = async (req, res) => {
  try {
    const { day, startHour, endHour, note } = req.body;
    const session = new Session({ day, startHour, endHour, note });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};

// Update a session
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startHour, endHour, note } = req.body;
    const session = await Session.findByIdAndUpdate(
      id,
      { day, startHour, endHour, note },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: "Not found" });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByIdAndDelete(id);
    if (!session) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};
