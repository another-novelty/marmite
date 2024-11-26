<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CalendarController extends Controller
{

    public function index()
    {
        $mite_accesses = MiteAccess::where('user_id', auth()->id())->get();

        return Inertia::render('Calendar/Index',
            [
                'miteAPIKeys' => $mite_accesses,
            ]
        );
    }

    public function show(string $id)
    {
        $mite_access = MiteAccess::find($id);

        if ($mite_access == null) {
            return redirect('/');
        }

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();
        $time_entries = $mite_access->entries()->with("service")->with("project")->get();
        $templates = $mite_access->templates()->with("contents")->get();

        return Inertia::render('Calendar/Index',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'time_entries' => $time_entries,
                'templates' => $templates,
            ]
        );
    }
}
