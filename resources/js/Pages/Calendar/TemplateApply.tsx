import { Activity, Content, Customer, Service, Template, TimeEntry } from "@/types/calendar";
import { Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import classNames from "classnames";

import css from "./TemplateApply.module.css";


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
    <li>
      <strong>{activity.name}</strong>
      <p>{activity.description}</p>
      {activity.minutes !== null && (
        <div>
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

export default function TemplateApply({ templates, range, customers, services }:
  {
    range: { start: Date | null, end: Date | null },
    customers: Customer[],
    services: Service[],
    templates: Template[],
  }) {

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => template.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  const classes = classNames(css.templateApply, {
    [css.active]: selectedTemplateId !== null,
  });

  return (
    <div className={classes}>
      <div className={css.templates}>
        {templates.map((template) => (
          <TemplateButton
            key={template.id}
            template={template}
            onClick={() => setSelectedTemplateId(template.id)}
            selected={selectedTemplateId === template.id}
          />
        ))}
      </div>
      {selectedTemplate !== null && (<>
        <TemplateDisplay template={selectedTemplate} />

        <Link href={route('template.apply', { template: selectedTemplate.id, date_start: range.start, date_end: range.end })}>
          Customize before applying
        </Link>
      </>
      )}
    </div>
  );

}