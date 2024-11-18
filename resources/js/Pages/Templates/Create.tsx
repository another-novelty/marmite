import { PageProps } from "@/types";
import { Customer, Service, TimeEntryTemplate, TimeEntryTemplateActivity, TimeEntryTemplateContent } from "@/types/calendar";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import classNames from "classnames";

import css from './Create.module.css';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { ProjectSelect, ServiceSelect } from "@/Components/CustomSelects";
import { DurationInput } from "@/Components/CustomTimeInput";


function ActivityForm({ activity, setActivity, removeActivity}: {
  activity: TimeEntryTemplateActivity,
  setActivity?: (activity: TimeEntryTemplateActivity) => void,
  removeActivity?: () => void,
}) {

  const classes = classNames({
    [css.activityForm]: true,
  });

  return (
    <div className={classes}>
      Activity...
    </div>
  );
}

function TemplateActivities({ activities, setActivities}: {
  activities: TimeEntryTemplateActivity[],
  setActivities?: (activities: TimeEntryTemplateActivity[]) => void,
}) {

  const classes = classNames({
    [css.activities]: true,
  });


  return (
    <div className={classes}>
      {activities.map((activity, index) => (
        <ActivityForm
          key={index}
          activity={activity}
          setActivity={(activity) => {
            if (!setActivities) {
              return;
            }
            let newActivities = JSON.parse(JSON.stringify(activities));
            newActivities[index] = activity;
            setActivities(newActivities);
          }}
          removeActivity={() => {
            if (!setActivities) {
              return;
            }
            let newActivities = JSON.parse(JSON.stringify(activities));
            newActivities.splice(index, 1);
            setActivities(newActivities);
          }}
        />
      ))}
    </div>
  );
}

function TemplateContent({ content, setTemplateContent,  customers, services}: {
  content: TimeEntryTemplateContent,
  setTemplateContent: (content: TimeEntryTemplateContent) => void
  customers: Customer[]
  services: Service[]
}) {

  const classes = classNames({
    [css.content]: true,
  });

  const projects = useMemo(() => {
    let projects = [];
    for (const customer of customers) {
      for (const project of customer.projects) {
        projects.push(project);
      }
    }
    return projects;
  }, [customers]);

  const setProject = useCallback((id: string) => {
    const project = projects.find((project) => project.id === id) ?? null;
    setTemplateContent({ ...content, project });
  }, [content, setTemplateContent]);

  return (
    <div className={classes}>
      <input type="hidden" name="content_id" value={content.id} />

      <div>
        <ProjectSelect
          id="project"
          name="project"
          value={content.project?.id ?? ''}
          className="mt-1 block w-full"
          required
          customers={customers}
          onChange={setProject}
        />
      </div>

      <div>
        <ServiceSelect
          id="service"
          name="service"
          services={services}
          value={content.service?.id ?? ''}
          onChange={(id) => {
            const service = services.find((service) => service.id === id) ?? null;
            setTemplateContent({ ...content, service });
          }}
        />
      </div>

      <div>
        <DurationInput
          value={content.minutes}
          onChange={(minutes) => setTemplateContent({ ...content, minutes })}
          label="Duration"
          name="minutes"
          required
        />
      </div>

      <div>
        <InputLabel htmlFor="n_activities" value="Number of Activities" />
        <TextInput
          id="n_activities"
          name="n_activities"
          value={content.n_activities}
          className="mt-1 block w-full"
          autoComplete="n_activities"
          isFocused={true}
          onChange={(e) => setTemplateContent({ ...content, n_activities: parseInt(e.target.value) })}
          required
        />
      </div>

      <div>
        <InputLabel htmlFor="jitter_minutes" value="Jitter Minutes" />
        <TextInput
          id="jitter_minutes"
          name="jitter_minutes"
          value={content.jitter_minutes}
          className="mt-1 block w-full"
          autoComplete="jitter_minutes"
          isFocused={true}
          onChange={(e) => setTemplateContent({ ...content, jitter_minutes: parseInt(e.target.value) })}
          required
        />
      </div>

      <div>
        <InputLabel htmlFor="jitter_increments" value="Jitter Increments" />
        <TextInput
          id="jitter_increments"
          name="jitter_increments"
          value={content.jitter_increments}
          className="mt-1 block w-full"
          autoComplete="jitter_increments"
          isFocused={true}
          onChange={(e) => setTemplateContent({ ...content, jitter_increments: parseInt(e.target.value) })}
          required
        />
      </div>

      <div>
        <InputLabel htmlFor="start_time" value="Start time" />
        <TextInput
          id="start_time"
          name="start_time"
          value={content.start_time}
          className="mt-1 block w-full"
          autoComplete="start_time"
          isFocused={true}
          onChange={(e) => setTemplateContent({ ...content, start_time: e.target.value })}
          required
          type="time"
        />
      </div>

      <div>
        <DurationInput
          value={content.pause_time}
          onChange={(pause_time) => setTemplateContent({ ...content, pause_time })}
          label="Pause Time"
          name="pause_time"
          required
        />
      </div>
      <TemplateActivities 
        activities={content.activities}
        setActivities={(activities) => setTemplateContent({ ...content, activities })}
      />
    </div>
  );
}


{/*
                <div>
                  { data.content && data.content.map((content, index) => (

                    <TemplateContent
                      key={index}
                      content={content}
                      setTemplateContent={(content) => {
                        console.log("Set content", content);
                        let newContent = JSON.parse(JSON.stringify(data.content));
                        newContent[index] = content;
                        setData('content', newContent);
                      }}
                      customers={customers}
                      services={services}
                    />
                  ))}
                </div>
                 <button
type="button"
onClick={() => {
  let newContent: TimeEntryTemplateContent[] = JSON.parse(JSON.stringify(data.content));
  const newActivity: TimeEntryTemplateContent = {
    id: '',
    jitter_increments: 15,
    jitter_minutes: 15,
    n_activities: 5,
    project: null,
    service: null,
    activities: [],
    minutes: 480,
    start_time: '09:00:00',
    pause_time: 60,
  }
  newContent.push(newActivity);
  setData('content', newContent);
}}
> Add Entry Template </button> */}

export default function CreateTemplate({
  auth,
  mite,
  miteAPIKey,
  templates,
  customers,
  services
}: PageProps<{
  miteAPIKey: { id: string, name: string },
  templates: TimeEntryTemplate[],
  customers: Customer[],
  services: Service[]
}>) {

  const { data, setData, post, errors, processing} = useForm<{
    name: string,
    description: string,
  }>({
    name: '',
    description: ''
  });


  const saveAll = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing) {
      return;
    }
    if (data.name === '') {
      return;
    }
    post(route('templates.store', miteAPIKey.id), {
      preserveScroll: true,
      onSuccess: (response) => {
        console.log("Success", response);
      },
      onError: (errors) => {
        console.error("Errors", errors);
      }
    });
  }, [post, data, processing]);

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
            <div className="flex justify-between">
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
                  <button type="submit">{processing?"Saving...":"Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}