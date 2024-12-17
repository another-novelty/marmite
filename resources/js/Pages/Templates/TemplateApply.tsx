import css from "./TemplateApply.module.css";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import classNames from "classnames";
import { Activity, Content, Customer, Project, Service, Template, TimeEntry } from "@/types/calendar";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {DurationInput} from "@/Components/CustomTimeInput";
import { useTimer } from "react-timer-hook";


function TemplateButton({ template, onClick, selected }: { template: Template, onClick: () => void, selected: boolean }) {
  const classes = classNames(css.templateButton, {
    [css.selected]: selected,
  });

  return (
    <button onClick={onClick} className={classes}>
      {template.name}
    </button>
  );
}

function ActivityDisplay({ activity }: { activity: Activity }) {
  return (
    <li className={css.activityDisplay}>
      <strong className={css.name}>{activity.name}:</strong>
      {activity.description !== "" && (
        <p className={css.description}>{activity.description}</p>
      )}
      {activity.minutes !== null && (
        <div className={css.duration}>
          <strong>Duration:</strong> {activity.minutes} minutes
        </div>
      )}
    </li>
  );
}

function ContentDisplay({ content }: { content: Content }) {
  const hours = useMemo(() => {
    const hours = Math.floor(content.minutes / 60);
    const minutes = content.minutes % 60;
    return `${hours}h ${minutes}m`;
  }, [content.minutes]);

  return (
    <div className={css.content}>
      <p className={css.note}>
        {content.note}
      </p>
      <div className={css.details} >
        <div>
          <strong>Start:</strong> {content.start_time}
        </div>
        <div>
          <strong>End:</strong> {content.end_time}
        </div>
        <div>
          <strong>Duration:</strong> {hours}
        </div>
        <div>
          <strong>Pause:</strong> {content.pause_time} minutes
        </div>
        <div>
          <strong>Jitter:</strong> {content.jitter_minutes} minutes
        </div>
        {content.project !== null && (
          <div>
            <strong>Project:</strong> {content.project.name}
          </div>
        )}
        {content.service !== null && (
          <div>
            <strong>Service:</strong> {content.service.name}
          </div>
        )}
        <div>
          <strong>Activities:</strong>
          <ul>
            {content.activities.map((activity, index) => (
              <ActivityDisplay key={index} activity={activity} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TemplateDisplay({ template }: { template: Template }) {
  return (
    <div className={css.templateDisplay}>
      <h3>{template.name}</h3>
      <p>{template.description}</p>

      <div className={css.contents}>
        {template.contents.map((content, index) => (
          <ContentDisplay key={index} content={content} />
        ))}
      </div>
    </div>
  );
}

function convertContent(content: Content): TimeEntry {
  const entry: TimeEntry = {
    id: "",
    date_at: "",
    minutes: content.minutes,
    project_id: content.project?.id ?? null,
    project: content.project,
    service_id: content.service?.id ?? null,
    service: content.service,
    note: content.note,
  };

  // TODO add activities

  return entry;
}

function convertTemplate(template: Template): {
  id: string;
  content: Content;
  entry: TimeEntry;
}[] {
  let entries: {
    id: string;
    content: Content;
    entry: TimeEntry;
  }[] = [];

  for (const content of template.contents) {
    const entry = convertContent(content);
    entries.push({
      id: content.id,
      content,
      entry,
    });
  }

  return entries;
}

function TimeEntryForm({ entry, activities, customers, services, setEntry }: {
  entry: TimeEntry,
  customers: Customer[],
  services: Service[],
  activities: Activity[],
  setEntry: (entry: TimeEntry, action: "note" | "minutes" | "project" | "service") => void,
}) {

  return (
    <div className={css.timeEntryForm}>
      <div className={css.note}>
        <label htmlFor="note">Note</label>
        <input type="text" id="note" value={entry.note} onChange={(e) => setEntry({ ...entry, note: e.target.value }, "note")} />
      </div>
      <div className={css.minutes}>
        <label htmlFor="minutes">Duration</label>
        <DurationInput value={entry.minutes} onChange={(value) => setEntry({ ...entry, minutes: value }, "minutes")} />
      </div>
      <div className={css.project}>
        <label htmlFor="project">Project {entry.project_id} </label>
        <select id="project" value={entry.project_id ?? ""} onChange={(e) => setEntry({ ...entry, project_id: e.target.value }, "project")}>
          <option value="">Select a project</option>
          {customers.map((customer) => (
            <optgroup key={customer.id} label={customer.name}>
              {customer.projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className={css.service}>
        <label htmlFor="service">Service</label>
        <select id="service" value={entry.service_id ?? ""} onChange={(e) => setEntry({ ...entry, service_id: e.target.value }, "service")}>
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </div>
      <div className={css.activities}>
        <label>Activities</label>
        <ul>
          {activities.map((activity, index) => (
            <li key={index} className={css.activity}>
              <strong>{activity.name}</strong>
              {activity.description !== "" && (
                <p className={css.description}>{activity.description}</p>
              )}
              {activity.minutes !== null && (
                <p className={css.duration}>{activity.minutes} minutes</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DateFormat({ date }: { date: string }) {
  const formatted = useMemo(() => {
    const d = new Date(date);
    return d.toLocaleDateString();
  }, [date]);
  return (
    <time dateTime={date}>{formatted}</time>
  );
}

function SuccessPopup({ message, onClose, closeAfter }: { message: string, onClose: () => void, closeAfter: number }) {
  const {start, pause, restart} = useTimer({
    expiryTimestamp: (()=>{
      const d = new Date();
      d.setSeconds(d.getSeconds() + closeAfter);
      return d;
    })(),
    onExpire: onClose,
  })

  return (
    <div className={css.successPopup}>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default function TemplateApplyPage({ auth, mite, template, date_start, date_end, customers, services }:
  PageProps<{
    template: Template,
    date_start: string,
    date_end: string,
    customers: Customer[],
    services: Service[],
  }>) {
  const classes = classNames({
    [css.templateApply]: true
  });

  const { data, setData, post } = useForm<{ mite_access_id: string, template: string, entries: TimeEntry[], include_weekends: boolean, date_start: string, date_end: string }>({
    template: template.id,
    entries: [],
    include_weekends: false,
    date_start: date_start,
    date_end: date_end,
    mite_access_id: mite.apiKeys[0].id,
  });

  function timeEntryReducer(
    state: {
      id: string;
      content: Content;
      entry: TimeEntry;
    }[],
    action: {
      type: "update";
      id: string;
      entry: TimeEntry;
    } | {
      type: "initialize";
      entries?: {
        id: string;
        content: Content;
        entry: TimeEntry;
      }[]
    } | {
      type: "add";
      entry: {
        id: string;
        content: Content;
        entry: TimeEntry;
      };
    } | {
      type: "remove";
      id: string;
    }
  ): {
    id: string;
    content: Content;
    entry: TimeEntry;
  }[] {
    const s = (() => {
      switch (action.type) {
        case "update":
          console.log("Update entry", action.entry);
          return state.map((obj) =>
          (obj.id === action.id ?
            { ...obj, entry: action.entry } :
            obj
          ));
        case "initialize":
          return action.entries ?? [];
        default:
          console.error("Unknown action type", action);
          return state;
      }
    })();
    setData("entries", s.map((obj) => obj.entry));
    return s;
  };

  const [timeEntries, dispatch] = useReducer(timeEntryReducer, []);

  const setEntry = (entry: TimeEntry, actionType: "note" | "minutes" | "project" | "service", id: string) => {
    dispatch({ type: "update", id, entry });
  };

  useEffect(() => {
    const initialEntries = convertTemplate(template);
    dispatch({ type: "initialize", entries: initialEntries });
  }, [template]);

  const [showSuccess, setShowSuccess] = useState(false);

  const applyTemplate = useCallback(() => {
    post(route("entries.storeBatch"), {
      preserveScroll: true,
      onSuccess: () => {
        // show success message
        setShowSuccess(true);
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  }, [data]);

  const total_time = useMemo(() => {
    const time = timeEntries.reduce((acc, obj) => acc + obj.entry.minutes, 0);
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h ${minutes}m`;
  }, [timeEntries]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      miteApiKeys={mite.apiKeys}
      header={<h1 className={css.header}>{template.name}</h1>}
    >
      <Head title={"Apply Template " + template.name} />
      <div className={classes}>
        <div className={css.wrapper}>
          <div className={css.inner}>
            {date_start === date_end ? (
              <h3>On:&nbsp;
                <DateFormat date={date_start} />
              </h3>
            ) : (
              <h3>From:&nbsp;
                <DateFormat date={date_start} />
                <span> to </span>
                <DateFormat date={date_end} />
              </h3>
            )}
            {timeEntries.map((obj, index) => (
              <TimeEntryForm 
                key={index} 
                entry={obj.entry} 
                activities={obj.content.activities} 
                customers={customers} 
                services={services} 
                setEntry={(entry: TimeEntry, action: "note" | "minutes" | "project" | "service") => setEntry(entry, action, obj.id)} />
            ))}
            <span>{template.contents.length} {template.contents.length !== 1 ? "Entries" : "Entry"} - {total_time} </span>
            <div className="actions">
              <button onClick={applyTemplate}>Apply Template</button>
            </div>
            {showSuccess && (
              <SuccessPopup message="Template applied successfully" onClose={() => setShowSuccess(false)} closeAfter={5} />
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}