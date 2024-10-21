import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, ChangeEvent } from 'react';

export default function Dashboard({ auth , hasMiteAccess, miteApiKeys}: PageProps<{hasMiteAccess: boolean, miteApiKeys: {id: string, access_token: string}[]}>) {

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
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">Hi {auth.user.name}!</div>
                        { hasMiteAccess && (
                            <select
                                onChange={gotToCalendar}
                                className=""
                            >
                                <option value="">Select a key</option>
                                {miteApiKeys.map((key: {id: string, access_token: string}) => (
                                    <option key={key.id} value={key.id}>{key.access_token}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
