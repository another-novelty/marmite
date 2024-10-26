import {useState, useCallback, useMemo, useEffect} from "react";
import classNames from "classnames";

import css from "./Calendar.module.css";
import { on } from "events";


type TimeEntry = {
  id: string,
  date_at: string,
  minutes: number,
  note: string,
  project: {
    id: string,
    name: string,
    note: string,
    customer_id: string,
  },
  service: {
    id: string,
    name: string,
    note: string,
  },
}

function EntryView({entry, className = ""}: {entry: TimeEntry, className?: string}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const date_at = useMemo(() => new Date(entry.date_at).toLocaleDateString("de", {timeZone: "UTC"}), [entry.date_at]);

  const hours = useMemo(() => Math.floor(entry.minutes / 60) + "h " + entry.minutes % 60 + "m", [entry.minutes]);

  const classes = classNames({
    [css.entry]: true,
    [css.expanded]: expanded,
    [css.collapsed]: !expanded,
    [className]: className,
  });

  return (
    <div className={classes} onClick={toggleExpanded}>
      <div className={css.duration}>{hours}</div>
      <div className={css.detail}>
        <div className={css.note}>{entry.note}</div>
      </div>
    </div>
  )
}

function DurationView({minutes, className = "", underutilized}: {minutes: number, className?: string, underutilized?: boolean}) {
  const hours = useMemo(() => Math.floor(minutes / 60), [minutes]);

  const classes = classNames({
    [className]: className,
  });

  return (<div className={classes}>{Math.floor(minutes / 60)}h {minutes % 60}m</div>)
}

function DateCell({date, className = "", timeEntries, onClickStart, onClickEnd, onHover, withinRange, isRangeStart, isRangeEnd} : 
  {
    date: Date, 
    className?: string, 
    timeEntries?: TimeEntry[], 
    onClickStart?: (date: Date) => any, 
    onClickEnd?: (date: Date) => any, 
    onHover?: (date: Date) => any,
    withinRange?: boolean,
    isRangeStart?: boolean,
    isRangeEnd?: boolean,
  }) { 
  const weekday = useMemo(() => date.toLocaleDateString('default', {weekday: 'long'}).toLowerCase(), [date]);
  const first = useMemo(() => date.getDate() === 1, [date]);

  const minutes = useMemo(() => timeEntries?.reduce((acc, entry) => acc + entry.minutes, 0) ?? 0, [timeEntries]);

  const underutilized = useMemo(() => {
    if (date.getDay() === 0 || date.getDay() === 6){
      return false;
    }
    return minutes < 480
  }, [minutes, date]);

  const overutilized = useMemo(() => {
    if ((date.getDay() === 0 || date.getDay() === 6) && minutes > 0){
      return true;
    }
    return minutes >= 600
  }, [minutes, date]);

  const classes = classNames({
    [css.date]: true,
    [css[weekday]]: true,
    [css.first]: first,
    [className]: className,
    [css.withinRange]: withinRange,
    [css.underutilized]: underutilized,
    [css.today]: date.toDateString() === new Date().toDateString(),
    [css.future]: date > new Date(),
    [css.overutilized]: overutilized,
    [css.rangeStart]: isRangeStart,
    [css.rangeEnd]: isRangeEnd,
  });

  const onMouseDown = useCallback(()=>{
    if (onClickStart){
      return onClickStart(date);
    }
  }, [date, onClickStart])

  const onMouseUp = useCallback(()=>{
    if (onClickEnd){
      return onClickEnd(date);
    }
  }, [date, onClickEnd])

  const onMouseEnter = useCallback(()=>{
    if (onHover){
      return onHover(date);
    }
  }, [date, onHover])

  return (<div className={classes} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseEnter={onMouseEnter}>
    <div className={css.dayNumber}>{date.toLocaleDateString('default', {day: 'numeric'})}</div>
    <DurationView minutes={minutes} underutilized={underutilized}/>
    { timeEntries && timeEntries.map((entry) => <EntryView key={entry.id} entry={entry}/>)}
  </div>);
}

