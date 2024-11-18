import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { Customer, Service } from "@/types/calendar";

import css from './CustomSelects.module.css';


export function CustomSelectOption({ option, selected, onClick }: { option: { id: string, name: string }, selected: boolean, onClick: () => void }) {
  const classes = classNames({
    [css.option]: true,
    [css.selected]: selected,
  });

  return (
    <div className={classes} onClick={onClick}>{option.name}</div>
  )
}

export function CustomSelect({ options, onChange, value, label, className, renderOption, id, name, required }: {
  options: { id: string, name: string }[],
  onChange: (value: string) => void,
  value: string, 
  label: string, 
  className?: string, 
  renderOption?: (option: { id: string, name: string }) => React.ReactNode,
  id?: string,
  name?: string,
  required?: boolean
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const classes = classNames({
    [css.customSelect]: true,
    [css.expanded]: expanded,
    className: className,
  });

  const selectedName = useMemo(() => {
    const option = options.find((option) => option.id === value);
    if (!option) {
      return "Select " + label + "...";
    }
    return option.name;
  }, [value, options, label]);

  const selectOption = useCallback((id: string) => {
    onChange(id);
    setExpanded(false);
  }, [onChange]);

  const children = useMemo(() => {
    if (renderOption) {
      return options.map(renderOption);
    }
    return options.map((option) => {
      const isSelected = option.id === value;
      return (
        <CustomSelectOption
          key={option.id}
          option={option}
          selected={isSelected}
          onClick={() => {
            selectOption(option.id);
          }}
        />
      )
    });
  }, [options, renderOption, selectOption]);

  return (
    <div className={classes} id={id}>
      <label className={css.label} htmlFor={name}>{label}</label>
      <div className={css.selected} onClick={toggleExpanded}>{selectedName}</div>
      <div className={css.options}>
        {children}
        <div className={css.clear} onClick={() => { selectOption("") }}>None</div>
      </div>
      <input type="hidden" name={name} value={value} required={required} />
    </div>
  )
}

export function ServiceSelect({ services, onChange, value, label = "Service", id, required }: { services: Service[], onChange: (value: string) => void, value: string, label?: string, id?: string, className?: string, name?: string, required?: boolean }) {
  return (<CustomSelect className={css.serviceSelect} options={services.map((service) => ({ id: service.id, name: service.name }))} onChange={onChange} value={value} label={label} id={id} required={required} />)
}

export function ProjectSelect({ customers, onChange, value, id, className, name, required, label = 'Project'}: {
  customers: Customer[], onChange: (value: string) => void, value?: string, label?: string, id ?: string, className?: string, name?: string, required?: boolean
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const classes = classNames({
    [css.projectSelect]: true,
    [css.customSelect]: true,
    [css.expanded]: expanded,
    className: className,
  });

  const mappedProjects = useMemo(() => {
    let projects = [];
    for (const customer of customers) {
      for (const project of customer.projects) {
        projects.push({
          customer: {
            id: customer.id,
            name: customer.name,
          }, ...project
        });
      }
    }
    return projects;
  }, [customers]);

  const selectedProjectName = useMemo(() => {
    const project = mappedProjects.find((project) => project.id === value);
    if (!project) {
      return "Select Project...";
    }
    return project.customer.name + ": " + project.name;
  }, [value, mappedProjects]);

  const selectProject = useCallback((id: string) => {
    onChange(id);
    setExpanded(false);
  }, [onChange]);

  return (
    <div className={classes} id={id}>
      <label className={css.label} htmlFor={name}>{label}</label>
      <div className={css.selected} onClick={toggleExpanded}>{selectedProjectName}</div>
      <div className={css.options}>
        {customers.map((customer) => {
          if (customer.projects.length > 0) {
            return (
              <div key={customer.id} className={css.customer}>
                <div key={customer.id + "-label"} className={css.customerName}>{customer.name}:</div>
                {customer.projects.map((project) => (
                  <CustomSelectOption
                    key={project.id}
                    option={project}
                    selected={project.id === value}
                    onClick={() => {
                      selectProject(project.id);
                    }}
                  />
                ))}
              </div>
            )
          }
          return null;
        })}
        {value !== null && (<div className={css.clear} onClick={() => { selectProject("") }}>None</div>)}
      </div>
      <input type="hidden" name={name} value={value} required={required} />
    </div>
  )
}