import { useForm } from '@inertiajs/react';
import css from './TimeEntryForm.module.css';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Customer, Service, TimeEntry } from '@/types/calendar';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { ProjectSelect, ServiceSelect } from '@/Components/CustomSelects';
import { DurationInput } from '@/Components/CustomTimeInput';

export function EditTimeEntryForm({customers, services, id, project_id, service_id, date_start, date_end, single_day, minutes, note, date_editable = true, mite_access_id, onSubmitted, onCanceled}:
  {
    customers: Customer[],
    services: Service[],
    id?: string,
    project_id?: string,
    service_id?: string,
    date_start?: Date,
    date_end?: Date,
    single_day?: boolean,
    minutes?: number,
    note?: string,
    date_editable?: boolean,
    mite_access_id: string,
    onSubmitted?: () => void,
    onCanceled?: () => void,
  }) {
    const { data, setData, post, processing, errors, reset, delete: destroy, isDirty, put} = useForm<{
      project_id: string,
      service_id: string,
      date_start: Date,
      date_end: Date,
      minutes: number,
      note: string,
      mite_access_id: string,
    }>({
      project_id: project_id ?? "",
      service_id: service_id ?? "",
      date_start: date_start || new Date(),
      date_end: date_end || new Date(),
      minutes: minutes || 480,
      note: note || "",
      mite_access_id: mite_access_id,
    });
  
  const classes = classNames({
    [css.form]: true,
    [css.edit]: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const resetAll = useCallback(() => {
    reset();
  }, [reset]);

  const formattedStart = useMemo(() => {
    return data.date_start.toISOString().split("T")[0];
  }, [data.date_start]);

  const formattedEnd = useMemo(() => {
    console.log(data.date_end);
    return data.date_end.toISOString().split("T")[0];
  }, [data.date_end]);

  const saveAll = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Save", data);
    if (id) {
      put(route("entries.update", {entry: id}), {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onSubmitted && onSubmitted();
        },
        onError: (e) => {
          console.error(e);
        }
      });
    } else {
      post(route("entries.store"), {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onSubmitted && onSubmitted();
        },
        onError: (e) => {
          console.error(e);
        }
      });
    }
  }, [post, reset, id, data, onSubmitted, errors]);

  const isValid = useMemo(() => {
    return (data.project_id !== null || data.service_id !== null) && data.date_start !== null && data.minutes > 0;
  }, [data]);

  return ([<div className={classes} key={"TimeEntryEditForm"}>
    <form onSubmit={saveAll}>
      <div className={css.dates}>
        { single_day && (
          <label htmlFor='date_start' className={css.startLabel}>Date</label>
        )}
        { !single_day && (
          <label htmlFor='date_start' className={css.startLabel}>Start Date</label>
        )}
        <TextInput
          type="date"
          value={formattedStart}
          onChange={(e) => setData("date_start", new Date(e.target.value))}
          disabled={!date_editable}
          className={css.startDate}
        />
        { !single_day && (
          <>
            <span>to</span>
            <label htmlFor='date_end'>End Date</label>
            <TextInput
              type="date"
              value={formattedEnd}
              onChange={(e) => setData("date_end", new Date(e.target.value))}
              disabled={!date_editable}
              className={css.endDate}
            />
          </>
        )}
      </div>
      <ProjectSelect
        customers={customers}
        value={data.project_id}
        onChange={(value) => setData("project_id", value)}
      />
      <ServiceSelect
        services={services}
        value={data.service_id}
        onChange={(value) => setData("service_id", value)}
      />
      <label htmlFor='minutes'>Duration</label>
      <DurationInput
        value={data.minutes}
        onChange={(value) => setData("minutes", value)}
        type="hours-minutes"
        className={css.duration}
      />
      <TextInput
        value={note}
        onChange={(e) => setData("note", e.target.value)}
        placeholder='Note'
        className={css.note}
      />
      <input type="hidden" value={mite_access_id} name="mite_access_id" />
      <div className={css.actions}>
        { id && [
        <button onClick={() => setShowDeleteModal(true)} key={"DeleteButton"}>Delete</button>,
        <button onClick={resetAll} key="ResetButton">Reset</button>
        ]}
        {isDirty && isValid && <button type="submit" disabled={processing} key={"SaveButton"}>Save</button>}
        {onCanceled && <button onClick={onCanceled} key={"CancelButton"}>Cancel</button>}
      </div>
    </form>
  </div>,
  ]);
}

