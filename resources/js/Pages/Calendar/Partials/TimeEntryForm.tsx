import { useForm } from '@inertiajs/react';
import css from './TimeEntryForm.module.css';
import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Customer, Service, TimeEntry } from '@/types/calendar';
import TextInput from '@/Components/TextInput';
import { on } from 'events';

function ModalConfirm({onClose, onConfirm, className = "", children}:
  {
    onClose: () => void,
    onConfirm: () => void,
    className?: string,
    children: React.ReactNode,
  }
) {
  const classes = classNames({
    [css.modal]: true,
    [className]: className,
    [css.modalBackdrop]: true,
  });

  return (
    <div className={classes}>
      <div className={css.content}>
        {children}
        <div className={css.actions}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({onClose, onConfirm, className = ""}:
  {
    onClose: () => void,
    onConfirm: () => void,
    className?: string,
  }
) {
  return (
    <ModalConfirm onClose={onClose} onConfirm={onConfirm} className={className}>
      <h2>Delete Entry</h2>
      <p>Do you really want to delete this entry?</p>
    </ModalConfirm>
  )
}

function ProjectOption ({project, selected, onClick}: {project: {id: string, name: string}, selected: boolean, onClick: () => void}) {
  const classes = classNames({
    [css.option]: true,
    [css.selected]: selected,
  });

  return (
    <div className={classes} onClick={onClick}>{project.name}</div>
  )
}

function ProjectSelect({customers, onChange, value}: {customers: Customer[], onChange: (value: string) => void, value: string}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const classes = classNames({
    [css.select]: true,
    [css.expanded]: expanded,
  });

  const mappedProjects = useMemo(() => {
    return customers.flatMap((customer) => customer.projects);
  }, [customers]);

  return (
    <div className={classes}>
      <div className={css.selected} onClick={toggleExpanded}>{mappedProjects.find((project) => project.id === value)?.name ?? "Select Project..."}</div>
      <div className={css.options}>
        {customers.map((customer) => (
          <div key={customer.id} className={css.option}>
            <h3>{customer.name}:</h3>
            {customer.projects.map((project) => (
              <ProjectOption
                key={project.id}
                project={project}
                selected={project.id === value}
                onClick={() => onChange(project.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )

}

function EditTimeEntryForm({customers, services, id = null, project_id = null, service_id = null, date_at = new Date(), minutes = 480, note = "", date_editable = true, onSubmitted}:
  {
    customers: Customer[],
    services: Service[],
    id?: string|null,
    project_id?: string|null,
    service_id?: string|null,
    date_at?: Date,
    minutes?: number,
    note?: string,
    date_editable?: boolean,
    onSubmitted?: () => void,
  }) {
    const { data, setData, post, processing, errors, reset, delete: destroy, isDirty} = useForm<{
      project_id: string|null,
      service_id: string|null,
      date_at: Date,
      minutes: number,
      note: string,
    }>({
      project_id: project_id,
      service_id: service_id,
      date_at: date_at || new Date(),
      minutes: minutes,
      note: note,
    });
  
  const classes = classNames({
    [css.form]: true,
    [css.edit]: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteTimeEntry = useCallback(() => {
    destroy(`/time_entries/${id}`);
  }, [destroy]);

  const resetAll = useCallback(() => {
    reset();
  }, [reset]);

  const saveAll = useCallback(() => {
    if (id === null) {
      post(route("entries.store"), {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onSubmitted && onSubmitted();
        }
      });
    } else {
      post(route("entries.update", {id: id}), {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onSubmitted && onSubmitted();
        }
      });
    }
  }, [post, reset, id]);

  const isValid = useMemo(() => {
    return (data.project_id !== null || data.service_id !== null) && data.date_at !== null && data.minutes > 0;
  }, [data]);

  return ([<div className={classes} key={"TimeEntryEditForm"}>
    <TextInput
      type="date"
      value={date_at.toISOString().split("T")[0]}
      onChange={(e) => setData("date_at", new Date(e.target.value))}
      disabled={!date_editable}
    />
    <TextInput
      type="number"
      value={minutes}
      onChange={(e) => setData("minutes", parseInt(e.target.value))}
      placeholder='Minutes'
    />
    <TextInput
      type="textarea"
      value={note}
      onChange={(e) => setData("note", e.target.value)}
      placeholder='Note'
    />
    <ProjectSelect
      customers={customers}
      value={data.project_id || ""}
      onChange={(value) => setData("project_id", value)}
    />
    <div className={css.actions}>
      { id !== null && [
      <button onClick={() => setShowDeleteModal(true)} key={"DeleteButton"}>Delete</button>,
      <button onClick={resetAll} key="ResetButton">Reset</button>
      ]}
      {isDirty && isValid && <button onClick={saveAll}>Save</button>}
    </div>
  </div>,
  showDeleteModal && (<DeleteModal onClose={() => setShowDeleteModal(false)} onConfirm={deleteTimeEntry}/>)
  ]);
}

function TimeEntryCell({timeEntry, className = "", customers, services}: {timeEntry: TimeEntry, className?: string, customers: Customer[], services: Service[]}) {
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
          date_at={new Date(timeEntry.date_at)}
          minutes={timeEntry.minutes}
          note={timeEntry.note}
          onSubmitted={() => setEditing(false)}
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

  return (
    [<div className={classes} key={"TimeEntryForm"}>
      {shownEntries.map((entry) => (
        <TimeEntryCell
          key={entry.id}
          timeEntry={entry}
          customers={customers}
          services={services}
        />
      ))}
    </div>,
    showAddForm && (
      <EditTimeEntryForm
        customers={customers}
        services={services}
        date_at={range_start}
        key={"AddForm"}
        onSubmitted={() => setShowAddForm(false)}
      />
    )
    ]
  )
}