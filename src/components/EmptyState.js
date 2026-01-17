import React from 'react';
import './EmptyState.css';

const EmptyState = ({
    icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    learnMoreLink
}) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                {icon}
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            <div className="empty-state-actions">
                {primaryAction && (
                    <div className="empty-state-primary">
                        {primaryAction}
                    </div>
                )}
                {secondaryAction && (
                    <div className="empty-state-secondary">
                        {secondaryAction}
                    </div>
                )}
            </div>
            {learnMoreLink && (
                <div className="empty-state-learn-more">
                    {learnMoreLink}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
