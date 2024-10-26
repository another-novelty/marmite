import { useForm } from '@inertiajs/react';
import classNames from 'classnames';
import { useCallback } from 'react';
import classes from './SyncButton.module.css';


export default function SyncButton({miteAPIKey, onSuccess, onError, children, className = ""} : 
  {
    miteAPIKey: {id: string},
    onSuccess?: () => void, 
    onError?: (errors: any) => void,
    children: React.ReactNode,
    className?: string,
  }) {
  
  const {data, setData, errors, post, processing} = useForm({
    clear: true,
  })
  const sync = useCallback(() => {
    console.log("Syncing...");

    // create a put request to the mite sync route
    post(route('mite.sync', {mite_access: miteAPIKey}), {
      preserveScroll: true,
      onSuccess: onSuccess,
      onError: onError,
    });
  }, [miteAPIKey, post, onSuccess, onError]);

  const btnClasses = classNames({
    [classes.syncbutton]: true,
    [classes.syncing]: processing,
    [className]: true,
  })
  
  return (
        <div
          className={btnClasses}
          onClick={sync}
        >
          {processing ? "Syncing..." : children}
        </div>
    );
}