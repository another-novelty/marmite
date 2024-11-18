import { PageProps} from "@/types";
import { Customer, Service, TimeEntryTemplate, TimeEntryTemplateActivity, TimeEntryTemplateContent } from "@/types/calendar";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import {Page} from "@inertiajs/core";
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import classNames from "classnames";

import css from './Edit.module.css';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { ProjectSelect, ServiceSelect } from "@/Components/CustomSelects";
import { DurationInput, TimeInput } from "@/Components/CustomTimeInput";
import { TemplateActivities } from "./Partials/ActivityComponents";

function FormattedTime({ time, className }: { time: Date | string, className?: string }) {
  let date: Date;
  if (typeof time === 'string') {
    date = new Date();
    date.setHours(parseInt(time.split(":")[0]));
    date.setMinutes(parseInt(time.split(":")[1]));
  } else {
    date = time;
  }
  const times = date.toLocaleTimeString().match(/((\d{1,2}):(\d\d?))(:\d\d)? ?((A|P)M)?/);
  let formatted = "";
  if (times) {
    let hours = parseInt(times[2]);
    const minutes = times[3];
    const ampm = times[5];
    if (ampm) {
      if (ampm === "PM" && hours < 12) {
        hours += 12;
      }
      if (ampm === "PM" && hours === 12) {
        hours = 0;
      }
    }
    formatted = hours.toString().padStart(2, '0') + ":" + minutes;
    return <span className={className}>{formatted}</span>;
  }
  return <span className={className}>{date.toLocaleTimeString()}</span>;
}

