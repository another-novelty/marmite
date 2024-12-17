<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimeEntryBatchRequest;
use App\Http\Requests\StoreTimeEntryRequest;
use App\Http\Requests\UpdateTimeEntryRequest;
use App\Jobs\SyncTimeEntries;
use App\Models\Entry;
use App\Models\MiteAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Carbon;

class TimeEntryController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTimeEntryRequest $request)
    {
        $request = $request->validated();
        $entries = collect();
        for ($date = new Carbon($request['date_start']); $date <= $request['date_end']; $date->addDay()) {
            // check if the request constains include_weekends
            if (!isset($request["include_weekends"])) {
                $request["include_weekends"] = false;
            }

            // if the date is a weekend, skip it
            if ($request["include_weekends"] && $date->isWeekend()) {
                continue;
            }
            $entry = new Entry();
            $entry->fill($request);
            $entry->date_at = $date;
            $entry->save();
            Log::info('Time entry created', ['entry' => $entry->toArray()]);
            $entries->push($entry);
        }

        // schedule a sync for the new entries
        SyncTimeEntries::dispatchSync($entries);

        return Redirect::back()
            ->with('success', 'Time entry created successfully.');
    }

    /**
     * Store multiple entries in storage.
     */
    public function storeBatch(StoreTimeEntryBatchRequest $request)
    {
        $miteAccess = MiteAccess::find($request->mite_access_id);
        if ($miteAccess == null) {
            abort(404);
        }
        if ($miteAccess->user_id != auth()->id()) {
            abort(403);
        }
        $request = $request->validated();
        $entries = collect();
        
        for($date = new Carbon($request['date_start']); $date <= $request['date_end']; $date->addDay()) {


            // check if the request constains include_weekends
            if (!isset($request["include_weekends"])) {
                $request["include_weekends"] = false;
            }

            // if the date is a weekend, skip it
            if ($request["include_weekends"] && $date->isWeekend()) {
                continue;
            }

            foreach ($request['entries'] as $entry) {
                $entry['date_at'] = $date;
                $entry['mite_access_id'] = $miteAccess->id;
                $entry = new Entry($entry);
                $entry->save();
                Log::info('Time entry created', ['entry' => $entry->toArray()]);
                $entries->push($entry);
            }
        }

        // schedule a sync for the new entries
        SyncTimeEntries::dispatchSync($entries);

        return Redirect::back()
            ->with('success', 'Time entry created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTimeEntryRequest $request, Entry $entry)
    {
        $entry->fill($request->validated());

        $entry->save();

        // TODO this should be done in a job
        $entry->syncBack();

        return Redirect::back()
            ->with('success', 'Time entry updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Entry $entry)
    {
        // delete the entry from mite
        // TODO this should be done in a job
        $entry->deleteFromMite();
        $entry->delete();

        return Redirect::back()
            ->with('success', 'Time entry deleted successfully.');
    }

    /**
     * Remove multiple entries from storage.
     */
    public function destroyMultiple(Request $request)
    {
        $entries = Entry::whereIn('id', $request->input('ids'))->get();
        foreach ($entries as $entry) {
            // delete the entry from mite
            // TODO this should be done in a job
            $entry->deleteFromMite();
            $entry->delete();
        }

        return Redirect::back()
            ->with('success', 'Time entries deleted successfully.');
    }
}
