<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimeEntryRequest;
use App\Http\Requests\UpdateTimeEntryRequest;
use App\Jobs\SyncTimeEntries;
use App\Models\Entry;
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
}
