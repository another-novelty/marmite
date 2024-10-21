<?php

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
        Schema::create('entries', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->timestamp('last_sync_at')->nullable();
            $table->integer('mite_id')->required()->unique();
            $table->foreignUuid('service_id')->constrained()->onDelete('cascade')->nullable();
            $table->foreignUuid('project_id')->constrained()->onDelete('cascade')->nullable();
            $table->string('note')->default('');
            $table->dateTime('date_at')->required();
            $table->integer('minutes')->required();
            $table->boolean('locked')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entries');
    }
};