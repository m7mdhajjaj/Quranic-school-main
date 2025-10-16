const Session = require("../schema/Session");
const Group = require("../schema/Group");

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

    // إذا كان هناك اسم حلقة، أضف الموعد تلقائياً إلى جدول الحلقة
    if (note && note.trim()) {
      try {
        const group = await Group.findOne({ name: note.trim() });
        if (group) {
          // تحقق من عدم وجود نفس الموعد مسبقاً
          const existingTimetable = group.timetable || [];
          const alreadyExists = existingTimetable.some(
            (t) =>
              t.day === day &&
              t.startHour === startHour &&
              t.endHour === endHour
          );

          if (!alreadyExists) {
            // أضف الموعد إلى جدول الحلقة
            group.timetable = group.timetable || [];
            group.timetable.push({
              day,
              startHour,
              endHour,
              sessionId: session._id,
            });
            await group.save();
            console.log(
              `✅ تمت إضافة الموعد تلقائياً إلى جدول الحلقة: ${note}`
            );
          }
        } else {
          console.log(`⚠️ لم يتم العثور على حلقة باسم: ${note}`);
        }
      } catch (groupError) {
        console.error("خطأ في إضافة الموعد إلى جدول الحلقة:", groupError);
        // لا نوقف العملية، فقط نسجل الخطأ
      }
    }

    // 🔌 Emit Socket event to sessions room
    const io = req.app.get("io");
    if (io) {
      io.to("sessions").emit("sessionCreated", {
        session: session,
        timestamp: Date.now(),
      });
      console.log("✅ sessionCreated event emitted to sessions room");
    }

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

    // احصل على الموعد القديم قبل التحديث
    const oldSession = await Session.findById(id);
    if (!oldSession) {
      return res.status(404).json({
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    }

    const session = await Session.findByIdAndUpdate(
      id,
      { day, startHour, endHour, note: note || "" },
      { new: true }
    );

    // تحديث جدول الحلقة القديمة (إزالة الموعد القديم)
    if (oldSession.note && oldSession.note.trim()) {
      try {
        const oldGroup = await Group.findOne({ name: oldSession.note.trim() });
        if (oldGroup) {
          oldGroup.timetable =
            oldGroup.timetable?.filter(
              (t) => t.sessionId?.toString() !== id.toString()
            ) || [];
          await oldGroup.save();
          console.log(
            `🔄 تمت إزالة الموعد من جدول الحلقة القديمة: ${oldSession.note}`
          );
        }
      } catch (error) {
        console.error("خطأ في إزالة الموعد من الحلقة القديمة:", error);
      }
    }

    // إضافة الموعد إلى جدول الحلقة الجديدة
    if (note && note.trim()) {
      try {
        const newGroup = await Group.findOne({ name: note.trim() });
        if (newGroup) {
          // تحقق من عدم وجود نفس الموعد مسبقاً
          const alreadyExists = newGroup.timetable?.some(
            (t) => t.sessionId?.toString() === id.toString()
          );

          if (!alreadyExists) {
            newGroup.timetable = newGroup.timetable || [];
            newGroup.timetable.push({
              day,
              startHour,
              endHour,
              sessionId: session._id,
            });
            await newGroup.save();
            console.log(`✅ تمت إضافة الموعد المحدث إلى جدول الحلقة: ${note}`);
          } else {
            // تحديث الموعد الموجود
            const timetableIndex = newGroup.timetable.findIndex(
              (t) => t.sessionId?.toString() === id.toString()
            );
            if (timetableIndex !== -1) {
              newGroup.timetable[timetableIndex] = {
                day,
                startHour,
                endHour,
                sessionId: session._id,
              };
              await newGroup.save();
              console.log(`🔄 تم تحديث الموعد في جدول الحلقة: ${note}`);
            }
          }
        }
      } catch (error) {
        console.error("خطأ في تحديث جدول الحلقة:", error);
      }
    }

    // 🔌 Emit Socket event to sessions room
    const io = req.app.get("io");
    if (io) {
      io.to("sessions").emit("sessionUpdated", {
        session: session,
        timestamp: Date.now(),
      });
      console.log("✅ sessionUpdated event emitted to sessions room");
    }

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
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        error: "Not found",
        message: "لم يتم العثور على الموعد",
      });
    }

    // إزالة الموعد من جدول الحلقة
    if (session.note && session.note.trim()) {
      try {
        const group = await Group.findOne({ name: session.note.trim() });
        if (group) {
          group.timetable =
            group.timetable?.filter(
              (t) => t.sessionId?.toString() !== id.toString()
            ) || [];
          await group.save();
          console.log(`🗑️ تمت إزالة الموعد من جدول الحلقة: ${session.note}`);
        }
      } catch (error) {
        console.error("خطأ في إزالة الموعد من جدول الحلقة:", error);
      }
    }

    // حذف الموعد من جدول Sessions
    await Session.findByIdAndDelete(id);

    // 🔌 Emit Socket event to sessions room
    const io = req.app.get("io");
    if (io) {
      io.to("sessions").emit("sessionDeleted", {
        sessionId: id,
        timestamp: Date.now(),
      });
      console.log("✅ sessionDeleted event emitted to sessions room");
    }

    res.json({ success: true, message: "تم حذف الموعد بنجاح" });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(400).json({
      error: "Invalid data",
      message: err.message || "حدث خطأ أثناء حذف الموعد",
    });
  }
};
