<?php

use App\Models\Entry;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->foreignUuid('mite_access_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Entry::all()->each(function (Entry $entry) {
            $mite_access_id = null;
            if ($entry->project != null) {
                $mite_access_id = $entry->project->mite_access_id;
            } else if ($entry->service != null) {
                $mite_access_id = $entry->service->mite_access_id;
            } else {
                $mite_access_id = null;
            }
            if ($mite_access_id === null) {
                $entry->delete();
            } else {
                $entry->mite_access_id = $mite_access_id;
                $entry->save();
            }
        });

        Schema::table('entries', function (Blueprint $table) {
            $table->foreignUuid('mite_access_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('mite_access_id');
        });
    }
};
