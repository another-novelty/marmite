<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mite_accesses', function (Blueprint $table) {
            $table->string('name')->after('access_token')->nullable();
        });

        // for each user
        $users = User::all();
        foreach ($users as $user) {
            // for each mite access
            $n = 0;
            foreach ($user->miteAccesses as $miteAccess) {
                // get the mite access token
                $accessToken = $miteAccess->access_token;

                // update the mite access name
                $miteAccess->name = 'Mite ' . ++$n;
                $miteAccess->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mite_accesses', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
};
