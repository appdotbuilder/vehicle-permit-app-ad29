import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

interface Employee {
    id: number;
    employee_id: string;
    name: string;
    department: string;
    grade: string;
    email: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface PermitRequest {
    id: number;
    start_datetime: string;
    end_datetime: string;
    vehicle_type: string;
    license_plate: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    reviewed_at?: string;
    created_at: string;
    employee: Employee;
    reviewer?: User;
}

interface Props {
    request: PermitRequest;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Permit Requests',
        href: '/permit-requests',
    },
    {
        title: 'View Request',
        href: '#',
    },
];

export default function ShowAdminPermitRequest({ request }: Props) {
    const [processing, setProcessing] = React.useState(false);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStatusUpdate = (newStatus: 'approved' | 'rejected') => {
        let notes = null;
        
        if (newStatus === 'rejected') {
            notes = prompt('Please provide a reason for rejection:');
            if (!notes) return; // User cancelled
        }

        setProcessing(true);
        router.patch(route('permit-requests.update', request.id), {
            status: newStatus,
            notes: notes,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    const getStatusBadge = (status: string) => {
        const classes = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };

        const icons = {
            pending: '⏳',
            approved: '✅',
            rejected: '❌',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${classes[status as keyof typeof classes]}`}>
                <span className="mr-1">{icons[status as keyof typeof icons]}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permit Request #${request.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Vehicle Permit Request #{request.id}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Submitted on {formatDateTime(request.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {getStatusBadge(request.status)}
                        {request.status === 'pending' && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={processing}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Employee Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Employee Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Employee ID:</span>
                                <span className="text-gray-900 dark:text-white font-mono">{request.employee.employee_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Name:</span>
                                <span className="text-gray-900 dark:text-white">{request.employee.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Department:</span>
                                <span className="text-gray-900 dark:text-white">{request.employee.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Grade:</span>
                                <span className="text-gray-900 dark:text-white">{request.employee.grade}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Email:</span>
                                <span className="text-gray-900 dark:text-white">{request.employee.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Vehicle Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Vehicle Type:</span>
                                <span className="text-gray-900 dark:text-white">{request.vehicle_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">License Plate:</span>
                                <span className="text-gray-900 dark:text-white font-mono text-lg">{request.license_plate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Usage Period */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0V3m6 4v2m0 0l-3 3-3-3m6 0v2" />
                            </svg>
                            Usage Period
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Start Date & Time:</span>
                                <span className="text-gray-900 dark:text-white">{formatDateTime(request.start_datetime)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">End Date & Time:</span>
                                <span className="text-gray-900 dark:text-white">{formatDateTime(request.end_datetime)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Duration:</span>
                                <span className="text-gray-900 dark:text-white">
                                    {Math.ceil((new Date(request.end_datetime).getTime() - new Date(request.start_datetime).getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Request Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Request Status
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600 dark:text-gray-300">Status:</span>
                                {getStatusBadge(request.status)}
                            </div>
                            {request.reviewed_at && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Reviewed At:</span>
                                    <span className="text-gray-900 dark:text-white">{formatDateTime(request.reviewed_at)}</span>
                                </div>
                            )}
                            {request.reviewer && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Reviewed By:</span>
                                    <span className="text-gray-900 dark:text-white">{request.reviewer.name}</span>
                                </div>
                            )}
                            {request.notes && (
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Notes:</span>
                                    <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                        {request.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Link
                        href={route('permit-requests.index')}
                        className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 font-medium"
                    >
                        ← Back to All Requests
                    </Link>
                    
                    {request.status === 'pending' && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
                            💡 This request is waiting for your review. Use the approve/reject buttons above to take action.
                        </div>
                    )}
                    
                    {request.status === 'approved' && (
                        <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                            ✅ Request has been approved and employee has been notified.
                        </div>
                    )}
                    
                    {request.status === 'rejected' && (
                        <div className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                            ❌ Request has been rejected and employee has been notified.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}