import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import Calendar from './Partials/Calendar';
import SyncButton from './Partials/SyncButton';
import { EditTimeEntryForm, TimeEntryCell } from './Partials/TimeEntryForm';
import { Customer, Service, TimeEntry, Template } from '@/types/calendar';
import Modal from '@/Components/Modal';
import TemplateApply from './TemplateApply';
import css from './Index.module.css';

export default function CalendarPage({ auth, miteAPIKey, customers = [], services = [], time_entries = [], mite, templates, month }:
  PageProps<{
    miteAPIKey: { id: string, name: string },
    customers?: Customer[],
    services?: Service[],
    time_entries?: TimeEntry[],
    templates: Template[],
    month: string,
  }>) {
  const [range, setRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

  const onSelect = useCallback((start: Date | null, end: Date | null) => {
    setRange({ start, end });
  }, [setRange]);

  const [mode, setMode] = useState<"create" | "edit" | "calendar" | "template">("calendar");

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
  const { data, setData, delete: destroy } = useForm<{ id: string | null }>({ id: null });

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

  const setMonth = useCallback((next_month: Date) => {
    console.log("Current month", month, new Date(month).toISOString().split('T')[0]);
    console.log("Set month", next_month.toISOString().split('T')[0]);
    router.get(route('calendar.show', { mite_access: miteAPIKey, month: next_month.getFullYear() + "-" + (next_month.getMonth() + 1) }));
  }, [month, miteAPIKey]);

  const deleteSelectedEntries = useCallback(() => {
    const ids = shownEntries.map((entry) => entry.id);
    console.log("Delete selected entries", ids);
    router.post(route('entries.destroyMultiple'), { ids });

  }, [shownEntries]);

  const total_hours = useMemo(() => {
    return time_entries.reduce((acc, entry) => acc + entry.minutes / 60, 0);
  }, [time_entries]);

  const selected_hours = useMemo(() => {
    return shownEntries.reduce((acc, entry) => acc + entry.minutes / 60, 0);
  }, [shownEntries]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Calendar {miteAPIKey.name}</h2>}
      miteApiKeys={mite.apiKeys}
    >
      <Head title="Calendar" />

      <div className="py-12 dark:text-white">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            {mode === "calendar" && (<>
              <div className="p-6 text-gray-900 dark:text-gray-100">
                <div className={css.calendarActions}>
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
                  <div className={css.info}>
                    Total: {total_hours} hours
                  </div>
                </div>
                <Calendar
                  customers={customers}
                  services={services}
                  entries={time_entries}
                  onSelect={onSelect}
                  month={new Date(month)}
                  setMonth={setMonth}
                />
              </div>
              {shownEntries.length > 0 && (
                <div className={css.selectedEntries}>
                  <p className={css.info}>Total: {selected_hours} hours</p>
                  <div className={css.selecetedEntriesGrid}>
                    {shownEntries.map((entry) => (
                      <TimeEntryCell
                        key={entry.id}
                        timeEntry={entry}
                        customers={customers}
                        services={services}
                        mite_access_id={miteAPIKey.id}
                        onDelete={confirmDelete}
                      />))}
                  </div>
                </div>
              )}
              <div className="actions flex justify-center my-4 gap-4">
                <button
                  className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  onClick={() => setMode("template")}
                >Apply a template</button>
                <button
                  className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  onClick={() => setMode("create")}
                >
                  Create new time entry
                </button>
                {shownEntries.length > 0 && (
                  <button
                    className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                    onClick={deleteSelectedEntries}
                  >
                    Delete selected time entries
                  </button>
                )}
              </div>
            </>)}
            {mode !== "calendar" && (
              <button onClick={() => setMode("calendar")} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                Back to calendar
              </button>
            )}
            {mode === "template" && (
              <div className='p-5'>
                <h2>Apply a template</h2>
                {templates.length === 0 && (
                  <div>
                    <h3>No templates found</h3>
                    <p>
                      You can create templates in the <Link href={route('template.index', {mite_access: miteAPIKey} )}>templates section</Link>.
                    </p>
                  </div>
                )}
                {templates.length > 0 && <TemplateApply range={range} customers={customers} services={services} templates={templates} />}
              </div>)}
            {mode === "create" && (
              <div className='p-5'>
                <h2>Create new Time Entry</h2>
                <EditTimeEntryForm
                  customers={customers}
                  services={services}
                  date_start={range.start ?? new Date()}
                  date_end={range.end ?? new Date()}
                  date_editable={false}
                  onSubmitted={() => { setMode("calendar") }}
                  onCanceled={() => { setMode("calendar") }}
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
          <div className="m-5">
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
