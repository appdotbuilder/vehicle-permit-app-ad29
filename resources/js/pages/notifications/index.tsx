import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    data?: Record<string, unknown>;
    read: boolean;
    read_at?: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    notifications: PaginatedNotifications;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

export default function NotificationIndex({ notifications }: Props) {
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const markAsRead = (notification: Notification) => {
        if (!notification.read) {
            router.patch(route('notifications.update', notification.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const markAllAsRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'permit_request':
                return '📝';
            case 'status_update':
                return '🔔';
            default:
                return '📢';
        }
    };

    const unreadCount = notifications.data.filter(n => !n.read).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔔 Notifications</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Stay updated with system notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            All Notifications ({notifications.total} total)
                        </h3>
                    </div>
                    
                    {notifications.data.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-200 dark:divide-gray-600">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-6 cursor-pointer transition-colors ${
                                            !notification.read 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => markAsRead(notification)}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <span className="text-2xl">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${
                                                        !notification.read 
                                                            ? 'text-gray-900 dark:text-white' 
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {notification.title}
                                                        {!notification.read && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                                New
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDateTime(notification.created_at)}
                                                    </p>
                                                </div>
                                                <p className={`mt-1 text-sm ${
                                                    !notification.read 
                                                        ? 'text-gray-800 dark:text-gray-200' 
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                {notification.data && typeof notification.data.permit_request_id === 'number' && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={`/permit-requests/${notification.data.permit_request_id}`}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            View Request →
                                                        </a>
                                                    </div>
                                                )}
                                                {notification.read_at && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Read on {formatDateTime(notification.read_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {notifications.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing {(notifications.current_page - 1) * notifications.per_page + 1} to{' '}
                                            {Math.min(notifications.current_page * notifications.per_page, notifications.total)} of{' '}
                                            {notifications.total} results
                                        </div>
                                        <div className="flex space-x-1">
                                            {notifications.links.map((link, index) => {
                                                if (!link.url) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500"
                                                        >
                                                            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <a
                                                        key={index}
                                                        href={link.url}
                                                        className={`px-3 py-2 text-sm rounded-md ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h1v12z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                You're all caught up! No notifications to show.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}