const { ContactsService } = require('../../services/Chat');

exports.searchStudentsForMention = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUser = req.user;

    // Use ContactsService to get relevant contacts for the current user
    const result = await ContactsService.getContacts(currentUser.id, currentUser.role, q);
    
    // Filter out the current user just in case
    const users = result.contacts.filter(c => c._id.toString() !== currentUser.id);

    // Limit to 10 results
    const limitedUsers = users.slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: limitedUsers
    });
  } catch (error) {
    console.error("Error in searchStudentsForMention:", error);
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