function MonthView({className = "", selectedMonth, timeEntries = [], onSelect}: {className?:string, selectedMonth: Date, timeEntries?: TimeEntry[], onSelect?: (rangeStart: Date, rangeEnd: Date) => any}) {
  const [hoveredDate, setHoveredDate] = useState<Date|null>(null);
  const [rangeStart, setRangeStart] = useState<Date|null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date|null>(null)
  const [clickStarted, setClickStarted] = useState(false)

  const dates = useMemo(() => {
    let dates = Array.from(
      {
        length: new Date(Date.UTC(selectedMonth.getFullYear(),
          selectedMonth.getMonth() + 1,
          0)).getDate()
      }, (_, i) => new Date(Date.UTC(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(), 
      i + 1))
    );
    
    return dates.map((date: Date) => {
      const timeEntriesFiltered = timeEntries.filter((entry: TimeEntry) => new Date(entry.date_at).toLocaleDateString("de", {timeZone: "UTC"}) === date.toLocaleDateString("de", {timeZone: "UTC"}));

      // if date is within range
      if (rangeStart && hoveredDate){
        if (rangeStart <= hoveredDate && rangeStart <= date && date <= hoveredDate){
          return {
            date: date,
            timeEntries: timeEntriesFiltered,
            withinRange: true
          }
        } else if (rangeStart >= hoveredDate && rangeStart >= date && date >= hoveredDate){
          return {
            date: date,
            timeEntries: timeEntriesFiltered,
            withinRange: true
          }
        }
      }
      return {
        date: date,
        timeEntries: timeEntriesFiltered,
        withinRange: false
      }
    });
  }, [selectedMonth, timeEntries, rangeStart, hoveredDate]);

  const onClickStart = useCallback((date: Date)=>{
    setRangeStart(date);
    setHoveredDate(date);
    setRangeEnd(null);
    setClickStarted(true)
  }, [setRangeStart])

  const onClickEnd = useCallback((date: Date) => {
    setRangeEnd(date);
    setClickStarted(false);

    if (onSelect){
      if (rangeStart) {
        if (date > rangeStart){
          onSelect(rangeStart, date)
        } else {
          onSelect(date, rangeStart)
        }
      }
    }
  }, [setRangeEnd, rangeStart, onSelect])

  const onMouseEnter = useCallback((date: Date) => {
    if (clickStarted){
      console.log("hover: " + date);
      setHoveredDate(date);
    }
  }, [setHoveredDate, clickStarted]);

  return (
    <div className={css.days + " " + className}>
      <div className={css.monday}>Monday</div>
      <div className={css.tuesday}>Tuesday</div>
      <div className={css.wednesday}>Wednesday</div>
      <div className={css.thursday}>Thursday</div>
      <div className={css.friday}>Friday</div>
      <div className={css.saturday}>Saturday</div>
      <div className={css.sunday}>Sunday</div>
      { selectedMonth.getDay() == 0 && (
        <div className={css.from_monday + " " + css.to_sunday}></div>
      )}
      { selectedMonth.getDay() == 1 }
      { selectedMonth.getDay() == 2 && (
        <div className={css.from_monday + " " + css.to_tuesday}></div>
      )}
      { selectedMonth.getDay() == 3 && (
        <div className={css.from_monday + " " + css.to_wednesday}></div>
      )}
      { selectedMonth.getDay() == 4 && (
        <div className={css.from_monday + " " + css.to_thursday}></div>
      )}
      { selectedMonth.getDay() == 5 && (
        <div className={css.from_monday + " " + css.to_friday}></div>
      )}
      { selectedMonth.getDay() == 6 && (
        <div className={css.from_monday + " " + css.to_saturday}></div>
      )}
      { dates.map((date) => 
          <DateCell 
            key={date.date.toString()} 
            date={date.date} 
            timeEntries={date.timeEntries}
            onClickStart={onClickStart}
            onClickEnd={onClickEnd}
            onHover={onMouseEnter}
            withinRange={date.withinRange}
            isRangeStart={rangeStart?.toDateString() === date.date.toDateString()}
            isRangeEnd={hoveredDate?.toDateString() === date.date.toDateString()}
          />
      )}
    </div>
  )
}

export default function Calendar({className = "", onSelect, customers = [], services = [], entries = []} : 
  {
    className?: string, 
    onSelect?: (start: Date, end: Date) => any, 
    customers?: {
      name: string, 
      id: string,
      note: string,
      projects: {
        name: string,
        id: string,
        note: string,
      }[],
    }[], 
    services?: {
      name: string, 
      id: string,
      note: string,
    }[],
    entries?: TimeEntry[],
  }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const nextMonth = useCallback(() => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  }, [selectedMonth]);

  const previousMonth = useCallback(() => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  }, [selectedMonth]);

  return (<div className={className + " " + css.calendar}>
    <div className={css.navbar}>
      <button onClick={previousMonth}>Previous</button>
      {selectedMonth.toLocaleDateString('default', {month: 'long', year: 'numeric'})}
      <button onClick={nextMonth}>Next</button>
    </div>
    <MonthView selectedMonth={selectedMonth} timeEntries={entries} onSelect={onSelect}/>
  </div>
  )
}