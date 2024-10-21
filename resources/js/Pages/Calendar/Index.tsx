import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

export default function Calendar({ auth , miteAPIKey, projects}: PageProps<{miteAPIKey: {id: string, name: string}, projects: any}>) {
    console.log(miteAPIKey);
    
    console.log(projects);
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Calendar {miteAPIKey.name}</h2>}
        >
            <Head title="Calendar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">Hi {auth.user.name}!</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
