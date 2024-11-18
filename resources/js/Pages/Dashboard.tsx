import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, ChangeEvent } from 'react';

function MiteSelector({ miteApiKeys, onChange }: {onChange: (e: ChangeEvent<HTMLSelectElement>) => void, miteApiKeys: {id: string, name: string}[]}) {
    return (
    <select
        onChange={onChange}
        className=""
    >
        <option value="">Select a key</option>
        {miteApiKeys.map((key: {id: string, name: string}) => (
            <option key={key.id} value={key.id}>{key.name}</option>
        ))}
    </select>)
}

export default function Dashboard({ auth , hasMiteAccess, mite}: PageProps<{hasMiteAccess: boolean}>) {

    const gotToCalendar = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        if (e.target.value) {
            const mite_access_id = e.target.value;
            window.location.href = route('calendar.show', {mite_access_id});
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
            miteApiKeys={mite.apiKeys}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">Hi {auth.user.name}!</div>
                        { mite.apiKeys.length == 0 && (
                            <div>
                                <div className="p-6 text-gray-900 dark:text-gray-100">You don't seem to have access to Mite yet.</div>
                                <Link
                                    href={route('profile.edit')}
                                    as='button'
                                    className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    To Settings
                                </Link>
                            </div>
                        )}
                        { mite.apiKeys.length == 1 && (
                            <Link
                                href={route('calendar.show', mite.apiKeys.at(0))}
                                as="button"
                                className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                To calendar
                            </Link>
                        )}
                        { mite.apiKeys.length > 1 && (
                            <div>
                                <div className="p-6 text-gray-900 dark:text-gray-100">Please select a key to view the calendar</div>
                                <MiteSelector miteApiKeys={mite.apiKeys} onChange={gotToCalendar} />
                            </div>
                            
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
