import React, { useState } from 'react';
import './Tooltip.css';

const Tooltip = ({ content, children, position = 'top' }) => {
    const [show, setShow] = useState(false);

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className={`tooltip-content tooltip-${position}`}>
                    {content}
                    <div className="tooltip-arrow"></div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
