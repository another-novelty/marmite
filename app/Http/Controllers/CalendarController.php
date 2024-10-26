<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function show(string $id)
    {
        $mite_access = MiteAccess::find($id);

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();
        $time_entries = $mite_access->entries()->with("service")->with("project")->get();

        return Inertia::render('Calendar/Index',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'time_entries' => $time_entries,
            ]
        );
    }
}
