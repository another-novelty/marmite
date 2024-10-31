<?php

namespace App\Jobs;

use App\Models\Entry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SyncTimeEntries implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $entries;

    /**
     * Create a new job instance.
     * 
     * @param Collection<Entry> $entries
     */
    public function __construct(Collection $entries)
    {
        $this->entries = $entries;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // sync each entry with the mite API
        $this->entries->each(function (Entry $entry) {
            Log::info('Syncing time entry', ['entry' => $entry->toArray()]);
            $entry->syncBack();
        });
    }
}
