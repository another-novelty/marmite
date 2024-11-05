<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use App\Models\TimeEntryTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeEntryTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(string $id)
    {
        $mite_access = MiteAccess::find($id);

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();
        $time_entries = $mite_access->entries()->with("service")->with("project")->get();
        $templates = $mite_access->templates()->with("contents")->get();

        return Inertia::render('Calendar/TimeEntryTemplate',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'time_entries' => $time_entries,
                'templates' => $templates,
            ]
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TimeEntryTemplate $timeEntryTemplate)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TimeEntryTemplate $timeEntryTemplate)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TimeEntryTemplate $timeEntryTemplate)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeEntryTemplate $timeEntryTemplate)
    {
        //
    }
}
