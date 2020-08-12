import React, { useEffect, useRef }from "react";
import {Table} from "reactstrap";
import {useSelector} from "react-redux";

const Messages = () => {
    const messages = useSelector(state => state.messages);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(scrollToBottom, [messages]);

    return  (
        <>
            <Table striped bordered className="my-4">
                <tbody>
                    {
                        messages.map((message,  index) =>
                            <tr key={`msg-${index}`}>
                                <td>{message}</td>
                            </tr>)
                    }
                </tbody>
                
            </Table>
            <div ref={messagesEndRef} />
        </>
    )
}

export default Messages;