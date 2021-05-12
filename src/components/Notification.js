import React from "react";

const Notification = ({turn, text}) => {
    return(
        <div className="notification-container">
            <span className="notification" id="notification">
                {text}
            </span>
            <span className="header-turn-count">Turn: {turn}</span>
        </div>
    )
}

export default Notification;