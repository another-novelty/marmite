import {useState, useCallback, useMemo, useEffect, useReducer} from "react";
import classNames from "classnames";

import css from "./Calendar.module.css";
import { TimeEntry } from "@/types/calendar";
import { on } from "events";

const UNDERUTILIZED_THRESHOLD = 480;

function DurationView({minutes, className = "", underutilized}: {minutes: number, className?: string, underutilized?: boolean}) {
  const hours = useMemo(() => Math.floor(minutes / 60), [minutes]);

  const classes = classNames({
    [css.duration]: true,
    [className]: className,
  });

  return (<div className={classes}>
    {Math.floor(minutes / 60)}h {minutes % 60}m
    { underutilized && (
      <UnderutilizedIcon />
    )}
  </div>)
}

function UnderutilizedIcon({className = ""}: {className?: string}) {
  const classes = classNames({
    [css.underutilizedIcon]: true,
    [className]: className,
  });

  return (<span className={classes} title={"You logged less than " + UNDERUTILIZED_THRESHOLD + " minutes"}>!</span>)
}

function RangeBackground({className = "", isStart, isEnd}: {className?: string, isStart?: boolean, isEnd?: boolean}) {
  const classes = classNames({
    [css.rangeBackground]: true,
    [className]: className,
  });

  return (<div className={classes}>
    {isStart && (
      <div className={css.rangeStart}/>
    )}
    <div className={css.rangeMiddle}/>
    {isEnd && (
      <div className={css.rangeEnd}/>
    )}
  </div>)
}

function DateCell({date, className = "", timeEntries, onClickStart, onClickEnd, onHover, withinRange, isRangeStart, isRangeEnd} : 
  {
    date: Date, 
    className?: string, 
    timeEntries?: TimeEntry[], 
    onClickStart?: (date: Date, e: React.MouseEvent<HTMLDivElement>) => any, 
    onClickEnd?: (date: Date, e: React.MouseEvent<HTMLDivElement>) => any, 
    onHover?: (date: Date, e: React.MouseEvent<HTMLDivElement>) => any,
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
    return minutes < UNDERUTILIZED_THRESHOLD
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

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
    if (onClickStart){
      return onClickStart(date, e);
    }
  }, [date, onClickStart])

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
    if (onClickEnd){
      return onClickEnd(date, e);
    }
  }, [date, onClickEnd])

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
    if (onHover){
      return onHover(date, e);
    }
  }, [date, onHover])

  return (<div className={classes} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseEnter={onMouseEnter}>
    {withinRange && (
      <RangeBackground isStart={isRangeStart} isEnd={isRangeEnd}/>
    )}
    <div className={css.dateInner}>
      <div className={css.dayNumber}>{date.toLocaleDateString('default', {day: 'numeric'})}</div>
      <DurationView minutes={minutes} underutilized={underutilized}/>
    </div>
  </div>);
}

