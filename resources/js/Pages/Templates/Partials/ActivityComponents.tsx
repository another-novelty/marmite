import classNames from "classnames";
import css from "./ActivityComponents.module.css";
import { useCallback, useEffect, useState } from "react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { Activity } from "@/types/calendar";
import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";

function CustomCheckbox({ id, name, checked, onChange, label, className, errors }: {
  id: string,
  name: string,
  checked: boolean,
  onChange?: (checked: boolean) => void,
  label: string,
  className?: string,
  errors?: string,
}) {

  const classes = classNames({
    [css.checkbox]: true,
    [className ?? '']: true,
    [css.error]: errors !== undefined && errors !== null && errors !== '',
    [css.checked]: checked,
  });

  const toggle = useCallback(() => {
    if (onChange) {
      onChange(!checked);
    }
  }, [checked, onChange]);

  return (
    <div className={classes} onClick={toggle}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.checked);
          }
        }}
      />
      <InputLabel htmlFor={id} value={label} onClick={(e) => {
        e.preventDefault();
        toggle();
      }} />
      {errors && (
        <InputError message={errors} />
      )}
    </div>
  );
}

function DeleteButton({ onClick, label = "Delete", className = "", confirm = true, confirmMessage = "Are you sure?" }: {
  onClick: () => void,
  label?: string,
  className?: string,
  confirm?: boolean,
  confirmMessage?: string,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const classes = classNames({
    [css.deleteButton]: true,
    [className]: true,
    [css.confirm]: showConfirm,
  });

  return (
    <div className={classes}>
      {!showConfirm && (
        <button
          type="button"
          onClick={(e) => { 
            e.stopPropagation();
            if (confirm) {
              setShowConfirm(true);
            } else {
              onClick();
            }
          }}
        > {label} </button>
      )}
      {showConfirm && (<>
        <p>{confirmMessage}</p>
        <button
          type="button"
          className={css.confirmButton}
          onClick={(e) => { 
            e.stopPropagation();
            onClick();
            setShowConfirm(false);
          }}
        > Yes </button>
        <button
          type="button"
          className={css.cancelButton}
          onClick={(e) => { 
            e.stopPropagation();
            setShowConfirm(false);
          }}
        > Cancel </button>
      </>
      )}
    </div>
  )
}

function ActivityForm({ activity, selected, onSelect, removeActivity, deleteLabel = "Delete", onSaved }: {
  activity: Activity,
  selected?: boolean,
  onSelect?: (activity_id: string | null) => void,
  removeActivity?: (id: string) => void,
  deleteLabel?: string,
  onSaved?: (activity: Activity) => void,
}) {

  const { data, setData, patch, post, errors, processing, reset, isDirty } = useForm<Activity>({
    id: activity.id,
    name: activity.name,
    description: activity.description,
    minutes: activity.minutes,
    priority: activity.priority,
    is_always_active: activity.is_always_active,
    is_random_allowed: activity.is_random_allowed,
    cron_expression: activity.cron_expression,
    content_id: activity.content_id,
  });

  const toggleShowEdit = useCallback(() => {
    if (onSelect) {
      if (!selected) {
        onSelect(activity.id);
      } else {
        onSelect(null);
      }
    }
  }, [onSelect, selected]);

  useEffect(() => {
    if (!selected) {
      reset();
    }
  }, [selected]);

  const classes = classNames({
    [css.activityForm]: true,
    [css.edit]: selected,
    [css.processing]: processing,
    [css.titleEmpty]: data.name === '',
  });

  const saveActivity = useCallback(() => {
    if (data.id === '') {
      post(route('timeEntryTemplateContentActivity.store'), {
        preserveScroll: true,
        onSuccess: (response) => {
          console.log("Success", response);
          if (onSaved) {
            onSaved(data);
          }
        },
        onError: (errors) => {
          console.error("Errors", errors);
        }
      });
    } else {
      patch(route('timeEntryTemplateContentActivity.update', { timeEntryTemplateContentActivity: data.id }), {
        preserveScroll: true,
        onSuccess: (response) => {
          console.log("Success", response);
          if (onSaved) {
            onSaved(data);
          }
        },
        onError: (errors) => {
          console.error("Errors", errors);
        }
      });
    }
  }, [data, patch]);

  return (
    <div className={classes}>
      <div className={css.title} onClick={toggleShowEdit}>
        <h3>
          {data.name !== '' ? data.name : "Please set a name"}
          {data.is_always_active && ( <span className={css.alwaysActive}>Always</span> )}
          {data.is_random_allowed && ( <span className={css.randomAllowed}>Random</span> )}
          </h3>
        <DeleteButton
          onClick={() => {
            if (removeActivity) {
              removeActivity(data.id);
            }
          }}
          label={deleteLabel}
          confirmMessage="Are you sure you want to delete this activity?"
        />
      </div>
      {selected && (<div className={css.editForm}>
        <div className={css.activityName}>
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
          {errors.name && (
            <InputError message={errors.name} />
          )}
        </div>
        <div className={css.activityDescription}>
          <InputLabel htmlFor="description" value="Description" />
          <TextInput
            id="description"
            name="description"
            value={data.description ?? ''}
            className="mt-1 block w-full"
            autoComplete="description"
            onChange={(e) => setData('description', e.target.value)}
          />
          {errors.description && (
            <InputError message={errors.description} />
          )}
        </div>
        <div className={css.activityMinutes}>
          <InputLabel htmlFor="minutes" value="Minutes" />
          <TextInput
            id="minutes"
            name="minutes"
            type="number"
            value={data.minutes ?? 0}
            className="mt-1 block w-full"
            autoComplete="minutes"
            onChange={(e) => setData('minutes', parseInt(e.target.value))}
            required
          />
          {errors.minutes && (
            <InputError message={errors.minutes} />
          )}
        </div>
        <div className={css.activityPriority}>
          <InputLabel htmlFor="priority" value="Priority" />
          <TextInput
            id="priority"
            name="priority"
            type="number"
            value={data.priority ?? 0}
            className="mt-1 block w-full"
            autoComplete="priority"
            onChange={(e) => setData('priority', parseInt(e.target.value))}
            required
          />
          {errors.priority && (
            <InputError message={errors.priority} />
          )}
        </div>
        <div className={css.activityCronExpression}>
          <InputLabel htmlFor="cron_expression" value="Cron Expression" />
          <TextInput
            id="cron_expression"
            name="cron_expression"
            value={data.cron_expression ?? ''}
            className="mt-1 block w-full"
            autoComplete="cron_expression"
            onChange={(e) => setData('cron_expression', e.target.value)}
          />
          {errors.cron_expression && (
            <InputError message={errors.cron_expression} />
          )}
        </div>
        <div className={css.activityToggles}>
          <CustomCheckbox
            id="is_always_active"
            name="is_always_active"
            checked={data.is_always_active}
            onChange={(checked) => setData('is_always_active', checked)}
            label="Always Active"
            errors={errors.is_always_active}
            className={css.activityAlwaysActive}
          />
          <CustomCheckbox
            id="is_random_allowed"
            name="is_random_allowed"
            checked={data.is_random_allowed}
            onChange={(checked) => setData('is_random_allowed', checked)}
            label="Random Allowed"
            errors={errors.is_random_allowed}
            className={css.activityRandomAllowed}
          />
        </div>
        <div className={css.actions}>
          {isDirty && (<>
            <button
              type="button"
              onClick={saveActivity}
            > Save </button>
            <button
              type="button"
              onClick={toggleShowEdit}
            > Cancel </button>
          </>)}
        </div>
      </div>)}
    </div>);
}

export function TemplateActivities({ activities, content_id, onAddActivity, onRemoveActivity, onUpdatedActivity}: {
  activities: Activity[],
  content_id: string,
  onAddActivity: (activity: Activity) => void,
  onRemoveActivity: (id: string) => void,
  onUpdatedActivity?: (activity: Activity) => void,
}) {

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const showAddDialog = useCallback((value: boolean) => {
    if (value) {
      setSelectedActivity(null);
    }
    setShowAddActivity(value);
  }, [setShowAddActivity, setSelectedActivity]);

  useEffect(() => {
    if (selectedActivity !== null) {
      showAddDialog(false);
    }
  }, [selectedActivity]);

  const classes = classNames({
    [css.activities]: true,
    [css.addActivity]: showAddActivity
  });

  const { delete: destroy } = useForm();

  useEffect(() => {
    console.log("Activities", activities);
  }, [activities]);

  const removeActivity = useCallback((id: string) => {
    if (id !== '') {
      destroy(route('timeEntryTemplateContentActivity.destroy', { timeEntryTemplateContentActivity: id }), {
        preserveScroll: true,
        onSuccess: (response) => {
          console.log("Success", response);
          onRemoveActivity(id);
        },
        onError: (errors) => {
          console.error("Errors", errors);
        },
        onFinish: () => {
        }
      });
    } else {
      // If the activity has no id, it is not saved in the database yet, so we can just remove it from the lis
      let newActivities = [];
      for (const activity of activities) {
        if (activity.id !== id) {
          newActivities.push(activity);
        }
      }
    }
  }, [destroy]);

  return (
    <div className={classes}>
      {activities.map((activity, index) => (
        <ActivityForm
          key={index}
          activity={activity}
          selected={activity.id === selectedActivity}
          onSelect={setSelectedActivity}
          removeActivity={removeActivity}
          onSaved={onUpdatedActivity}
        />
      ))}
      {showAddActivity && (
        <ActivityForm
          activity={{
            id: '',
            name: '',
            description: '',
            minutes: 0,
            priority: 0,
            is_always_active: false,
            is_random_allowed: false,
            cron_expression: '',
            content_id: content_id,
          }}
          selected={true}
          onSelect={setSelectedActivity}
          removeActivity={() => { showAddDialog(false); }}
          deleteLabel="Cancel"
          onSaved={(activity) => {
            onAddActivity(activity);
            showAddDialog(false);
          }}
        />
      )}
      {!showAddActivity && (
        <button
          className={css.addActivityButton}
          type="button"
          onClick={() => showAddDialog(!showAddActivity)}
        > Add Activity </button>
      )}
    </div>
  );
}