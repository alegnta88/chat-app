import Conversation from "../models/conversationModel.js";

export const getOrCreateConversation = async (userA, userB) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userA, userB] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userA, userB],
    });
  }

  return conversation;
};