export function TimeEntryCell({timeEntry, className = "", customers, services, mite_access_id, onDelete}: {timeEntry: TimeEntry, className?: string, customers: Customer[], services: Service[], mite_access_id: string, onDelete?: (id: string) => void}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const [editing, setEditing] = useState(false);

  const time_formatted = useMemo(() => {
    return Math.floor(timeEntry.minutes / 60) + "h " + timeEntry.minutes % 60 + "m";
  }, [timeEntry.minutes]);

  const desc = useMemo(() => {
    if (timeEntry.project) {
      return timeEntry.project.name;
    }
    if (timeEntry.service) {
      return timeEntry.service.name;
    }
    return "Unknown";
  }, [timeEntry.project, timeEntry.service]);

  const classes = classNames({
    [css.cell]: true,
    [className]: className,
    [css.expanded]: expanded,
    [css.editing]: editing,
  });

  return (
    <div className={classes}>
      {editing && <>
        <EditTimeEntryForm 
          customers={customers}
          services={services} 
          date_editable={false}
          id={timeEntry.id}
          project_id={timeEntry.project?.id}
          service_id={timeEntry.service?.id}
          date_start={new Date(timeEntry.date_at)}
          single_day={true}
          minutes={timeEntry.minutes}
          note={timeEntry.note}
          onSubmitted={() => setEditing(false)}
          onCanceled={() => setEditing(false)}
          mite_access_id={mite_access_id}
        />
        <button onClick={() => setEditing(false)}>Cancel</button>
      </>}
      { editing === false && (<>
        <div className={css.expand} onClick={toggleExpanded}>{expanded ? "▼" : "▶"}</div>
        <div className={css.date}>{new Date(timeEntry.date_at).toLocaleDateString("de", {timeZone: "UTC"})}</div>
        <div className={css.desc}>{desc}</div>
        <div className={css.duration}>{time_formatted}</div>
        <div className={css.details} style={expanded === false ? {height: 0} : {}}>
          <div className={css.service}>{timeEntry.service?.name}</div>
          <div className={css.project}>{timeEntry.project?.name}</div>
          <div className={css.note}>{timeEntry.note}</div>
          <div className={css.actions}>
            <button onClick={() => setEditing(true)}>Edit</button>
            {onDelete && <button onClick={() => onDelete(timeEntry.id)}>Delete</button>}
          </div>
        </div>
      </>)}
    </div>
  )
}

export default function TimeEntryOverview({customers, services, time_entries, range_start, range_end, className = "", expanded = false}:
  {
    customers: Customer[],
    services: Service[],
    time_entries: TimeEntry[],
    range_start: Date,
    range_end: Date,
    className?: string,
    expanded?: boolean,
  }
) {
  const [showAddForm, setShowAddForm] = useState(false);

  const classes = classNames({
    [css.form]: true,
    [className]: className,
    [css.expanded]: expanded,
  });

  const shownEntries = useMemo(() => {
    return time_entries.filter((entry) => {
      const date_at = new Date(entry.date_at);
      return date_at >= range_start && date_at <= range_end;
    });
  }, [time_entries, range_start, range_end]);

  useEffect(() => {
    if (shownEntries.length === 0) {
      setShowAddForm(true);
    }
  }, [time_entries]);

  return (
    [<div className={classes} key={"TimeEntryForm"}>
      {shownEntries.length === 0 && <h3 className={css.noEntries}>No Entries</h3>}
      {shownEntries.map((entry) => (
        <TimeEntryCell
          key={entry.id}
          timeEntry={entry}
          customers={customers}
          services={services}
          mite_access_id={''}
        />
      ))}
    </div>,
    showAddForm && (
      <div className={css.addForm} key={"AddTimeEntryForm"}>
        <h3>Create new Time Entry</h3>
        <EditTimeEntryForm
          customers={customers}
          services={services}
          date_start={range_start}
          date_end={range_end}
          key={"AddForm"}
          mite_access_id={''}
        />
      </div>
    )
    ]
  )
}