function TemplateContent({ content, customers, services, selected, onSelect, onSave }: {
  content: TimeEntryTemplateContent,
  customers: Customer[],
  services: Service[],
  selected?: boolean,
  onSelect?: (id: string | null) => void,
  onSave?: (content: TimeEntryTemplateContent) => void,
}) {

  const { data, setData, delete: destroy, patch, errors, processing, reset, isDirty
  } = useForm<TimeEntryTemplateContent>({
    id: content.id,
    jitter_increments: content.jitter_increments,
    jitter_minutes: content.jitter_minutes,
    n_activities: content.n_activities,
    project: content.project ?? null,
    project_id: content.project?.id ?? null,
    service: content.service ?? null,
    service_id: content.service?.id ?? null,
    activities: [],
    minutes: content.minutes,
    start_time: content.start_time,
    pause_time: content.pause_time,
  });

  const [showAvanced, setShowAdvanced] = useState(false);

  useEffect(()=>{
    console.log("Content", content);
  }, [content]);

  const projects = useMemo(() => {
    let projects = [];
    for (const customer of customers) {
      for (const project of customer.projects) {
        projects.push(project);
      }
    }
    return projects;
  }, [customers]);

  const project = useMemo(() => {
    return projects.find((project) => project.id === data.project_id) ?? null;
  }, [projects, data]);

  useEffect(() => {
    setData('project', project);
  }, [project]);

  const customer = useMemo(() => {
    return customers.find((customer) => customer.id === project?.customer_id) ?? null;
  }, [project, customers]);

  const service = useMemo(() => {
    return services.find((service) => service.id === data.service_id) ?? null;
  }, [services, data]);

  useEffect(() => {
    setData('service', service);
  }, [service]);

  const showEdit = useMemo(() => {
    return selected;
  }, [selected]);

  const setShowEdit = useCallback((show: boolean) => {
    if (show) {
      if (onSelect) {
        onSelect(data.id);
      }
    } else {
      if (onSelect) {
        onSelect(null);
      }
      reset();
    }
  }, [onSelect, reset]);

  useEffect(() => {
    if (!showEdit) {
      setShowAdvanced(false);
    }
  }, [showEdit]);

  const endTime = useMemo(() => {
    let start_time = new Date();
    start_time.setSeconds(0);
    start_time.setHours(parseInt(data.start_time.split(":")[0]));
    start_time.setMinutes(parseInt(data.start_time.split(":")[1]));

    let end_time = new Date(start_time);
    end_time.setMinutes(start_time.getMinutes() + data.minutes + data.pause_time);

    return end_time;
  }, [data]);

  const title = useMemo(() => {
    let title = "";
    // if project is selected
    if (project) {
      title += customer!.name + ": " + project.name;

      if (service) {
        title += " - " + service.name;
      }
    } else if (service) {
      title += service.name;
    }

    return title;
  }, [project, customer, service]);

  const classes = classNames({
    [css.content]: true,
    [css.edit]: showEdit,
    [css.advanced]: showAvanced,
  });

  const dataValid = useMemo(() => {
    return true;
  }, [data]);

  const saveContent = useCallback(() => {
    if (!dataValid) {
      return;
    }
    if (data.id === '') {
      return;
    }


    patch(route('timeEntryTemplateContent.update', { timeEntryTemplateContent: data.id }), {
      preserveScroll: true,
      onSuccess: (response: any) => {
        console.log("Success", response);
        if (onSave) {
          onSave(response.props.selectedTemplateContent);
          reset();
        }
      },
      onError: (errors) => {
        console.error("Errors", errors);
      }
    });
  }, [data, patch, dataValid, reset]);

  const destroyContent = useCallback(() => {
    if (data.id === '') {
      return;
    }
    destroy(route('timeEntryTemplateContent.destroy', { content: data.id }));
  }, [data, destroy]);

  const cancelEdit = useCallback(() => {
    setShowEdit(false);
    reset();
  }, [reset]);

  const debugContent = useCallback(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    if (showAvanced) {
      setShowEdit(true);
    }
  }, [showAvanced]);

  useEffect(() => {
    if (errors.project_id || errors.service_id || errors.minutes || errors.n_activities) {
      setShowEdit(true);
    } else if (errors.jitter_increments || errors.jitter_minutes || errors.start_time || errors.pause_time) {
      setShowAdvanced(true);
    }
  }, [errors]);

  return (
    <div className={classes}>
      <div className={css.header}>
        <div className={css.title}>
          (<FormattedTime time={data.start_time} /> - <FormattedTime time={endTime} />) {title}
        </div>
      </div>
      <div className={css.form}>
        <input type="hidden" name="content_id" value={data.id} />
        <ProjectSelect
          id="project"
          name="project"
          value={data.project_id ?? ''}
          className="mt-1 block w-full"
          required
          customers={customers}
          onChange={(id) => setData('project_id', id)}
        />
        {errors.project_id && (
          <InputError message={errors.project_id} />
        )}
        <ServiceSelect
          id="service"
          name="service"
          services={services}
          value={data.service_id ?? ''}
          onChange={(id) => setData('service_id', id)}
        />
        {errors.service_id && (
          <InputError message={errors.service_id} />
        )}
        <DurationInput
          value={data.minutes}
          onChange={(minutes) => setData('minutes', minutes)}
          label="Duration"
          name="minutes"
          required
        />
        {errors.minutes && (
          <InputError message={errors.minutes} />
        )}
        <InputLabel htmlFor="n_activities" value="Number of Activities" />
        <TextInput
          id="n_activities"
          name="n_activities"
          type="number"
          value={data.n_activities}
          className="mt-1 block w-full"
          autoComplete="n_activities"
          isFocused={true}
          onChange={(e) => setData('n_activities', parseInt(e.target.value))}
          required
        />
        {errors.n_activities && (
          <InputError message={errors.n_activities} />
        )}
        {showAvanced && (<>
          <div>
            <InputLabel htmlFor="jitter_minutes" value="Jitter Minutes" />
            <TextInput
              id="jitter_minutes"
              name="jitter_minutes"
              value={data.jitter_minutes}
              className="mt-1 block w-full"
              autoComplete="jitter_minutes"
              isFocused={true}
              onChange={(e) => setData('jitter_minutes', parseInt(e.target.value))}
              required
            />
            {errors.jitter_minutes && (
              <InputError message={errors.jitter_minutes} />
            )}
          </div>

          <div>
            <InputLabel htmlFor="jitter_increments" value="Jitter Increments" />
            <TextInput
              id="jitter_increments"
              name="jitter_increments"
              value={data.jitter_increments}
              className="mt-1 block w-full"
              autoComplete="jitter_increments"
              isFocused={true}
              onChange={(e) => setData('jitter_increments', parseInt(e.target.value))}
              required
            />
            {errors.jitter_increments && (
              <InputError message={errors.jitter_increments} />
            )}
          </div>

          <div>
            <InputLabel htmlFor="start_time" value="Start time" />
            <TimeInput
              id="start_time"
              name="start_time"
              value={data.start_time}
              className="mt-1 block w-full"
              onChange={(value) => setData('start_time', value)}
              required
            />
            {errors.start_time && (
              <InputError message={errors.start_time} />
            )}
          </div>

          <div>
            <DurationInput
              value={data.pause_time}
              onChange={(pause_time) => setData('pause_time', pause_time)}
              label="Pause Time"
              name="pause_time"
              required
            />
            {errors.pause_time && (
              <InputError message={errors.pause_time} />
            )}
          </div>
        </>)}
        {!showAvanced && (<>
          <input type="hidden" name="jitter_minutes" value={data.jitter_minutes} />
          <input type="hidden" name="jitter_increments" value={data.jitter_increments} />
          <input type="hidden" name="start_time" value={data.start_time} />
          <input type="hidden" name="pause_time" value={data.pause_time} />
        </>)}
      </div>
      <div className={css.actions}>
        {showEdit && (<>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAvanced)}
          > Advanced </button>
          <button
            type="button"
            onClick={cancelEdit}
          > Cancel </button>
        </>
        )}
        {!showEdit && (
          <button
            type="button"
            onClick={() => setShowEdit(true)}
          > Edit </button>
        )}
        <button
          type="button"
          onClick={destroyContent}
        > Delete </button>
        {isDirty && (
          <button
            type="button"
            onClick={saveContent}
            disabled={!dataValid || processing}
          > Save </button>
        )}
      </div>
    </div>
  );
}

