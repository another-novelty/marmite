import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import TextInput from "./TextInput";

import css from './CustomTimeInput.module.css';

function HourMinutesInput({value, onChange, className = "", name, required}: {value: number, onChange: (value: number) => void, className?: string, name?: string, required?: boolean}) {
  const classes = classNames({
    [css.timeInput]: true,
    [className]: className,
  });

  const [hours, setHours] = useState(Math.floor(value / 60));
  const [minutes, setMinutes] = useState(value % 60);

  useEffect(() => {
    onChange(hours * 60 + minutes);
  }, [hours, minutes]);

  return (
    <div className={classes}>
      <TextInput className={css.hours} type="number" value={hours} onChange={(e) => setHours(parseInt(e.target.value))}/>
      <span>h</span>
      <TextInput className={css.minutes} type="number" value={minutes} onChange={(e) => setMinutes(parseInt(e.target.value))} max={59}/>
      <span>m</span>
      <input type="hidden" name={name} value={value} required={required}/>
    </div>
  )
}

export function DurationInput({value, onChange, className = "", type = "hours-minutes", label, id, name, required}: {
  value: number, 
  onChange: (value: number) => void, 
  className?: string, 
  type?: "minutes" | "hours-minutes" | "hours-decimal",
  id?: string,
  name?: string,
  required?: boolean
  label?: string
}) { 
  const classes = classNames({
    [css.timeInput]: true,
    [className]: className,
  });

  return (
    <div className={classes} id={id} >
      <label htmlFor={name}>{label}</label>
      {type === "minutes" && (
        <>
          <TextInput
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            name={name}
            required={required}
          />
          <span>Minutes</span>
        </>
      )}
      {type === "hours-minutes" && (
        <HourMinutesInput
          value={value}
          onChange={onChange}
        />
      )}
      {type === "hours-decimal" && (
        <>
          <TextInput
            type="number"
            value={value / 60}
            onChange={(e) => onChange(Math.floor(parseFloat(e.target.value) * 60))}
            name={name}
            required={required}
          />
          <span>Hours</span>
        </>
      )}

    </div>
  )
}

export function TimeInput({id, value, onChange, className = "", name, required, placeholder}: {id?:string, value: string, onChange: (value: string) => void, className?: string, name?: string, required?: boolean, placeholder?: string}) {
  const classes = classNames({
    [css.timeInput]: true,
    [className]: className,
  });

  const date = useMemo(() => new Date(`2021-01-01T${value}`), [value]);

  const hours = useMemo(()=> date.getHours(), [date]);
  const minutes = useMemo(()=> date.getMinutes(), [date]);

  // TODO actually do this

  return (
    <div className={classes}>
      <TextInput type="text" id={id} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} name={name} required={required}/>
    </div>
  )
}