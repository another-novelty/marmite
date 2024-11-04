import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import Calendar from './Partials/Calendar';
import SyncButton from './Partials/SyncButton';
import {EditTimeEntryForm, TimeEntryCell} from './Partials/TimeEntryForm';
import { Customer, Service, TimeEntry } from '@/types/calendar';
import Modal from '@/Components/Modal';

export default function CalendarComponent({ auth, miteAPIKey, customers = [], services = [], time_entries = [] }:
  PageProps<{
    miteAPIKey: { id: string, name: string },
    customers?: Customer[],
    services?: Service[],
    time_entries?: TimeEntry[],
  }>) {

  const [range, setRange] = useState<{ start: Date | null, end: Date | null}>({ start: null, end: null});

  const onSelect = useCallback((start: Date|null, end: Date|null) => {
    setRange({ start, end });
  }, [setRange]);

  const [mode, setMode] = useState<"create" | "edit" | "calendar">("calendar");

  const shownEntries = useMemo(() => {
    if (range.start === null || range.end === null) {
      return [];
    }
    return time_entries.filter((entry) => {
      const date_at = new Date(entry.date_at);
      return date_at >= range.start! && date_at <= range.end!;
    });
  }, [time_entries, range]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {data, setData, delete: destroy} = useForm<{id: string|null}>({id: null});

  const confirmDelete = useCallback((id: string) => {
    setData('id', id);
    setShowDeleteModal(true);
  }, [setShowDeleteModal, setData]);

  const deleteTimeEntry = useCallback(() => {
    if (data.id) {
      destroy(route('entries.destroy', data.id), {
        preserveScroll: true,
        onSuccess: () => {
          setShowDeleteModal(false);
        },
        onError: (errors) => {
          console.error(errors);
        }
      });
    }
  }, [data, setShowDeleteModal]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Calendar {miteAPIKey.name}</h2>}
    >
      <Head title="Calendar" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">

            {mode === "calendar" && (<>
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
            <div className="my-5 p-5 grid grid-cols-3 gap-5">
              { shownEntries.length > 0 && shownEntries.map((entry) => (
                <TimeEntryCell
                  key={entry.id}
                  timeEntry={entry}
                  customers={customers}
                  services={services}
                  mite_access_id={miteAPIKey.id}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
            <div className="actions flex justify-center mt-4">
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                onClick={() => setMode("create")}
              >
                Create new time entry
              </button>
            </div>
            </>)}
            {mode === "create" && (
              <div className='dark:text-white p-5'>
                <h2>Create new Time Entry</h2>
                <EditTimeEntryForm
                  customers={customers}
                  services={services}
                  date_start={range.start ?? new Date()}
                  date_end={range.end ?? new Date()}
                  date_editable={false}
                  onSubmitted={() => {setMode("calendar")}}
                  onCanceled={() => {setMode("calendar")}}
                  mite_access_id={miteAPIKey.id}
                />
              </div>
            )}
          </div>
        </div>

        <Modal
          key={"DeleteModal"} 
          show={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)}
          maxWidth="sm"
        >
          <div className="dark:text-white m-5">
            <h2 className="text-xl font-bold">Delete Time Entry</h2>
            <p>Are you sure you want to delete this time entry?</p>
            <div className="flex justify-end gap-5 mt-5">
              <button 
                onClick={deleteTimeEntry}
                className='bg-red-500 hover:bg-red-600 text-white rounded p-4'
              >
                Delete
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className='bg-gray-500 hover:bg-gray-600 text-white rounded p-4'
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}
