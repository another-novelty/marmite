import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, useState } from 'react';
import Calendar from './Partials/Calendar';
import SyncButton from './Partials/SyncButton';
import TimeEntryForm from './Partials/TimeEntryForm';
import { Customer, Service, TimeEntry } from '@/types/calendar';

export default function CalendarComponent({ auth , miteAPIKey, customers = [], services = [], time_entries = []}: 
    PageProps<{
        miteAPIKey: {id: string, name: string}, 
        customers?: Customer[], 
        services?: Service[],
        time_entries?: TimeEntry[],
    }>) {

    const [range, setRange] = useState<{start: Date, end: Date}>({start: new Date(), end: new Date()});

    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const onSelect = useCallback((start: Date, end: Date) => {
      setRange({start, end});
    }, [setRange]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Calendar {miteAPIKey.name}</h2>}
        >
            <Head title="Calendar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                          <SyncButton
                              miteAPIKey={miteAPIKey}
                              onSuccess={() => {
                                  console.log("Synced");
                              }}
                              onError={(errors) => {
                                  console.log(errors);
                              }}
                          >
                            Sync
                          </SyncButton>
                          <Calendar
                              customers={customers}
                              services={services}
                              entries={time_entries}
                              onSelect={onSelect}
                          />
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                          <TimeEntryForm 
                              customers={customers}
                              services={services}
                              time_entries={time_entries}
                              range_start={range.start}
                              range_end={range.end}
                              expanded={true}
                          />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