function TemplateContentForm({ contents, template_id, customers, services, selectedContentId, onSelectContent, onAddContent, onDeleteContent, onChangedContent }: {
  contents: TimeEntryTemplateContent[],
  template_id: string,
  customers: Customer[],
  services: Service[],
  selectedContentId?: string,
  onSelectContent: (contentId: string | null) => void,
  onDeleteContent?: (contentId: string) => void,
  onChangedContent: (content: TimeEntryTemplateContent) => void,
  onAddContent?: () => void,
}) {

  const [showingAdd, setShowingAdd] = useState(false);

  const showAddDialog = useCallback((value: boolean) => {
    if (onSelectContent) {
      onSelectContent(null);
    }
    setShowingAdd(value);
  }, []);

  const classes = classNames({
    [css.contentForm]: true,
    [css.adding]: showingAdd,
  });

  return (
    <div className={classes}>
      {contents.map((content, index) => (
        <TemplateContent
          key={index}
          content={content}
          customers={customers}
          services={services}
          selected={content.id === selectedContentId}
          onSelect={(id) => {
            onSelectContent(id);
          }}
          onSave={onChangedContent}
        />
      ))}
      <div>
        <button
          type="button"
          onClick={() => showAddDialog(true)}
        > Add Entry Template </button>
      </div>
    </div>
  );
}

