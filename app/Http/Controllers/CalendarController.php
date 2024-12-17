<?php

namespace App\Http\Controllers;

use App\Models\MiteAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CalendarController extends Controller
{

    public function index(Request $request)
    {
        $mite_accesses = MiteAccess::where('user_id', auth()->id())->get();

        return Inertia::render('Calendar/Index',
            [
                'miteAPIKeys' => $mite_accesses,
            ]
        );
    }

    public function show(Request $request, MiteAccess $mite_access)
    {
        if ($mite_access == null) {
            return redirect('/');
        }

        if ($mite_access->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $month = $request->input('month');

        // Try to get the month from the request, if it is not set, use the current month
        if ($month == null) {
            $month = date('Y-m');
        } else {
            if ($month == 'next') {
                $month = date('Y-m', strtotime('+1 month'));
            } else if ($month == 'prev') {
                $month = date('Y-m', strtotime('-1 month'));
            } else if ($month == 'current') {
                $month = date('Y-m');
            } else {
                $month = date('Y-m', strtotime($month));
            }
        }

        $customers = $mite_access->customers()->with('projects')->get();
        $services = $mite_access->services()->get();
        $time_entries = $mite_access->entries()->with("service")->with("project")->where('date_at', 'like', $month . '%')->get();
        $templates = $mite_access->templates()->with("contents")->get();

        return Inertia::render('Calendar/Index',
            [
                'miteAPIKey' => $mite_access,
                'customers' => $customers,
                'services' => $services,
                'time_entries' => $time_entries,
                'templates' => $templates,
                'month' => $month,
            ]
        );
    }
}
