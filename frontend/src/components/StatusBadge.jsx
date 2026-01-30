import React from 'react';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-800',
        contacted: 'bg-blue-100 text-blue-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-gray-100 text-gray-800',
    };

    const statusKey = status?.toLowerCase();
    const style = statusStyles[statusKey] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
            {t(`queueDashboard.filter.${statusKey}`, status)}
        </span>
    );
};

export default StatusBadge;
