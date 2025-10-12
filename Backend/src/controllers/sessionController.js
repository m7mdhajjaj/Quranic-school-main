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

    // Validate required fields
    if (!day || !startHour || !endHour) {
      return res.status(400).json({
        error: "Invalid data",
        message: "اليوم وساعة البداية وساعة النهاية مطلوبة",
        details: { day, startHour, endHour, note },
      });
    }

    const session = new Session({ day, startHour, endHour, note: note || "" });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error("Error adding session:", err);
    res.status(400).json({
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء إضافة الموعد",
    });
  }
};

// Update a session
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startHour, endHour, note } = req.body;

    // Validate required fields
    if (!day || !startHour || !endHour) {
      return res.status(400).json({
        error: "Invalid data",
        message: "اليوم وساعة البداية وساعة النهاية مطلوبة",
      });
    }

    const session = await Session.findByIdAndUpdate(
      id,
      { day, startHour, endHour, note: note || "" },
      { new: true }
    );
    if (!session)
      return res.status(404).json({
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    res.json(session);
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(400).json({
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء تحديث الموعد",
    });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByIdAndDelete(id);
    if (!session)
      return res.status(404).json({
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    res.json({ success: true, message: "تم حذف الموعد بنجاح" });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(400).json({
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء حذف الموعد",
    });
  }
};