export default function EditTemplate({
  auth,
  mite,
  miteAPIKey,
  template,
  customers,
  services,
  selectedTemplateContent,
}: PageProps<{
  miteAPIKey: { id: string, name: string },
  template: TimeEntryTemplate,
  customers: Customer[],
  services: Service[],
  selectedTemplateContent: TimeEntryTemplateContent | null,
}> ) {

  const { data, setData, post, errors, processing } = useForm<{
    name: string,
    description: string,
  }>({
    name: template.name,
    description: template.description ?? '',
  });

  const [content, setContent] = useState<TimeEntryTemplateContent[]>(template.contents);

  const saveAll = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing) {
      return;
    }
    if (data.name === '') {
      return;
    }
    post(route('templates.update', { mite_access: miteAPIKey.id, template: template.id }), {
      preserveScroll: true,
      onSuccess: (response) => {
        console.log("Success", response);
      },
      onError: (errors) => {
        console.error("Errors", errors);
      }
    });
  }, [post, data, processing]);

  const [selectedContent, setSelectedContent] = useState<TimeEntryTemplateContent | null>(() => {
    if (selectedTemplateContent) {
      return selectedTemplateContent;
    }
    return null;
  });

  const activityReducer = (state: TimeEntryTemplateActivity[], action: { type: "add" | "update", payload: TimeEntryTemplateActivity} |
    {type: "remove", payload: {id: string}} |
    {type: "set", state_override: TimeEntryTemplateActivity[]}) => {
    switch (action.type) {
      case 'add':
        return [...state, action.payload];
      case 'remove':
        return state.filter((activity) => activity.id !== action.payload.id);
      case 'update':
        return state.map((activity) => {
          if (activity.id === action.payload.id) {
            return action.payload;
          }
          return activity;
        });
      case 'set':
        return action.state_override;
      default:
        return state;
    }
  }

  const [activities, dispatchActivities] = useReducer(activityReducer, selectedContent?.activities ?? []);

  useEffect(() => {
    dispatchActivities({type: 'set', state_override: selectedContent?.activities ?? []});
  }, [selectedContent]);

  const onChangedContent = useCallback((newContent: TimeEntryTemplateContent) => {
    // Update the content in the template
    let newContents = [];
    for (const oldContent of content) {
      if (oldContent.id === newContent.id) {
        newContents.push(newContent);
      } else {
        newContents.push(oldContent);
      }
    }
    console.log(newContents);
    setContent(newContents);
  }, [content]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h1 className="dark:text-white font-bold text-xl">Create new Template</h1>}
      miteApiKeys={mite.apiKeys}
    >
      <Head title="Create Template"></Head>
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg dark:text-white p-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="ml-auto mt-6">
                <form onSubmit={saveAll} className="flex flex-col mx-auto">
                  <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                      id="name"
                      name="name"
                      value={data.name}
                      className="mt-1 block w-full"
                      autoComplete="name"
                      isFocused={true}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />

                    <InputError message={errors.name} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="description" value="Description" />
                    <TextInput
                      id="description"
                      name="description"
                      value={data.description}
                      className="mt-1 block w-full"
                      autoComplete="description"
                      isFocused={true}
                      onChange={(e) => setData('description', e.target.value)}
                    />

                    <InputError message={errors.description} className="mt-2" />
                  </div>

                  <div className="actions">
                    <button type="submit">{processing ? "Saving..." : "Save"}</button>
                  </div>
                </form>

              </div>
              <div>
                <TemplateContentForm
                  contents={content}
                  template_id={template.id}
                  customers={customers}
                  services={services}
                  selectedContentId={selectedContent?.id}
                  onSelectContent={(contentId) => {
                    if (contentId) {
                      setSelectedContent(template.contents.find((content) => content.id === contentId) ?? null);
                    } else {
                      setSelectedContent(null);
                    }
                  }}
                  onAddContent={() => {
                    console.log("Add Content");
                  }}
                  onChangedContent={onChangedContent}
                />
              </div>
            </div>
            {selectedContent && (
              <TemplateActivities
                activities={activities}
                content_id={selectedContent.id}
                onAddActivity={(activity) => { dispatchActivities({type: 'add', payload: activity}) }}
                onRemoveActivity={(id) => { dispatchActivities({type: 'remove', payload: {id: id}}) }}
                onUpdatedActivity={(activity) => { dispatchActivities({type: 'update', payload: activity}) }}
              />
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}