function MonthView({className = "", selectedMonth, timeEntries = [], onSelect, showWeekend}: {className?:string, selectedMonth: Date, timeEntries?: TimeEntry[], onSelect?: (rangeStart: Date|null, rangeEnd: Date|null) => any, showWeekend?: boolean}) {
  function reducer(
    state: {
      rangeStart: Date | null, 
      rangeEnd: Date | null, 
      clickStarted: boolean,
    }, action: {
      type: "finish" | "hover" | "start" | "reset", 
      date: Date | null,
      shiftDown?: boolean,
    }) {

    const minDate = ((date: Date | null, ...restDates: (Date | null)[]) => {
      let m = date;
      for (const d of restDates){
        if (m === null){
          m = d;
        } else {
          if (d && d < m){
            m = d;
          }
        }
      }
      return m;
    }) (state.rangeStart, state.rangeEnd, action.date);

    let maxDate = ((date: Date | null, ...restDates: (Date | null)[]) => {
      let m = date;
      for (const d of restDates){
        if (m === null){
          m = d;
        } else {
          if (d && d > m){
            m = d;
          }
        }
      }
      return m;
    }) (state.rangeStart, state.rangeEnd, action.date);

    if (action.type === "start" && action.shiftDown){
      action.type = "finish";
    }

    switch (action.type) {
      case "finish":
        return {
          ...state,
          rangeStart: minDate,
          rangeEnd: maxDate,
          clickStarted: false,
        };
      case "hover":
        if (!state.clickStarted){
          return state;
        }
        return {
          ...state,
          rangeStart: minDate,
          rangeEnd: maxDate,
        };
      case "start":
        return {
          ...state,
          clickStarted: true,
          rangeStart: action.date,
          rangeEnd: null,
        };
      case "reset":
        return {
          rangeStart: null,
          rangeEnd: null,
          clickStarted: false,
        };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    rangeStart: null,
    rangeEnd: null,
    clickStarted: false,
  });
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
      const end = state.rangeEnd;
      // if date is within range
      if (state.rangeStart && end){
        if (state.rangeStart <= end && state.rangeStart <= date && date <= end){
          return {
            date: date,
            timeEntries: timeEntriesFiltered,
            withinRange: true
          }
        } else if (state.rangeStart >= end && state.rangeStart >= date && date >= end){
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
  }, [selectedMonth, timeEntries, state, state.rangeStart, state.rangeEnd]);

  const onClickStart = useCallback((date: Date, e: React.MouseEvent<HTMLDivElement>)=>{
    if (e.shiftKey){
      return;
    }
    dispatch({type: "start", date: date});
  }, [])

  const onClickEnd = useCallback((date: Date, e: React.MouseEvent<HTMLDivElement>) => {
    dispatch({type: "finish", date: date});
  }, []);

  useEffect(()=> {
    if (onSelect) {
      if (state.rangeEnd === null || state.rangeStart === null){
        onSelect(null, null)
      } else {
        onSelect(state.rangeStart, state.rangeEnd);
      }
    }
  }, [state, onSelect])

  useEffect(() => {
    console.log(state);
  }, [state]);

  const onMouseEnter = useCallback((date: Date, e: React.MouseEvent<HTMLDivElement>) => {
    dispatch({type: "hover", date: date});
  }, []);

  const classes = classNames({
    [css.month]: true,
    [css.showWeekend]: showWeekend,
    [className]: className,
  });

  return (
    <div className={classes}>
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
            isRangeStart={state.rangeStart?.toDateString() === date.date.toDateString()}
            isRangeEnd={(state.rangeEnd)?.toDateString() === date.date.toDateString()}
          />
      )}
    </div>
  )
}

function Toggle({className = "", value, onChange, children}: {className?: string, value: boolean, onChange: (value: boolean) => any, children: React.ReactNode}) {
  const classes = classNames({
    [css.toggle]: true,
    [className]: className,
    [css.active]: value,
  });

  return (<div className={classes} onClick={() => onChange(!value)}>
    {children}
  </div>)
}

export default function Calendar({className = "", onSelect, customers = [], services = [], entries = []} : 
  {
    className?: string, 
    onSelect?: (start: Date|null, end: Date|null) => any, 
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

  const [showWeekend, setShowWeekend] = useState(false);

  return (<div className={className + " " + css.calendar}>
    <div className={css.navbar}>
      <button onClick={previousMonth}>Previous</button>
      {selectedMonth.toLocaleDateString('default', {month: 'long', year: 'numeric'})}
      <button onClick={nextMonth}>Next</button>
    </div>
    <MonthView selectedMonth={selectedMonth} timeEntries={entries} onSelect={onSelect} showWeekend={showWeekend}/>
    <Toggle value={showWeekend} onChange={setShowWeekend}>{showWeekend ? 'Hide' : 'Show'} Weekend</Toggle>
  </div>
  )
}