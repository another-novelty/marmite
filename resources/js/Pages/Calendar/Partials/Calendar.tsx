import {useState, useCallback, useMemo} from "react";

import classes from "./Calendar.module.css";

function DateCell({date} : {date: Date}) {
  const weekday = useMemo(() => date.toLocaleDateString('default', {weekday: 'long'}).toLowerCase(), [date]);

  return (<div className={classes.dateCell + " " + weekday}>
    <div>{weekday}</div>
    <div>{date.toLocaleDateString('default', {day: 'numeric'})}</div>
  </div>);
}

export default function Calendar({className, onSelect} : {className?: string, onSelect?: (dateRange: {start: Date, end: Date}) => void}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const nextMonth = useCallback(() => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  }, [selectedMonth]);

  const previousMonth = useCallback(() => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  }, [selectedMonth]);

  return (<div className={className + " " + classes.calendar}>
    <div className={classes.navbar}>
      <button onClick={previousMonth}>Previous</button>
      {selectedMonth.toLocaleDateString('default', {month: 'long', year: 'numeric'})}
      <button onClick={nextMonth}>Next</button>
    </div>
    <div className={classes.days}>
      <div className="monday">Monday</div>
      <div className="tuesday">Tuesday</div>
      <div className="wednesday">Wednesday</div>
      <div className="thursday">Thursday</div>
      <div className="friday">Friday</div>
      <div className="saturday">Saturday</div>
      <div className="sunday">Sunday</div>
      {Array.from({length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()}, (_, i) => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1)).map((date) => <DateCell key={date.toString()} date={date}/>)}
    </div>
  </div>
  )
}