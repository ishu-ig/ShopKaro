const mongoose = required("mongoose")

const ChatSchema = new mongoose.Schema({
    participants: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, // [customerId, agentId]

    messages:
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }
})

const Chat = new mongoose.model("Chat", ChatSchema)

module.exports = Chat