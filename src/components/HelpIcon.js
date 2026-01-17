import React from 'react';
import Tooltip from './Tooltip';
import { HelpCircle } from 'lucide-react';
import { GLOSSARY } from '../utils/glossary';
import './HelpIcon.css';

const HelpIcon = ({ topic }) => {
    const helpContent = GLOSSARY[topic];

    if (!helpContent) return null;

    const tooltipText = `${helpContent.definition}${helpContent.example ? ` (e.g., ${helpContent.example})` : ''}`;

    return (
        <Tooltip content={tooltipText} position="top">
            <span className="help-icon">
                <HelpCircle size={16} />
            </span>
        </Tooltip>
    );
};

export default HelpIcon;
