import { send } from "process";
import {
  // Update the necessary imports for Message services here
  createMessage,
  getAllMessages,

} from "../services/messagesService.js";

export const addMessageController = async (req, res) => {
  try {
    if (req.user.role !== "seller" && req.user.role !== "buyer" && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create a Message",
      });
    }
    const { id } = req.params;
    req.body.senderId = req.user.id;
    req.body.receiverId = id;
    req.body.message = req.body.message;

    if (!req.body.message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (req.body.senderId === req.body.receiverId) {
      return res.status(400).json({
        success: false,
        message: "You can't send message to yourself",
      });
    }

    const newMessage = await createMessage(req.body);

    // TODO: Handle any additional logic related to Message creation

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      Message: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const MessageWithAllController = async (req, res) => {
  try {
    // Assuming the logged-in user ID is stored in req.user.id
    const userId = req.user.id;
    const { id } = req.params; // Get the other user's ID from the request parameters

    // Ensure the other user ID is provided
    if (!id) {
      return res.status(400).json({
        message: "Other user ID is required.",
      });
    }

    // Fetch messages between the logged-in user and the other user
    let messages = await getAllMessages(userId, id);

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        message: "No messages found between the users.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

