import React from 'react';
import Messages from "../components/Messages";
import Form from "../components/Form";

const ChatBox = () => {
    return (
        <>
            <div className="chatbox">
                <Messages/> 
            </div>
            <Form/>
        </>
  )
}

export default ChatBox;